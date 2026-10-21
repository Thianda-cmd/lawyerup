/** Small toolkit shared by the background painters. Canvas is 1600 x 900. */

export const W = 1600;
export const H = 900;

/** Deterministic PRNG so scenes look the same every time. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function svg(inner: string, extraClass = ''): string {
  return `<svg class="bg-svg ${extraClass}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

export function linear(id: string, stops: [number, string, number?][], x2 = 0, y2 = 1, x1 = 0, y1 = 0): string {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
    .map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`)
    .join('')}</linearGradient>`;
}

export function radial(id: string, stops: [number, string, number?][], cx = 0.5, cy = 0.5, r = 0.5): string {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${stops
    .map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op !== undefined ? ` stop-opacity="${op}"` : ''}/>`)
    .join('')}</radialGradient>`;
}

export function blur(id: string, sd: number): string {
  return `<filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
}

export function vignette(u: string, strength = 0.75): string {
  return `${radial(`${u}vig`, [[0.55, '#000', 0], [1, '#000', strength]], 0.5, 0.48, 0.75)}<rect width="${W}" height="${H}" fill="url(#${u}vig)"/>`;
}

/** A soft glowing light cone. */
export function cone(u: string, name: string, x1: number, y1: number, w1: number, x2: number, y2: number, w2: number, color: string, op = 0.35): string {
  const g = `${u}cone${name}`;
  return `${linear(g, [[0, color, op], [1, color, 0]], x2 > x1 ? 0.3 : -0.3, 1)}
    <path d="M ${x1 - w1 / 2} ${y1} L ${x1 + w1 / 2} ${y1} L ${x2 + w2 / 2} ${y2} L ${x2 - w2 / 2} ${y2} Z" fill="url(#${g})" style="mix-blend-mode:screen"/>`;
}

export function glow(u: string, name: string, cx: number, cy: number, rx: number, ry: number, color: string, op = 0.6): string {
  const g = `${u}glow${name}`;
  return `${radial(g, [[0, color, op], [0.4, color, op * 0.4], [1, color, 0]])}<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${g})" style="mix-blend-mode:screen"/>`;
}

/** Wooden panelled wainscot. */
export function panels(x: number, y: number, w: number, h: number, n: number, base: string, dark: string, light: string): string {
  const pw = w / n;
  let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${base}"/>`;
  for (let i = 0; i < n; i++) {
    const px = x + i * pw + 14;
    out += `<rect x="${px}" y="${y + 18}" width="${pw - 28}" height="${h - 36}" fill="${dark}" opacity="0.55"/>
      <path d="M ${px} ${y + h - 18} L ${px} ${y + 18} L ${px + pw - 28} ${y + 18}" fill="none" stroke="${light}" stroke-width="3" opacity="0.5"/>
      <path d="M ${px + pw - 28} ${y + 18} L ${px + pw - 28} ${y + h - 18} L ${px} ${y + h - 18}" fill="none" stroke="#000" stroke-width="3" opacity="0.35"/>`;
  }
  out += `<rect x="${x}" y="${y}" width="${w}" height="8" fill="${light}" opacity="0.6"/>`;
  return out;
}

/** Window blinds with light bleeding through. */
export function blinds(x: number, y: number, w: number, h: number, slat: number, color: string, gapOpacity = 0.85): string {
  let out = '';
  for (let yy = y; yy < y + h; yy += slat) {
    out += `<rect x="${x}" y="${yy}" width="${w}" height="${slat * 0.62}" fill="${color}" opacity="${gapOpacity}"/>
      <rect x="${x}" y="${yy + slat * 0.5}" width="${w}" height="${slat * 0.12}" fill="#000" opacity="0.25"/>`;
  }
  return out;
}

export function stars(r: () => number, n: number, maxY: number): string {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = r() * W;
    const y = r() * maxY;
    const s = r() * 1.6 + 0.4;
    out += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${s.toFixed(1)}" fill="#fff" opacity="${(0.3 + r() * 0.6).toFixed(2)}"${r() > 0.85 ? ` class="twinkle" style="animation-delay:${(-r() * 4).toFixed(1)}s"` : ''}/>`;
  }
  return out;
}

/** A row of skyline buildings with lit windows. */
export function skyline(r: () => number, baseY: number, minH: number, maxH: number, color: string, windowColor: string, density = 0.35, x0 = -20, x1 = W + 20): string {
  let out = '';
  let x = x0;
  while (x < x1) {
    const bw = 50 + r() * 110;
    const bh = minH + r() * (maxH - minH);
    const top = baseY - bh;
    out += `<rect x="${x.toFixed(0)}" y="${top.toFixed(0)}" width="${bw.toFixed(0)}" height="${(bh + 4).toFixed(0)}" fill="${color}"/>`;
    if (r() > 0.7) out += `<rect x="${(x + bw / 2 - 2).toFixed(0)}" y="${(top - 30).toFixed(0)}" width="4" height="30" fill="${color}"/><circle cx="${(x + bw / 2).toFixed(0)}" cy="${(top - 32).toFixed(0)}" r="3" fill="#ff4d4d" class="blink-slow"/>`;
    for (let wy = top + 12; wy < baseY - 10; wy += 16) {
      for (let wx = x + 8; wx < x + bw - 10; wx += 13) {
        if (r() < density) out += `<rect x="${wx.toFixed(0)}" y="${wy.toFixed(0)}" width="6" height="8" fill="${windowColor}" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`;
      }
    }
    x += bw + r() * 8;
  }
  return out;
}

export function palm(x: number, y: number, h: number, color: string, lean = 0): string {
  const topX = x + lean;
  const topY = y - h;
  const fronds = [-150, -120, -95, -70, -40, -15, 10, 35]
    .map((a) => {
      const rad = (a * Math.PI) / 180;
      const len = 110 + (Math.abs(a + 55) % 40);
      const ex = topX + Math.cos(rad) * len;
      const ey = topY + Math.sin(rad) * len * 0.6 + len * 0.35;
      const mx = topX + Math.cos(rad) * len * 0.5;
      const my = topY + Math.sin(rad) * len * 0.5 - 20;
      return `<path d="M ${topX} ${topY} Q ${mx} ${my} ${ex} ${ey} Q ${mx + 6} ${my + 14} ${topX} ${topY + 6} Z" fill="${color}"/>`;
    })
    .join('');
  return `<path d="M ${x - 7} ${y} Q ${x + lean * 0.3} ${y - h * 0.5} ${topX - 3} ${topY} L ${topX + 3} ${topY} Q ${x + lean * 0.3 + 8} ${y - h * 0.5} ${x + 7} ${y} Z" fill="${color}"/>${fronds}`;
}

export function text(x: number, y: number, s: string, size: number, fill: string, opts: { family?: string; weight?: number; anchor?: string; extra?: string; spacing?: number } = {}): string {
  return `<text x="${x}" y="${y}" font-family="${opts.family ?? "'Inter', sans-serif"}" font-size="${size}" font-weight="${opts.weight ?? 700}" text-anchor="${opts.anchor ?? 'middle'}" fill="${fill}"${opts.spacing ? ` letter-spacing="${opts.spacing}"` : ''} ${opts.extra ?? ''}>${s}</text>`;
}

/** Neon text: blurred glow plus crisp core. */
export function neon(u: string, name: string, x: number, y: number, s: string, size: number, color: string, opts: { family?: string; flicker?: boolean; anchor?: string } = {}): string {
  const f = `${u}neon${name}`;
  const fam = opts.family ?? "'Yellowtail', cursive";
  return `${blur(f, size / 7)}<g class="${opts.flicker ? 'neon-flicker' : ''}">
    ${text(x, y, s, size, color, { family: fam, weight: 400, anchor: opts.anchor, extra: `filter="url(#${f})" opacity="0.9"` })}
    ${text(x, y, s, size, color, { family: fam, weight: 400, anchor: opts.anchor, extra: `filter="url(#${f})" opacity="0.6"` })}
    ${text(x, y, s, size, '#fff', { family: fam, weight: 400, anchor: opts.anchor, extra: `stroke="${color}" stroke-width="${size / 18}" opacity="0.95"` })}
  </g>`;
}
