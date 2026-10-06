import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';

async function fetchWikiImageURL(query) {
  try {
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=1&prop=imageinfo&iiprop=url&format=json`;
    const res = await axios.get(searchUrl, { timeout: 10000 });
    const pages = res.data?.query?.pages;
    if (pages) {
      const firstPageId = Object.keys(pages)[0];
      const imageUrl = pages[firstPageId]?.imageinfo?.[0]?.url;
      if (imageUrl && !imageUrl.toLowerCase().endsWith('.svg')) {
        return imageUrl;
      }
    }
  } catch (err) {}
  return null;
}

async function downloadAndOptimize(url, outputPath) {
  try {
    const response = await axios({ url, responseType: 'arraybuffer', timeout: 15000 });
    const buffer = Buffer.from(response.data, 'binary');
    await sharp(buffer)
      .resize(400, 400, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputPath);
    return true;
  } catch (err) {
    return false;
  }
}

async function processFoods() {
  const foodsPath = path.resolve('src/data/foods.json');
  const outDir = path.resolve('public/foods');
  
  await fs.mkdir(outDir, { recursive: true });
  let data = JSON.parse(await fs.readFile(foodsPath, 'utf8'));
  let count = 0;

  for (let i = 0; i < data.length; i++) {
    const food = data[i];
    const imageFilename = path.basename(food.image);
    const imagePath = path.join(outDir, imageFilename);

    try {
      await fs.access(imagePath);
      count++;
      continue;
    } catch {}

    let imgUrl = await fetchWikiImageURL(food.nameEn);
    if (!imgUrl) imgUrl = await fetchWikiImageURL(food.nameBn);
    if (!imgUrl) {
       const keywords = food.nameEn.split(' ');
       imgUrl = await fetchWikiImageURL(keywords[keywords.length - 1] + ' food');
    }

    if (imgUrl) {
      const success = await downloadAndOptimize(imgUrl, imagePath);
      if(success) count++;
    }
  }
  console.log("Successfully fetched: " + count + " / " + data.length);
}
processFoods();
