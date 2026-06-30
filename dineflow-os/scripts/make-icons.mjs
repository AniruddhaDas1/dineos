import { writeFileSync } from "node:fs";

// Generate the PWA icon set: gold circle on a near-black rounded square.
// Runs offline; no network needed. `node scripts/make-icons.mjs`
const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#0E0E10"/>
  <circle cx="${size / 2}" cy="${size / 2}" r="${Math.round(size * 0.3)}" fill="#C9A24B"/>
</svg>`;

writeFileSync("public/icon-192.svg", svg(192));
writeFileSync("public/icon-512.svg", svg(512));
console.log("icons written: public/icon-192.svg, public/icon-512.svg");
