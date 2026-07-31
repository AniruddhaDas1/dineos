export function hexToHslTriplet(hex: string): string {
  let h = hex.replace("#", "");
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let hue = 0;
  let sat = 0;
  const light = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        hue = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        hue = (b - r) / d + 2;
        break;
      case b:
        hue = (r - g) / d + 4;
        break;
    }
    hue /= 6;
  }

  const hRound = Math.round(hue * 360);
  const sRound = Math.round(sat * 100);
  const lRound = Math.round(light * 100);
  return `${hRound} ${sRound}% ${lRound}%`;
}

export function hslTripletToHex(triplet: string): string {
  const [hStr, sStr, lStr] = triplet.split(" ");
  const h = parseInt(hStr, 10) / 360;
  const s = parseInt(sStr.replace("%", ""), 10) / 100;
  const l = parseInt(lStr.replace("%", ""), 10) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const v = Math.round(x * 255).toString(16);
    return v.length === 1 ? "0" + v : v;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
