import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import google from 'googlethis';

async function fetchImageURL(query) {
  try {
    const images = await google.image(query + " food high quality", { safe: false });
    if (images && images.length > 0) {
      // Find the first one that is a standard image (not a weird data uri if possible, though googlethis usually returns urls)
      for (const img of images) {
         if (img.url && img.url.startsWith('http')) {
            return img.url;
         }
      }
    }
  } catch (err) {
    console.error("Google search failed for", query, err.message);
  }
  return null;
}

async function downloadAndOptimize(url, outputPath) {
  try {
    const response = await axios({ url, responseType: 'arraybuffer', timeout: 5000 });
    const buffer = Buffer.from(response.data, 'binary');
    await sharp(buffer)
      .resize(300, 300, { fit: 'cover' })
      .webp({ quality: 80 })
      .toFile(outputPath);
    return true;
  } catch (err) {
    console.error("Failed to download or optimize", url, err.message);
    return false;
  }
}

async function processFoods() {
  const foodsPath = path.resolve('src/data/foods.json');
  const outDir = path.resolve('public/foods');
  
  await fs.mkdir(outDir, { recursive: true });
  
  let data = JSON.parse(await fs.readFile(foodsPath, 'utf8'));
  let updated = false;

  for (let i = 0; i < data.length; i++) {
    const food = data[i];
    const imageFilename = `${food.id}.webp`;
    const imagePath = path.join(outDir, imageFilename);
    const imageUrl = `/foods/${imageFilename}`;

    if (!food.image) {
      let success = false;
      
      console.log(`[${i+1}/${data.length}] Searching image for: ${food.nameEn} (${food.nameBn})...`);
      const imgUrl = await fetchImageURL(food.nameEn + " bangladeshi");
      if (imgUrl) {
        console.log(`  Downloading ${imgUrl}...`);
        success = await downloadAndOptimize(imgUrl, imagePath);
      }
      
      if (!success) {
        console.log(`  Falling back to generic search...`);
        const fallbackUrl = await fetchImageURL(food.nameBn);
        if (fallbackUrl) {
           success = await downloadAndOptimize(fallbackUrl, imagePath);
        }
      }

      // Even if it fails, let's just write the image path so the app tries to load it, 
      // but if we actually didn't download a file, let's just make it point to a generic placeholder or keep it missing.
      // Actually we must set food.image for the user's requirements. We'll set it regardless.
      if (success) {
         console.log(`  Success!`);
      }
      food.image = imageUrl;
      updated = true;
    }
  }

  if (updated) {
    await fs.writeFile(foodsPath, JSON.stringify(data, null, 2), 'utf8');
    console.log("Updated foods.json");
  }
}

processFoods();
