// Builds a district-level (64) SVG map from the upazila-level GeoJSON.
// Output: src/data/bdMap.json  { width, height, districts: [{ id, d, cx, cy }] }
import fs from 'node:fs';
import { geoMercator, geoPath } from 'd3-geo';
import polygonClipping from 'polygon-clipping';

const geo = JSON.parse(fs.readFileSync('public/bangladesh.geojson', 'utf8'));

const ALIAS = { sirajgonj: 'sirajganj', nawabganj: 'chapainawabganj', 'cox-s-bazar': 'coxsbazar', coxsbazar: 'coxsbazar' };
const slug = (s) => {
  const base = s.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return ALIAS[base] || base;
};

const feats = geo.features.map((f, i) => ({
  i,
  name: f.properties.name,
  id: f.properties.district_name ? slug(f.properties.district_name) : null,
  geom: f.geometry,
}));
const districtIds = [...new Set(feats.map((f) => f.id).filter(Boolean))];
console.log('districts found:', districtIds.length);

// ---- Name hints for unassigned features ------------------------------------
const HINTS = [
  ['chuadanga', 'chuadanga'], ['comilla', 'cumilla'], ['khagrachhari', 'khagrachari'],
  ["cox's bazar", 'coxsbazar'], ['sunamganj', 'sunamganj'], ['joypurhat', 'joypurhat'],
  ['lalmonirhat', 'lalmonirhat'], ['maulvi bazar', 'maulvibazar'], ['meherpur', 'meherpur'],
  ['narail', 'narail'], ['narayanganj', 'narayanganj'], ['netrokona', 'netrokona'],
  ['shariatpur', 'shariatpur'], ['gazipur', 'gazipur'], ['khulna sadar', 'khulna'],
];
for (const f of feats) {
  if (f.id) continue;
  const n = f.name.toLowerCase();
  const h = HINTS.find(([k]) => n.includes(k));
  if (h) f.id = h[1];
}

// ---- Vertex spatial hash for adjacency propagation --------------------------
const rings = (geom) =>
  geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates; // array of polygons
const verts = (geom) => rings(geom).flatMap((poly) => poly.flatMap((r) => r));
const key = (x, y, e) => `${Math.round(x / e)}:${Math.round(y / e)}`;

function propagate(eps) {
  let changed = true;
  while (changed) {
    changed = false;
    const grid = new Map();
    for (const f of feats) {
      if (!f.id) continue;
      for (const [x, y] of verts(f.geom)) {
        const k = key(x, y, eps);
        if (!grid.has(k)) grid.set(k, new Map());
        const m = grid.get(k);
        m.set(f.id, (m.get(f.id) || 0) + 1);
      }
    }
    for (const f of feats) {
      if (f.id) continue;
      const score = new Map();
      for (const [x, y] of verts(f.geom)) {
        const cx = Math.round(x / eps), cy = Math.round(y / eps);
        for (let dx = -1; dx <= 1; dx++)
          for (let dy = -1; dy <= 1; dy++) {
            const m = grid.get(`${cx + dx}:${cy + dy}`);
            if (m) for (const [id, c] of m) score.set(id, (score.get(id) || 0) + c);
          }
      }
      if (score.size) {
        f.id = [...score.entries()].sort((a, b) => b[1] - a[1])[0][0];
        changed = true;
      }
    }
  }
}
for (const eps of [0.0005, 0.002, 0.008, 0.03]) propagate(eps);
const left = feats.filter((f) => !f.id);
console.log('still unassigned:', left.length, left.map((f) => f.name).join(','));

// ---- Dissolve per district ---------------------------------------------------
const round = (n) => Math.round(n * 1000) / 1000;

function dp(pts, tol) {
  if (pts.length < 3) return pts;
  const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1];
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1e-12;
  let maxD = 0, idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + bx * ay - by * ax) / len;
    if (d > maxD) { maxD = d; idx = i; }
  }
  if (maxD > tol) {
    const l = dp(pts.slice(0, idx + 1), tol), r = dp(pts.slice(idx), tol);
    return l.slice(0, -1).concat(r);
  }
  return [pts[0], pts[pts.length - 1]];
}
function simplifyRing(ring, tol) {
  const open = ring.slice(0, -1);
  if (open.length < 8) return ring;
  const mid = Math.floor(open.length / 2);
  const a = dp(open.slice(0, mid + 1), tol), b = dp(open.slice(mid).concat([open[0]]), tol);
  const res = a.slice(0, -1).concat(b);
  return res.length >= 4 ? res : ring;
}
const width = 700, height = 900;
const allPts = feats.flatMap(f => rings(f.geom).flatMap(poly => poly.flatMap(r => r)));
const projection = geoMercator().fitExtent([[10, 10], [width - 10, height - 10]], { type: 'MultiPoint', coordinates: allPts });

const dissolved = districtIds.map((id) => {
  const polys = feats
    .filter((f) => f.id === id)
    .flatMap((f) => rings(f.geom))
    .map((p) => p.map((r) => r.map(([lon, lat]) => {
      const pt = projection([lon, lat]);
      return [round(pt[0]), round(pt[1])];
    })));
  
  const multi = polygonClipping.union(polys[0], ...polys.slice(1)).map((poly) =>
    poly.map((r) => simplifyRing(r, 0.5)) // 0.5 pixel tolerance
  );
  
  // Calculate centroid
  let cx = 0, cy = 0, pts = 0;
  for(const poly of multi) {
    for(const pt of poly[0]) {
      cx += pt[0]; cy += pt[1]; pts++;
    }
  }
  
  // Create SVG path string manually to avoid d3-geo pathing issues
  const d = multi.map(poly => {
    return poly.map(ring => {
      return 'M' + ring.map(pt => `${pt[0]},${pt[1]}`).join('L') + 'Z';
    }).join('');
  }).join('');
  
  return { id, d, cx: Math.round(cx/pts), cy: Math.round(cy/pts) };
});

const out = { width, height, districts: dissolved };
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/bdMap.json', JSON.stringify(out));
console.log('written bdMap.json', (JSON.stringify(out).length / 1024).toFixed(0), 'KB');
