import fs from 'node:fs';

const mapData = JSON.parse(fs.readFileSync('src/data/bdMap.json', 'utf8'));

console.log(`Number of districts: ${mapData.districts.length}`);

let hasOldPattern = false;
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

mapData.districts.forEach(d => {
  if (d.d.includes('690,110')) {
    hasOldPattern = true;
  }
  
  // Extract all coordinates from the path data
  const matches = d.d.matchAll(/(-?\d+\.?\d*)/g);
  let coords = Array.from(matches).map(m => parseFloat(m[1]));
  
  // Quick bounds approximation (ignoring commands, just numbers)
  // X and Y alternate in SVG absolute commands mostly
  for (let i = 0; i < coords.length; i += 2) {
    const x = coords[i];
    const y = coords[i+1];
    if (!isNaN(x)) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
    if (!isNaN(y)) {
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
});

console.log(`Contains old pattern "690,110": ${hasOldPattern}`);
console.log(`Overall paths bounding box: X[${minX.toFixed(1)}, ${maxX.toFixed(1)}], Y[${minY.toFixed(1)}, ${maxY.toFixed(1)}]`);
console.log(`SVG viewBox: 0 0 ${mapData.width} ${mapData.height}`);

// Create an SVG file to visualize it
const sampleColors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4'];

const svgPaths = mapData.districts.map((d, i) => {
  // Select a few to color
  const isSelected = i % 8 === 0; 
  const fill = isSelected ? sampleColors[i / 8] : '#e4ddcc';
  return `<path id="${d.id}" d="${d.d}" fill="${fill}" stroke="#ffffff" stroke-width="1.1" />`;
}).join('\n');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mapData.width} ${mapData.height}">
  ${svgPaths}
</svg>`;

const outPath = 'public/map-preview.svg';
fs.writeFileSync(outPath, svgContent, 'utf8');
console.log(`Wrote preview SVG to ${outPath}`);
