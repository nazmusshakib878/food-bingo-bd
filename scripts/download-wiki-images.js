import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';

const UA = { 'User-Agent': 'FoodBingoBD/1.0 (https://github.com/nazmusshakib878/food-bingo-bd)' };

// Extra search hints for foods whose English name is not a good Commons query
const HINTS = {
  'Vapa Pitha': ['Bhapa pitha', 'Bhapa pitha Bangladesh'],
  'Chitoi Pitha': ['Chitoi pitha', 'Chitoi pitha Bangladesh'],
  'Patishapta': ['Patishapta pitha', 'Patishapta'],
  'Bibi Khana Pitha': ['Bibikhana pitha'],
  'Kholaja Pitha': ['Kholaja pitha'],
  'Chunga Pura Pitha': ['Chunga pitha', 'Bamboo cake Bangladesh'],
  'Nokshi Pitha': ['Nakshi pitha', 'Nokshi pitha'],
  'Cumilla Rasmalai': ['Rasmalai', 'Ras malai Comilla'],
  'Bogura Doi': ['Bogra doi', 'Bogurar doi', 'Mishti doi'],
  'Natore Kachagolla': ['Kachagolla', 'Kacha golla'],
  'Porabari Chomchom': ['Chomchom Porabari', 'Cham cham sweet Bangladesh'],
  'Muktagacha Monda': ['Muktagachha monda', 'Muktagacha monda'],
  'Tiler Khaja': ['Khaja sweet Kushtia', 'Tiler khaja'],
  'Balish Mishti': ['Balish mishti', 'Pillow sweet Bangladesh'],
  'Brahmanbaria Chanamukhi': ['Chanamukhi', 'Chhanamukhi'],
  'Sherpur Chanar Payesh': ['Chanar payesh', 'Payesh Bangladesh'],
  'Ashtagram Cheese': ['Ashtagram cheese', 'Ashtagram panir'],
  'Munshiganj Patkhir': ['Patkhir', 'Pat khir'],
  'Buffalo Yogurt': ['Curd Bangladesh','Doi yogurt clay pot','Dahi earthen pot'],
  'Gopalganj Rasgulla': ['Rasgulla Bangladesh', 'Rasgulla'],
  'Jamurki Sandesh': ['Sandesh Mirzapur', 'Sandesh sweet Bangladesh'],
  'Sabitri Mishti': ['Sabitri mishti', 'Meherpur sweet'],
  'Pabna Pera Mishti': ['Pera Bangladesh sweet','Pabna sweet'],
  'Shahi Jilapi': ['Jilapi Bangladesh', 'Jalebi'],
  'Jashore Khejur Gur': ['Khejur gur', 'Date palm jaggery Bangladesh'],
  'Sirajganj Pantua': ['Pantua', 'Pantua sweet'],
  'Khirsapat Mango': ['Khirsapat','Khirshapati mango','Khirsapati mango Bangladesh'],
  'Haribhanga Mango': ['Haribhanga mango', 'Mango Rangpur'],
  'Sundarbans Honey': ['Sundarbans honey', 'Honey collection Sundarbans'],
  'Narsingdi Lotkon': ['Lotkon', 'Latkan fruit', 'Burmese grape Baccaurea ramiflora'],
  'Madhupur Pineapple': ['Madhupur pineapple', 'Pineapple Bangladesh'],
  'Barishal Amra': ['Spondias dulcis', 'Hog plum Bangladesh', 'Amra fruit'],
  'Dinajpur Bedana Litchi': ['Lychee Bangladesh', 'Litchi Dinajpur'],
  'Rajshahi Fazli Mango': ['Fazli mango', 'Fazli mango Rajshahi'],
  'Fuchka': ['Fuchka', 'Phuchka', 'Fuchka Bangladesh'],
  'Shahi Halim': ['Haleem Bangladesh', 'Haleem'],
  'Bela Biscuit': ['Bela biscuit','Chittagong biscuit','Biscuits in plate'],
  'Kataribhog Rice': ['Kataribhog rice', 'Katarivog rice'],
  'Tulshimala Rice': ['Tulshimala','Cooked rice Bangladesh','Polao rice'],
  'Borhani': ['Borhani', 'Borhani drink'],
  'Seven Color Tea': ['Seven layer tea Sreemangal', 'Seven colour tea', 'Tea Sreemangal'],
  'Bakarkhani': ['Bakarkhani', 'Bakarkhani bread'],
};

const OK_EXT = /\.(jpe?g|png|webp)$/i;
const BAD = /(logo|map|flag|diagram|icon|stamp|poster|painting|drawing|portrait|svg|statue|temple)/i;

async function searchCommons(query) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=800&format=json`;
  try {
    const res = await axios.get(url, { timeout: 15000, headers: UA });
    const pages = Object.values(res.data?.query?.pages || {});
    return pages
      .map((p) => ({
        title: p.title,
        url: p.imageinfo?.[0]?.thumburl || p.imageinfo?.[0]?.url,
        page: p.imageinfo?.[0]?.descriptionurl,
        w: p.imageinfo?.[0]?.width,
        h: p.imageinfo?.[0]?.height,
        license: p.imageinfo?.[0]?.extmetadata?.LicenseShortName?.value || '',
        index: p.index,
      }))
      .filter((c) => c.url && OK_EXT.test(c.title) && !BAD.test(c.title) && c.w >= 400 && c.h >= 400)
      .sort((a, b) => a.index - b.index);
  } catch {
    return [];
  }
}

async function main() {
  const foodsPath = path.resolve('src/data/foods.json');
  const outDir = path.resolve('public/foods');
  const logPath = path.resolve('src/data/foodImageSources.json');
  await fs.mkdir(outDir, { recursive: true });
  const foods = JSON.parse(await fs.readFile(foodsPath, 'utf8'));
  let log = {};
  try { log = JSON.parse(await fs.readFile(logPath, 'utf8')); } catch {}
  const missing = [];

  for (const food of foods) {
    const out = path.join(outDir, path.basename(food.image));
    try { await fs.access(out); continue; } catch {}

    const queries = [...(HINTS[food.nameEn] || []), food.nameEn, `${food.nameEn} food`];
    let done = false;
    for (const q of queries) {
      const cands = await searchCommons(q);
      for (const c of cands.slice(0, 2)) {
        try {
          const r = await axios.get(c.url, { responseType: 'arraybuffer', timeout: 20000, headers: UA });
          await sharp(Buffer.from(r.data)).resize(480, 480, { fit: 'cover' }).webp({ quality: 78 }).toFile(out);
          log[food.nameEn] = { source: 'wikimedia-commons', query: q, title: c.title, page: c.page, license: c.license };
          console.log(`OK   ${food.nameEn}  <- ${c.title}  [${c.license}]`);
          done = true;
          break;
        } catch {}
      }
      if (done) break;
    }
    if (!done) { missing.push(food.nameEn); console.log(`MISS ${food.nameEn}`); }
  }
  await fs.writeFile(logPath, JSON.stringify(log, null, 2));
  console.log('\nMISSING:', missing.length, JSON.stringify(missing));
}
main();

