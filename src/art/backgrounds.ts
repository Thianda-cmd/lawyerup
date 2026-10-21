/**
 * Painted backgrounds. Each scene is an SVG built from layered shapes,
 * gradients and a little SMIL/CSS animation (neon flicker, fans, lights).
 * `fg` is drawn in front of the characters (desks, glass, witness stands).
 */
import { CASE2_BACKGROUNDS } from './backgrounds2';
import { H, W, blinds, blur, cone, glow, linear, neon, palm, panels, radial, rng, skyline, stars, svg, text, vignette } from './bgkit';

export type ParticleMode = 'dust' | 'rain' | 'embers' | 'none' | 'glitter';

export interface BgDef {
  name: string;
  paint: (u: string) => string;
  fg?: (u: string) => string;
  particles?: ParticleMode;
  /** CSS color blended over characters to match the scene lighting. */
  tint?: string;
}

// ---------------------------------------------------------------------------
// TITLE — San Querida at night.

function title(u: string): string {
  const r = rng(7);
  return svg(`<defs>
    ${linear(`${u}sky`, [[0, '#070414'], [0.45, '#1d0c36'], [0.72, '#5a1a52'], [0.86, '#c2456a'], [1, '#f39a52']])}
    ${linear(`${u}street`, [[0, '#120a1e'], [1, '#05030a']])}
    ${radial(`${u}moon`, [[0, '#fff6e0'], [0.6, '#f5dcb0'], [1, '#e8b98a']])}
    ${blur(`${u}b8`, 8)}${blur(`${u}b30`, 30)}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}sky)"/>
  ${stars(r, 160, 420)}
  <circle cx="1260" cy="170" r="120" fill="#ffd9a8" opacity="0.18" filter="url(#${u}b30)"/>
  <circle cx="1260" cy="170" r="62" fill="url(#${u}moon)"/>
  <circle cx="1240" cy="150" r="10" fill="#e3c29a" opacity="0.6"/><circle cx="1282" cy="186" r="14" fill="#e3c29a" opacity="0.5"/><circle cx="1268" cy="140" r="6" fill="#e3c29a" opacity="0.6"/>
  <path d="M 0 600 L 120 540 L 220 570 L 360 500 L 470 548 L 600 520 L 760 560 L 900 505 L 1040 552 L 1180 515 L 1320 560 L 1460 520 L 1600 556 L 1600 640 L 0 640 Z" fill="#2a1238"/>
  ${skyline(r, 660, 60, 260, '#1a0f2c', '#ffc46b', 0.28)}
  ${skyline(r, 700, 30, 150, '#0f0a1c', '#ff8fb8', 0.2)}
  ${palm(150, 760, 300, '#07040d', 20)}${palm(330, 760, 240, '#07040d', -15)}${palm(1420, 760, 320, '#07040d', -25)}
  <rect y="700" width="${W}" height="200" fill="url(#${u}street)"/>
  <g filter="url(#${u}b8)" opacity="0.55">
    <rect x="880" y="705" width="40" height="190" fill="#ff3d8b"/><rect x="1010" y="705" width="26" height="190" fill="#33e0ff"/>
    <rect x="540" y="705" width="30" height="190" fill="#ffc46b"/><rect x="1230" y="705" width="20" height="190" fill="#ff3d8b"/>
  </g>
  <g>
    <rect x="780" y="560" width="560" height="150" fill="#140c22"/>
    <rect x="780" y="552" width="560" height="14" fill="#2c1a40"/>
    <rect x="800" y="600" width="120" height="110" fill="#33e0ff" opacity="0.18"/><rect x="940" y="600" width="120" height="110" fill="#ff3d8b" opacity="0.2"/>
    <rect x="1080" y="600" width="120" height="110" fill="#ffc46b" opacity="0.14"/><rect x="1220" y="600" width="100" height="110" fill="#000" opacity="0.4"/>
    ${neon(u, 'shop', 1060, 588, 'Vane &amp; Associates', 34, '#ff3d8b', { flicker: true })}
    ${neon(u, 'law', 860, 636, 'LAW', 22, '#33e0ff', { family: "'Inter', sans-serif" })}
    ${neon(u, 'open', 1260, 650, 'OPEN 24H', 18, '#ffc46b', { family: "'Inter', sans-serif" })}
  </g>
  ${vignette(u, 0.7)}`);
}

// ---------------------------------------------------------------------------
// OFFICE — Vane & Associates. (There are no associates.)

function office(u: string): string {
  const r = rng(11);
  const outside = `${skyline(r, 380, 30, 140, '#140d24', '#ffcf7a', 0.25, 120, 760)}
    <rect x="120" y="380" width="640" height="180" fill="#0d0a16"/>
    <rect x="160" y="300" width="250" height="80" fill="#1c1230"/>
    ${neon(u, 'chk', 285, 352, 'CHECKS CA$HED', 30, '#33e0ff', { family: "'Inter', sans-serif", flicker: true })}
    ${neon(u, 'nails', 600, 360, 'Nails', 46, '#ff3d8b')}
    <rect x="200" y="470" width="90" height="40" rx="8" fill="#2a2440"/><rect x="520" y="480" width="110" height="36" rx="8" fill="#3a1f2c"/>`;
  return svg(`<defs>
    ${linear(`${u}wall`, [[0, '#101a28'], [1, '#1f3040']])}
    ${linear(`${u}floor`, [[0, '#1a1418'], [1, '#0d0a0c']])}
    ${linear(`${u}desk`, [[0, '#5a3522'], [0.1, '#3e2417'], [1, '#1e110a']])}
    ${linear(`${u}sky`, [[0, '#05040c'], [1, '#2a1638']])}
    ${blur(`${u}b6`, 6)}${blur(`${u}b20`, 20)}
    <clipPath id="${u}win"><rect x="120" y="110" width="640" height="460"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}wall)"/>
  <g opacity="0.12">${Array.from({ length: 40 }, (_, i) => `<rect x="${i * 40}" y="0" width="14" height="${H}" fill="#6fa3b8"/>`).join('')}</g>
  <rect y="690" width="${W}" height="210" fill="url(#${u}floor)"/>
  <g clip-path="url(#${u}win)"><rect x="120" y="110" width="640" height="460" fill="url(#${u}sky)"/>${outside}</g>
  <g clip-path="url(#${u}win)">${blinds(120, 110, 640, 176, 22, '#c9b9a2', 0.95)}<rect x="120" y="286" width="640" height="16" fill="#b5a58e"/>${blinds(120, 302, 640, 268, 34, '#c9b9a2', 0.16)}</g>
  <path d="M 720 110 L 720 420" stroke="#d8ccb6" stroke-width="2"/><circle cx="720" cy="424" r="6" fill="#d8ccb6"/>
  <rect x="110" y="100" width="660" height="480" fill="none" stroke="#0a0f16" stroke-width="20"/>
  <rect x="100" y="575" width="680" height="22" fill="#2c3a48"/>
  ${neon(u, 'openr', 680, 545, 'NEPO', 30, '#ff4040', { family: "'Inter', sans-serif", flicker: true })}
  <g opacity="0.22" style="mix-blend-mode:screen" filter="url(#${u}b6)">
    ${Array.from({ length: 11 }, (_, i) => `<path d="M ${780} ${150 + i * 40} L ${1600} ${300 + i * 62} L ${1600} ${318 + i * 62} L ${780} ${162 + i * 40} Z" fill="${i % 2 ? '#ff3d8b' : '#33e0ff'}"/>`).join('')}
  </g>
  <g transform="translate(940 170) rotate(-4)">
    <rect width="190" height="140" fill="#c9a24a"/><rect x="10" y="10" width="170" height="120" fill="#f1e8d2"/>
    ${text(95, 48, 'JURIS DOCTOR', 13, '#3a2a18', { family: "'Playfair Display', serif" })}
    ${text(95, 72, 'Ezra J. Vane', 18, '#3a2a18', { family: "'Yellowtail', cursive", weight: 400 })}
    ${text(95, 98, 'Pacific Isles Correspondence', 9, '#6a5a40', { weight: 500 })}
    ${text(95, 110, 'School of Law', 9, '#6a5a40', { weight: 500 })}
    <circle cx="150" cy="110" r="12" fill="#b3303d"/>
  </g>
  <g transform="translate(1210 120)">
    <rect width="230" height="330" fill="#120a18" stroke="#c9a24a" stroke-width="6"/>
    ${radial(`${u}post`, [[0, '#6b1a3a'], [1, '#120a18']], 0.5, 0.4, 0.6)}
    <rect x="8" y="8" width="214" height="314" fill="url(#${u}post)"/>
    <ellipse cx="115" cy="130" rx="62" ry="36" fill="#f3e6c8"/><circle cx="115" cy="130" r="26" fill="#2a9d8f"/><circle cx="115" cy="130" r="12" fill="#0a0a0a"/><circle cx="106" cy="122" r="5" fill="#fff"/>
    <g stroke="#f3c86a" stroke-width="3">${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<path d="M ${115 + Math.cos(a) * 74} ${130 + Math.sin(a) * 48} L ${115 + Math.cos(a) * 96} ${130 + Math.sin(a) * 66}"/>`; }).join('')}</g>
    ${text(115, 236, 'THE GREAT', 20, '#f3c86a', { family: "'Playfair Display', serif", spacing: 4 })}
    ${text(115, 276, 'VANE', 44, '#f3e6c8', { family: "'Playfair Display', serif", weight: 800, spacing: 6 })}
    ${text(115, 304, 'HE KNOWS WHAT YOU’RE THINKING', 9, '#f3c86a', { spacing: 1 })}
  </g>
  <g transform="translate(1460 420)">
    <rect width="120" height="280" fill="#3a4450"/><rect x="8" y="10" width="104" height="80" fill="#46525f"/><rect x="8" y="100" width="104" height="80" fill="#46525f"/><rect x="8" y="190" width="104" height="80" fill="#46525f"/>
    <rect x="44" y="44" width="32" height="8" rx="3" fill="#9aa5b1"/><rect x="44" y="134" width="32" height="8" rx="3" fill="#9aa5b1"/><rect x="44" y="224" width="32" height="8" rx="3" fill="#9aa5b1"/>
    <path d="M 20 0 L 30 -40 L 60 -10 L 80 -50 L 100 0 Z" fill="#2d5a3a"/><rect x="34" y="-8" width="52" height="10" fill="#7a4a2a"/>
  </g>
  <g transform="translate(800 40)">
    <rect x="-4" y="-40" width="8" height="50" fill="#1a1a20"/>
    <g transform="translate(0 10) scale(1 0.2)"><g>
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2.4s" repeatCount="indefinite"/>
      <path d="M 0 0 L 230 -18 Q 250 0 230 18 Z" fill="#3a2c22"/><path d="M 0 0 L -230 18 Q -250 0 -230 -18 Z" fill="#3a2c22"/>
      <path d="M 0 0 L -18 -230 Q 0 -250 18 -230 Z" fill="#3a2c22"/><path d="M 0 0 L 18 230 Q 0 250 -18 230 Z" fill="#3a2c22"/>
    </g></g>
    <ellipse cx="0" cy="14" rx="26" ry="10" fill="#24242c"/>
  </g>
  ${glow(u, 'lamp', 360, 690, 360, 150, '#ffc46b', 0.5)}
  ${vignette(u, 0.8)}`);
}

function officeFg(u: string): string {
  return svg(`<defs>${linear(`${u}dk`, [[0, '#6a4029'], [0.06, '#4a2c1c'], [1, '#170d07']])}${blur(`${u}fb`, 14)}</defs>
    <path d="M -20 742 L 1620 742 L 1620 900 L -20 900 Z" fill="url(#${u}dk)"/>
    <rect x="-20" y="736" width="1640" height="12" fill="#7b4c31"/>
    <g transform="translate(250 600)">
      <path d="M 40 136 L 80 136 L 72 70 L 48 70 Z" fill="#b8913c"/>
      <path d="M -10 70 Q 60 20 130 70 Z" fill="#1f6b46" stroke="#0e3a25" stroke-width="3"/>
      <ellipse cx="60" cy="70" rx="70" ry="10" fill="#ffe2a0" opacity="0.8" filter="url(#${u}fb)"/>
      <rect x="20" y="132" width="80" height="8" rx="3" fill="#8a6a2c"/>
    </g>
    <g transform="translate(560 700)"><rect width="220" height="38" fill="#e9e2d0" transform="rotate(-3)"/><rect x="10" y="-14" width="220" height="38" fill="#d9cfb6" transform="rotate(2)"/><rect x="20" y="-30" width="210" height="34" fill="#c74b3b" transform="rotate(-1)"/></g>
    <g transform="translate(980 680)"><rect width="230" height="56" fill="#2a2018" stroke="#c9a24a" stroke-width="4"/>${text(115, 36, 'EZRA VANE, ESQ.', 20, '#e9cf8a', { family: "'Playfair Display', serif", spacing: 2 })}</g>
    <g transform="translate(1300 650)"><path d="M 0 0 L 60 0 L 54 86 L 6 86 Z" fill="#f2efe6"/><path d="M 60 20 Q 86 24 84 46 Q 82 66 56 64" fill="none" stroke="#f2efe6" stroke-width="9"/>${text(30, 46, '#1', 20, '#b3303d', { weight: 800 })}${text(30, 64, 'LAWYER', 9, '#b3303d', { weight: 800 })}</g>
    <g transform="translate(1440 700)">${[0, 1, 2, 3, 4].map((i) => `<g transform="rotate(${-30 + i * 14} 40 60)"><rect x="20" y="-20" width="44" height="64" rx="5" fill="#f7f3ea" stroke="#333" stroke-width="2"/><text x="30" y="-2" font-size="14" font-family="Inter" font-weight="800" fill="${i % 2 ? '#b3303d' : '#111'}">${['A', 'K', 'Q', 'J', '10'][i]}</text></g>`).join('')}</g>`);
}

// ---------------------------------------------------------------------------
// DETENTION — County visiting room.

function detention(u: string): string {
  return svg(`<defs>
    ${linear(`${u}w`, [[0, '#6f8079'], [1, '#56665f']])}
    ${linear(`${u}lo`, [[0, '#33494a'], [1, '#22302f']])}
    ${blur(`${u}b`, 12)}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}w)"/>
  <g stroke="#45534d" stroke-width="3" opacity="0.6">
    ${Array.from({ length: 16 }, (_, row) => `<path d="M 0 ${row * 50} L ${W} ${row * 50}"/>${Array.from({ length: 9 }, (_, i) => `<path d="M ${i * 200 + (row % 2) * 100} ${row * 50} L ${i * 200 + (row % 2) * 100} ${row * 50 + 50}"/>`).join('')}`).join('')}
  </g>
  <rect y="520" width="${W}" height="380" fill="url(#${u}lo)"/>
  <rect y="512" width="${W}" height="10" fill="#c9b85a" opacity="0.6"/>
  <g transform="translate(1080 210)"><rect width="200" height="330" fill="#3c4a4f" stroke="#283236" stroke-width="8"/><rect x="60" y="40" width="80" height="90" fill="#9fb7b6" opacity="0.5"/><path d="M 60 40 L 140 130 M 140 40 L 60 130" stroke="#283236" stroke-width="3"/><circle cx="170" cy="190" r="10" fill="#b9b9a0"/></g>
  <g transform="translate(330 200)"><rect width="300" height="90" fill="#efe9d6" stroke="#3a3a2a" stroke-width="4"/>${text(150, 40, 'VISITATION', 26, '#28343a', { spacing: 4 })}${text(150, 70, '20 MINUTE LIMIT • NO CONTACT', 14, '#a03030')}</g>
  <g transform="translate(800 150)"><circle r="44" fill="#efe9d6" stroke="#28343a" stroke-width="6"/><path d="M 0 0 L 0 -30 M 0 0 L 22 8" stroke="#28343a" stroke-width="5" stroke-linecap="round"/></g>
  <rect x="200" y="10" width="1200" height="26" rx="10" fill="#f4fff8"/>
  <g class="fluoro">${glow(u, 'tube', 800, 30, 900, 140, '#e8fff4', 0.55)}</g>
  ${vignette(u, 0.6)}`);
}

function detentionFg(u: string): string {
  return svg(`<defs>${linear(`${u}glass`, [[0, '#cfe8e6', 0.12], [0.5, '#cfe8e6', 0.04], [1, '#cfe8e6', 0.1]], 1, 0)}${linear(`${u}ctr`, [[0, '#8c9592'], [0.08, '#5e6865'], [1, '#2a302e']])}</defs>
    <rect x="160" y="60" width="1280" height="700" fill="url(#${u}glass)" stroke="#2f3a38" stroke-width="10"/>
    <path d="M 260 80 L 520 740 M 330 80 L 560 680 M 1100 90 L 1300 720" stroke="#fff" stroke-width="18" opacity="0.06"/>
    <path d="M 200 120 L 330 460" stroke="#fff" stroke-width="5" opacity="0.12"/>
    <rect x="0" y="0" width="170" height="${H}" fill="#3d4744"/><rect x="1430" y="0" width="170" height="${H}" fill="#3d4744"/>
    <rect x="160" y="0" width="14" height="${H}" fill="#2a3230"/><rect x="1426" y="0" width="14" height="${H}" fill="#2a3230"/>
    <path d="M -10 760 L 1610 760 L 1610 900 L -10 900 Z" fill="url(#${u}ctr)"/>
    <rect x="-10" y="752" width="1620" height="12" fill="#a9b2ae"/>
    <g transform="translate(60 330)"><rect x="-10" y="-20" width="80" height="160" rx="10" fill="#22282a"/><path d="M 30 0 C -20 10 -20 120 30 130" fill="none" stroke="#111" stroke-width="22" stroke-linecap="round"/><path d="M 30 130 C 60 200 40 320 70 420" fill="none" stroke="#111" stroke-width="5"/></g>`);
}

// ---------------------------------------------------------------------------
// STAGE — The Paramount Theater, seen from the house.

function curtain(x: number, w: number, top: number, bottom: number, folds: number, color: string, dark: string, sway = 0): string {
  let out = `<path d="M ${x} ${top} L ${x + w} ${top} L ${x + w + sway} ${bottom} L ${x + sway} ${bottom} Z" fill="${color}"/>`;
  const fw = w / folds;
  for (let i = 0; i < folds; i++) {
    const fx = x + i * fw;
    out += `<path d="M ${fx + fw * 0.55} ${top} L ${fx + fw} ${top} L ${fx + fw + sway} ${bottom} L ${fx + fw * 0.6 + sway} ${bottom} Z" fill="${dark}" opacity="0.55"/>
      <path d="M ${fx + fw * 0.2} ${top} L ${fx + fw * 0.32} ${top} L ${fx + fw * 0.34 + sway} ${bottom} L ${fx + fw * 0.22 + sway} ${bottom} Z" fill="#fff" opacity="0.08"/>`;
  }
  return out;
}

function stage(u: string): string {
  const bulbs = (x1: number, y1: number, x2: number, y2: number, n: number) =>
    Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      return `<circle cx="${x1 + (x2 - x1) * t}" cy="${y1 + (y2 - y1) * t}" r="6" fill="#ffe7a8" class="chase" style="animation-delay:${(i % 4) * 0.25}s"/>`;
    }).join('');
  return svg(`<defs>
    ${linear(`${u}floor`, [[0, '#3a2414'], [1, '#6b4426']])}
    ${linear(`${u}back`, [[0, '#14060c'], [1, '#2a0d18']])}
    ${linear(`${u}gold`, [[0, '#f3d27a'], [0.5, '#b98a2e'], [1, '#6e4f17']], 1, 0)}
    ${radial(`${u}pool`, [[0, '#fff3cf', 0.75], [1, '#fff3cf', 0]])}
    ${blur(`${u}b`, 10)}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}back)"/>
  ${curtain(150, 1300, 80, 640, 18, '#3a0b16', '#12030a')}
  <path d="M 150 640 L 1450 640 L 1600 800 L 0 800 Z" fill="url(#${u}floor)"/>
  <g stroke="#2a180c" stroke-width="3" opacity="0.6">${Array.from({ length: 16 }, (_, i) => `<path d="M ${150 + i * 86.6} 640 L ${(i * 106.6).toFixed(0)} 800"/>`).join('')}</g>
  <ellipse cx="800" cy="690" rx="340" ry="60" fill="url(#${u}pool)"/>
  <path d="M 700 668 L 900 668 L 930 712 L 670 712 Z" fill="none" stroke="#1d0f06" stroke-width="4" stroke-dasharray="12 6"/>
  <g transform="translate(700 300)">
    <rect width="200" height="360" fill="#120d1a" stroke="#c9a24a" stroke-width="6"/>
    <rect x="16" y="16" width="168" height="328" fill="#1d1530"/>
    <path d="M 16 16 L 184 16 L 184 344 L 16 344 Z" fill="none" stroke="#c9a24a" stroke-width="2"/>
    ${[[60, 70], [140, 110], [90, 170], [150, 230], [56, 260], [110, 300]].map(([x, y]) => `<path d="M ${x} ${y - 12} L ${x + 3} ${y - 3} L ${x + 12} ${y} L ${x + 3} ${y + 3} L ${x} ${y + 12} L ${x - 3} ${y + 3} L ${x - 12} ${y} L ${x - 3} ${y - 3} Z" fill="#f3d27a"/>`).join('')}
    <path d="M 120 140 A 30 30 0 1 0 140 190 A 24 24 0 1 1 120 140 Z" fill="#f3d27a"/>
    <rect x="-10" y="-30" width="220" height="34" fill="#c9a24a"/>${text(100, -6, 'THE VANISHING', 18, '#2a1a08', { family: "'Playfair Display', serif", spacing: 3 })}
  </g>
  ${cone(u, 'spot', 1180, 0, 60, 800, 700, 640, '#fff1c4', 0.38)}
  ${cone(u, 'spot2', 300, 0, 40, 520, 700, 300, '#c4d8ff', 0.12)}
  <rect x="0" y="0" width="${W}" height="96" fill="#5a0d1c"/>
  ${Array.from({ length: 12 }, (_, i) => `<path d="M ${i * 140 - 20} 96 Q ${i * 140 + 50} 170 ${i * 140 + 120} 96 Z" fill="#6e1224"/><path d="M ${i * 140 - 20} 96 Q ${i * 140 + 50} 160 ${i * 140 + 120} 96" fill="none" stroke="#c9a24a" stroke-width="5"/>`).join('')}
  ${curtain(0, 210, 0, 800, 4, '#8e1b2a', '#3a0710', -40)}
  ${curtain(1390, 210, 0, 800, 4, '#8e1b2a', '#3a0710', 40)}
  <rect x="0" y="0" width="${W}" height="30" fill="url(#${u}gold)"/>
  <rect x="0" y="0" width="34" height="${H}" fill="url(#${u}gold)"/><rect x="1566" y="0" width="34" height="${H}" fill="url(#${u}gold)"/>
  ${bulbs(60, 50, 1540, 50, 30)}
  <rect x="0" y="790" width="${W}" height="14" fill="#2a1a10"/>
  ${Array.from({ length: 18 }, (_, i) => `<ellipse cx="${60 + i * 88}" cy="792" rx="16" ry="6" fill="#ffd27a" opacity="0.9"/>`).join('')}
  ${glow(u, 'foot', 800, 780, 900, 80, '#ffb85a', 0.35)}
  ${vignette(u, 0.7)}`);
}

function stageFg(): string {
  return svg(`${Array.from({ length: 2 }, (_, row) =>
    Array.from({ length: 14 }, (_, i) => {
      const x = i * 124 - 30 + row * 62;
      const y = 830 + row * 40;
      return `<path d="M ${x} ${y + 80} L ${x} ${y + 12} Q ${x} ${y} ${x + 12} ${y} L ${x + 98} ${y} Q ${x + 110} ${y} ${x + 110} ${y + 12} L ${x + 110} ${y + 80} Z" fill="${row ? '#0a0507' : '#180a0e'}"/>
        <path d="M ${x + 8} ${y + 6} L ${x + 102} ${y + 6}" stroke="#5a1424" stroke-width="3" opacity="0.6"/>`;
    }).join(''),
  ).join('')}`);
}

// ---------------------------------------------------------------------------
// CORRIDOR — Backstage at the Paramount. One-point perspective.

function corridor(u: string): string {
  // one-point perspective toward (800, 420); the end wall frames the vanishing point
  const ex1 = 650, ex2 = 950, ey1 = 300, ey2 = 560;
  const brick = (side: -1 | 1) => {
    let out = '';
    const nearX = side < 0 ? 0 : W;
    const farX = side < 0 ? ex1 : ex2;
    for (let i = 0; i <= 22; i++) {
      const t = i / 22;
      const yNear = t * H;
      const yFar = ey1 + (ey2 - ey1) * t;
      out += `<path d="M ${nearX} ${yNear.toFixed(1)} L ${farX} ${yFar.toFixed(1)}" stroke="#2a120c" stroke-width="2.5" opacity="0.7"/>`;
    }
    // verticals with perspective spacing
    for (let k = 1; k < 14; k++) {
      const t = 1 - Math.pow(0.82, k);
      const x = nearX + (farX - nearX) * t;
      const yTop = (ey1 * t);
      const yBot = H + (ey2 - H) * t;
      out += `<path d="M ${x.toFixed(1)} ${yTop.toFixed(1)} L ${x.toFixed(1)} ${yBot.toFixed(1)}" stroke="#2a120c" stroke-width="${(3 - t * 2).toFixed(1)}" opacity="0.5"/>`;
    }
    return out;
  };
  return svg(`<defs>
    ${linear(`${u}lw`, [[0, '#6b2e1e'], [1, '#3a1810']], 1, 0)}
    ${linear(`${u}rw`, [[0, '#2e3c34'], [1, '#4a5c50']], 1, 0)}
    ${linear(`${u}fl`, [[0, '#1d1d1f'], [1, '#3a3a3c']])}
    ${linear(`${u}cl`, [[0, '#0d0d10'], [1, '#1d1d22']])}
    ${blur(`${u}b`, 9)}${blur(`${u}b2`, 24)}
  </defs>
  <path d="M 0 0 L ${W} 0 L ${ex2} ${ey1} L ${ex1} ${ey1} Z" fill="url(#${u}cl)"/>
  <path d="M 0 0 L ${ex1} ${ey1} L ${ex1} ${ey2} L 0 ${H} Z" fill="url(#${u}lw)"/>
  ${brick(-1)}
  <path d="M ${W} 0 L ${ex2} ${ey1} L ${ex2} ${ey2} L ${W} ${H} Z" fill="url(#${u}rw)"/>
  <path d="M 0 ${H} L ${ex1} ${ey2} L ${ex2} ${ey2} L ${W} ${H} Z" fill="url(#${u}fl)"/>
  <rect x="${ex1}" y="${ey1}" width="${ex2 - ex1}" height="${ey2 - ey1}" fill="#26302c"/>
  <g transform="translate(730 370)"><rect width="140" height="190" fill="#4a5a52" stroke="#1a201d" stroke-width="5"/><rect x="18" y="20" width="40" height="60" fill="#a8c2b4" opacity="0.35"/><rect x="10" y="100" width="120" height="12" rx="5" fill="#9aa59f"/>${text(70, 155, 'BALCONY', 16, '#d8e2dc', { spacing: 3 })}${text(70, 175, 'STAIRS ↑', 12, '#d8e2dc')}</g>
  <g transform="translate(755 318)"><rect width="90" height="34" rx="4" fill="#0c2a16"/><rect x="4" y="4" width="82" height="26" rx="3" fill="#1fd36a" opacity="0.9"/>${text(45, 25, 'EXIT', 20, '#eafff0', { weight: 800 })}</g>
  ${glow(u, 'exit', 800, 360, 260, 150, '#2cff7a', 0.45)}
  ${glow(u, 'exitfl', 800, 640, 220, 50, '#2cff7a', 0.2)}
  <path d="M 0 60 L ${ex1} ${ey1 + 14} M 0 90 L ${ex1} ${ey1 + 22}" stroke="#555a60" stroke-width="12" opacity="0.8"/>
  <path d="M 0 60 L ${ex1} ${ey1 + 14}" stroke="#8a9096" stroke-width="3"/>
  <g transform="translate(150 150) skewY(18)"><rect width="200" height="560" fill="#3a2418" stroke="#1d120c" stroke-width="8"/><rect x="20" y="30" width="160" height="200" fill="#2e1c12"/><rect x="20" y="260" width="160" height="260" fill="#2e1c12"/><circle cx="170" cy="300" r="10" fill="#c9a24a"/>
    <rect x="40" y="70" width="120" height="34" fill="#c9a24a"/>${text(100, 93, 'L. SABLE', 16, '#2a1808', { family: "'Playfair Display', serif" })}
  </g>
  <g transform="translate(120 230) rotate(14)"><rect width="300" height="34" fill="#f3d22a"/>${text(150, 23, 'POLICE LINE • DO NOT CROSS', 16, '#111', { weight: 800 })}</g>
  <g transform="translate(110 420) rotate(-8)"><rect width="300" height="34" fill="#f3d22a"/>${text(150, 23, 'POLICE LINE • DO NOT CROSS', 16, '#111', { weight: 800 })}</g>
  <g transform="translate(1180 170) skewY(-18)">
    <rect width="230" height="320" fill="#0f0a16" stroke="#c9a24a" stroke-width="5"/>
    ${radial(`${u}cp`, [[0, '#8e1b2a'], [1, '#0f0a16']], 0.5, 0.35, 0.6)}<rect x="8" y="8" width="214" height="304" fill="url(#${u}cp)"/>
    <path d="M 115 70 C 70 90 60 180 40 250 L 190 250 C 170 180 160 90 115 70 Z" fill="#0a0608"/>
    <path d="M 70 120 L 115 90 L 160 120 L 140 240 L 90 240 Z" fill="#9b1d2e"/><circle cx="115" cy="80" r="22" fill="#e9c6a8"/>
    ${text(115, 280, 'THE AMAZING', 15, '#f3d27a', { family: "'Playfair Display', serif", spacing: 2 })}${text(115, 302, 'CORVIN', 26, '#fff', { family: "'Playfair Display', serif", weight: 800, spacing: 4 })}
  </g>
  <g transform="translate(1010 330) skewY(-18)"><rect width="110" height="150" fill="#e9e2d0" stroke="#7a1020" stroke-width="4"/>${text(55, 22, 'FIRE EXITS', 12, '#7a1020')}<path d="M 15 40 L 95 40 L 95 130 L 15 130 Z M 15 85 L 95 85 M 55 40 L 55 130" fill="none" stroke="#444" stroke-width="2.5"/><circle cx="35" cy="110" r="6" fill="#d33"/></g>
  <g transform="translate(1420 40)"><rect x="-6" y="0" width="12" height="40" fill="#222"/><rect x="-60" y="36" width="90" height="44" rx="8" fill="#2c2c32" transform="rotate(-20)"/><circle cx="-60" cy="78" r="12" fill="#111"/><circle cx="-60" cy="78" r="5" fill="#334"/><circle cx="8" cy="40" r="5" fill="#ff2a2a" class="blink-fast"/></g>
  ${[[520, 120], [1080, 120]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><path d="M 0 -60 L 0 0" stroke="#222" stroke-width="4"/><circle cx="0" cy="12" r="18" fill="#ffd27a"/><path d="M -18 12 L 18 12 M 0 -6 L 0 30 M -12 -2 L 12 26 M 12 -2 L -12 26" stroke="#333" stroke-width="2.5"/></g>${cone(u, `w${i}`, x, y + 20, 30, x + (i ? 120 : -120), 900, 520, '#ffcf7a', 0.22)}`).join('')}
  ${vignette(u, 0.75)}`);
}

// ---------------------------------------------------------------------------
// SABLE'S OFFICE — the crime scene.

function sableOffice(u: string): string {
  const r = rng(23);
  return svg(`<defs>
    ${linear(`${u}wall`, [[0, '#2a1810'], [1, '#4a2c1c']])}
    ${linear(`${u}sky`, [[0, '#060814'], [1, '#1c2440']])}
    ${linear(`${u}floor`, [[0, '#2a1c16'], [1, '#120c0a']])}
    ${linear(`${u}desk`, [[0, '#6a3a22'], [0.08, '#4a2614'], [1, '#22100a']])}
    ${blur(`${u}b`, 12)}
    <clipPath id="${u}win"><rect x="560" y="90" width="480" height="380"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}wall)"/>
  ${panels(0, 480, W, 260, 9, '#3a2014', '#24120a', '#7a4a2c')}
  <g opacity="0.2">${Array.from({ length: 20 }, (_, i) => `<path d="M ${i * 80} 0 L ${i * 80 + 40} 480" stroke="#8a5a3a" stroke-width="2"/>`).join('')}</g>
  <g clip-path="url(#${u}win)"><rect x="560" y="90" width="480" height="380" fill="url(#${u}sky)"/>${stars(r, 30, 300).replace(/cx="(\d+)"/g, (_m, x) => `cx="${560 + (Number(x) % 480)}"`)}
    <circle cx="930" cy="170" r="34" fill="#f5e6c8"/>${skyline(r, 470, 60, 230, '#0b0e1c', '#ffd27a', 0.3, 540, 1060)}
    ${blinds(560, 90, 480, 130, 18, '#b8a888', 0.9)}
  </g>
  <rect x="550" y="80" width="500" height="400" fill="none" stroke="#1a0e08" stroke-width="20"/>
  <rect x="540" y="470" width="520" height="20" fill="#5a3420"/>
  ${cone(u, 'moon', 800, 470, 480, 760, 900, 900, '#9ab4ff', 0.12)}
  <g transform="translate(120 130)"><rect width="200" height="290" fill="#1a1010" stroke="#c9a24a" stroke-width="6"/><rect x="10" y="10" width="180" height="270" fill="#d8c49a"/><path d="M 30 220 L 100 60 L 170 220 Z" fill="#8e1b2a"/>${text(100, 250, 'PARAMOUNT', 20, '#2a1a10', { family: "'Playfair Display', serif", weight: 800 })}${text(100, 270, 'EST. 1931', 11, '#2a1a10')}</g>
  <g transform="translate(1200 130)"><rect width="220" height="170" fill="#1a1010" stroke="#c9a24a" stroke-width="6"/><rect x="10" y="10" width="200" height="150" fill="#3a3040"/>
    <circle cx="70" cy="70" r="22" fill="#e9c6a8"/><path d="M 40 150 Q 70 90 100 150 Z" fill="#111"/><circle cx="110" cy="66" r="20" fill="#e9c6a8"/><path d="M 84 150 Q 110 92 136 150 Z" fill="#7a1828"/><circle cx="150" cy="72" r="18" fill="#f2d3bf"/><path d="M 132 50 Q 150 36 168 50 L 170 90 L 130 90 Z" fill="#111"/><path d="M 128 150 Q 150 96 172 150 Z" fill="#d4a63a"/>
    ${text(110, 190, 'OPENING NIGHT — 9 YRS', 11, '#c9a24a')}</g>
  <g transform="translate(1270 380)"><rect width="150" height="130" fill="#2a2a2e" stroke="#111" stroke-width="5"/><rect x="12" y="12" width="126" height="106" fill="#111"/><path d="M 0 0 L -80 30 L -80 160 L 0 130" fill="#3a3a40" stroke="#111" stroke-width="4"/><circle cx="-40" cy="80" r="16" fill="#777"/><rect x="24" y="70" width="90" height="10" fill="#d8cfb0"/><rect x="30" y="86" width="80" height="10" fill="#c9bf9e"/></g>
  <g transform="translate(260 520)"><rect x="-50" y="0" width="100" height="220" fill="#1c1210" stroke="#c9a24a" stroke-width="4"/><rect x="-62" y="-14" width="124" height="18" fill="#2a1a14" stroke="#c9a24a" stroke-width="3"/><ellipse cx="0" cy="-6" rx="30" ry="6" fill="none" stroke="#e8dcc0" stroke-width="3" opacity="0.8"/>
    <rect x="-30" y="60" width="60" height="24" fill="#c9a24a"/>${text(0, 77, 'GOLDEN WAND', 8, '#2a1a08')}</g>
  <rect y="740" width="${W}" height="160" fill="url(#${u}floor)"/>
  ${glow(u, 'lamp', 1000, 760, 380, 110, '#ffc46b', 0.5)}
  ${vignette(u, 0.75)}`);
}

function sableOfficeFg(u: string): string {
  const marker = (x: number, y: number, n: number) =>
    `<g transform="translate(${x} ${y})"><path d="M -24 0 L 0 -46 L 24 0 Z" fill="#f3d22a" stroke="#333" stroke-width="2"/>${text(0, -10, String(n), 22, '#111', { weight: 800 })}</g>`;
  return svg(`<defs>${linear(`${u}dk`, [[0, '#6a3a22'], [0.06, '#4a2614'], [1, '#1a0c06']])}${blur(`${u}b`, 8)}</defs>
    <path d="M 520 650 L 1180 650 L 1200 900 L 500 900 Z" fill="url(#${u}dk)"/>
    <rect x="510" y="640" width="680" height="16" fill="#7a4628"/>
    <g transform="translate(1040 600) rotate(78)"><path d="M 0 0 L 30 0 L 26 50 L 4 50 Z" fill="#b8913c"/><path d="M -24 50 Q 15 10 54 50 Z" fill="#1f6b46"/></g>
    ${Array.from({ length: 7 }, (_, i) => `<rect x="${560 + i * 80}" y="${612 + (i % 3) * 8}" width="70" height="44" fill="#ece4d0" transform="rotate(${(i * 23) % 30 - 15} ${595 + i * 80} ${634})" opacity="0.95"/>`).join('')}
    <path d="M 120 820 Q 160 760 240 770 L 320 740 Q 380 730 400 770 L 440 820 Q 400 880 300 870 L 200 890 Q 120 880 120 820 Z" fill="none" stroke="#f2f2f2" stroke-width="5" stroke-dasharray="14 8" opacity="0.9"/>
    <ellipse cx="270" cy="790" rx="40" ry="14" fill="#5a0a10" opacity="0.8"/>
    ${marker(180, 900, 1)}${marker(470, 880, 2)}${marker(1300, 890, 3)}`);
}

// ---------------------------------------------------------------------------
// DRESSING ROOM — Iris's.

function dressing(u: string): string {
  const bulb = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="14" fill="#fff6dc"/><circle cx="${x}" cy="${y}" r="22" fill="#ffd98a" opacity="0.35"/>`;
  return svg(`<defs>
    ${linear(`${u}wall`, [[0, '#4a2438'], [1, '#6e3a4e']])}
    ${linear(`${u}mirror`, [[0, '#d8c9d6'], [0.5, '#9d8aa2'], [1, '#6a5a72']], 1, 1)}
    ${linear(`${u}floor`, [[0, '#2a1620'], [1, '#140a10']])}
    ${blur(`${u}b`, 16)}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}wall)"/>
  <g opacity="0.13" stroke="#f3c6d8" stroke-width="2" fill="none">${Array.from({ length: 22 }, (_, i) => Array.from({ length: 8 }, (_, j) => `<path d="M ${i * 80} ${j * 90 + (i % 2) * 45} l 40 45 l -40 45 l -40 -45 Z"/>`).join('')).join('')}</g>
  <rect y="700" width="${W}" height="200" fill="url(#${u}floor)"/>
  <g transform="translate(40 180)">${Array.from({ length: 3 }, (_, i) => `<path d="M ${i * 110} 0 L ${i * 110 + 110} 20 L ${i * 110 + 110} 540 L ${i * 110} 520 Z" fill="${i % 2 ? '#2a1a30' : '#3a2440'}" stroke="#c9a24a" stroke-width="3"/><path d="M ${i * 110 + 20} 100 q 35 -40 70 0 q -35 40 -70 0 Z M ${i * 110 + 30} 300 q 25 -50 50 0 Z" fill="#c9a24a" opacity="0.6"/>`).join('')}</g>
  <g transform="translate(480 120)">
    <rect x="-30" y="-30" width="560" height="440" rx="20" fill="#2a1a22"/>
    <rect width="500" height="380" rx="10" fill="url(#${u}mirror)"/>
    <path d="M 60 0 L 200 380 M 140 0 L 260 380 M 380 0 L 470 380" stroke="#fff" stroke-width="22" opacity="0.08"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => bulb(-15 + i * 106, -15)).join('')}
    ${[1, 2, 3].map((i) => bulb(-15, -15 + i * 100)).join('')}${[1, 2, 3].map((i) => bulb(515, -15 + i * 100)).join('')}
  </g>
  ${glow(u, 'mir', 730, 300, 520, 360, '#ffd98a', 0.32)}
  <rect x="420" y="560" width="640" height="30" fill="#5a3040"/><rect x="440" y="590" width="600" height="150" fill="#3a1e2a"/>
  <g transform="translate(470 500)"><rect width="34" height="60" rx="8" fill="#e8a8c8" opacity="0.85"/><rect x="8" y="-14" width="18" height="16" fill="#c9a24a"/></g>
  <g transform="translate(540 520)"><rect width="60" height="40" rx="6" fill="#2a2a30"/><ellipse cx="30" cy="0" rx="30" ry="8" fill="#e8c25a"/></g>
  <g transform="translate(640 500)"><path d="M 0 60 L 0 10 Q 0 0 10 0 L 50 0 Q 60 0 60 10 L 60 60 Z" fill="#f3d27a" opacity="0.4" stroke="#c9a24a" stroke-width="3"/><rect x="-4" y="-16" width="68" height="18" rx="4" fill="#c9a24a"/><g class="sparkle-group">${[[10, 20], [30, 35], [45, 15], [20, 48], [50, 45]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff6c8" class="twinkle" style="animation-delay:${-i * 0.5}s"/>`).join('')}</g></g>
  <g transform="translate(780 440)"><path d="M 20 120 L 30 40 L 70 40 L 80 120 Z" fill="#9ad0d8" opacity="0.5"/>${[[40, 20], [60, 10], [30, 0], [70, 30], [50, -10]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="14" fill="#c41e3a"/><circle cx="${x - 3}" cy="${y - 3}" r="5" fill="#e8506a"/>`).join('')}<rect x="76" y="70" width="40" height="28" fill="#f7f3ea" transform="rotate(10 96 84)"/></g>
  <g transform="translate(1150 160)">
    <rect x="0" y="0" width="12" height="560" fill="#9aa0a8"/><rect x="380" y="0" width="12" height="560" fill="#9aa0a8"/><rect x="0" y="0" width="392" height="12" fill="#b8bec6"/>
    <path d="M 40 12 L 40 30 M 20 40 L 40 30 L 60 40 L 80 470 L 0 470 Z" fill="#8e1b2a" stroke="#2a0a10" stroke-width="3"/><path d="M 20 40 L 60 40 L 70 470 L 10 470 Z" fill="#17131c"/>
    <path d="M 140 12 L 140 30 M 110 40 L 170 40 L 180 420 L 100 420 Z" fill="#d4a63a" stroke="#6e5214" stroke-width="3"/>
    <path d="M 240 12 L 240 30 M 210 40 L 270 40 L 280 440 L 200 440 Z" fill="#2a3a5a" stroke="#111" stroke-width="3"/>
    <path d="M 330 12 L 330 30 M 310 40 L 330 30 L 350 40" fill="none" stroke="#c9ccd2" stroke-width="4"/>
    <g class="sway"><path d="M 330 40 L 336 80" stroke="#c9a24a" stroke-width="2"/><rect x="318" y="78" width="36" height="48" rx="4" fill="#f3ead2" stroke="#7a6a4a" stroke-width="2"/>${text(336, 110, 'D', 22, '#7a1020', { family: "'Playfair Display', serif" })}</g>
  </g>
  <g transform="translate(1460 520)"><path d="M 0 -30 L 9 -9 L 30 -9 L 13 4 L 20 26 L 0 12 L -20 26 L -13 4 L -30 -9 L -9 -9 Z" fill="#c9a24a"/>${text(0, 60, 'IRIS', 18, '#f3d27a', { family: "'Playfair Display', serif", spacing: 3 })}</g>
  ${vignette(u, 0.7)}`);
}

// ---------------------------------------------------------------------------
// COURTROOM ANGLES

const WOOD = { base: '#6b3c22', dark: '#3e2112', light: '#a8703f' };

function courtBack(u: string, side: 'left' | 'right' | 'center', cool = false): string {
  const winX = side === 'left' ? 140 : side === 'right' ? 1180 : 0;
  const wall = cool ? ['#c9c2b2', '#a59c8a'] : ['#ddc9a6', '#b89c74'];
  const rays = side === 'center' ? '' : cone(u, 'ray', winX + 140, 160, 260, winX + (side === 'left' ? 520 : -240), 900, 700, '#fff2d0', 0.28);
  const window =
    side === 'center'
      ? ''
      : `<g transform="translate(${winX} 80)"><path d="M 0 480 L 0 140 Q 0 0 140 0 Q 280 0 280 140 L 280 480 Z" fill="#fff4dc"/>
        <path d="M 0 480 L 0 140 Q 0 0 140 0 Q 280 0 280 140 L 280 480 Z" fill="none" stroke="${WOOD.dark}" stroke-width="14"/>
        <path d="M 140 0 L 140 480 M 0 200 L 280 200 M 0 340 L 280 340" stroke="${WOOD.dark}" stroke-width="8"/>
        ${glow(u, 'win', 140, 240, 260, 320, '#fff6d8', 0.5)}</g>`;
  const col = (x: number) => `<g transform="translate(${x} 0)"><rect x="-50" y="0" width="100" height="900" fill="#e8e0d0"/><rect x="-50" y="0" width="22" height="900" fill="#fff" opacity="0.35"/><rect x="28" y="0" width="22" height="900" fill="#000" opacity="0.15"/>${Array.from({ length: 5 }, (_, i) => `<path d="M ${-30 + i * 15} 0 L ${-30 + i * 15} 900" stroke="#c8bea8" stroke-width="3"/>`).join('')}</g>`;
  const cols = side === 'left' ? col(1360) + col(980) : side === 'right' ? col(240) + col(620) : col(160) + col(1440);
  return `<defs>${linear(`${u}cw`, [[0, wall[0]], [1, wall[1]]])}${linear(`${u}cfl`, [[0, '#4a2a18'], [1, '#2a160c']])}</defs>
    <rect width="${W}" height="${H}" fill="url(#${u}cw)"/>
    <g opacity="0.1">${Array.from({ length: 30 }, (_, i) => `<rect x="${i * 56}" y="0" width="2" height="900" fill="#6a5030"/>`).join('')}</g>
    ${window}
    ${panels(0, 470, W, 430, 8, WOOD.base, WOOD.dark, WOOD.light)}
    ${cols}
    ${rays}`;
}

function courtDefense(u: string): string {
  return svg(`${courtBack(u, 'left')}${vignette(u, 0.55)}`);
}
function courtProsecution(u: string): string {
  return svg(`${courtBack(u, 'right', true)}${vignette(u, 0.55)}`);
}

function desk(u: string, label: string): string {
  return svg(`<defs>${linear(`${u}d`, [[0, '#8a5530'], [0.05, '#6b3c22'], [0.6, '#4a2614'], [1, '#2a140a']])}</defs>
    <path d="M -20 640 L 1620 640 L 1620 900 L -20 900 Z" fill="url(#${u}d)"/>
    <rect x="-20" y="626" width="1640" height="22" fill="#a8703f"/><rect x="-20" y="646" width="1640" height="6" fill="#000" opacity="0.3"/>
    ${Array.from({ length: 5 }, (_, i) => `<rect x="${60 + i * 320}" y="690" width="260" height="170" fill="#3e2112" opacity="0.5"/><path d="M ${60 + i * 320} 860 L ${60 + i * 320} 690 L ${320 + i * 320} 690" fill="none" stroke="#a8703f" stroke-width="3" opacity="0.5"/>`).join('')}
    <g transform="translate(1080 590)"><rect width="200" height="44" fill="#d8c08a" transform="rotate(-4)"/><rect x="20" y="-10" width="190" height="44" fill="#f2ece0" transform="rotate(3)"/></g>
    <g transform="translate(280 600)"><rect width="190" height="34" fill="#2a1a0c" stroke="#c9a24a" stroke-width="3"/>${text(95, 24, label, 15, '#e9cf8a', { family: "'Playfair Display', serif", spacing: 3 })}</g>`);
}

function courtWitness(u: string): string {
  const seal = `<g transform="translate(800 250)">
    <circle r="150" fill="#2a1a10"/><circle r="140" fill="#c9a24a"/><circle r="118" fill="#1f3a5a"/><circle r="118" fill="none" stroke="#f3d27a" stroke-width="3"/>
    <path id="${u}arc" d="M -96 0 A 96 96 0 0 1 96 0" fill="none"/>
    <text font-family="'Playfair Display', serif" font-size="15" font-weight="800" fill="#2a1a10" letter-spacing="3"><textPath href="#${u}arc" startOffset="50%" text-anchor="middle">COUNTY OF SAN QUERIDA</textPath></text>
    <path d="M 0 -60 L 0 60 M -60 -30 L 60 -30" stroke="#f3d27a" stroke-width="7" stroke-linecap="round"/>
    <path d="M -60 -30 L -85 20 L -35 20 Z M 60 -30 L 35 20 L 85 20 Z" fill="none" stroke="#f3d27a" stroke-width="5" stroke-linejoin="round"/>
    <path d="M -85 20 Q -60 44 -35 20 M 35 20 Q 60 44 85 20" fill="#f3d27a"/>
    <path d="M -30 64 L 30 64" stroke="#f3d27a" stroke-width="8" stroke-linecap="round"/>
  </g>`;
  const flag = (x: number, a: string, b: string) => `<g transform="translate(${x} 60)"><rect x="-4" y="0" width="8" height="620" fill="#c9a24a"/><circle cy="-6" r="12" fill="#c9a24a"/>
    <path d="M 4 20 Q 70 40 120 20 L 130 340 Q 70 360 4 340 Z" fill="${a}"/>${Array.from({ length: 6 }, (_, i) => `<path d="M 4 ${60 + i * 52} Q 70 ${80 + i * 52} 126 ${60 + i * 52}" stroke="${b}" stroke-width="18" fill="none" opacity="0.9"/>`).join('')}</g>`;
  return svg(`${courtBack(u, 'center')}
    ${flag(470, '#9b1d2e', '#f2ece0')}${flag(1010, '#1f3a5a', '#d8c08a')}
    ${seal}
    ${glow(u, 'seal', 800, 260, 420, 300, '#fff2c8', 0.3)}
    ${vignette(u, 0.6)}`);
}

function witnessStand(u: string): string {
  return svg(`<defs>${linear(`${u}ws`, [[0, '#8a5530'], [0.06, '#6b3c22'], [1, '#2a140a']])}${linear(`${u}wt`, [[0, '#b07a48'], [1, '#7a4a28']])}</defs>
    <path d="M 340 660 Q 800 610 1260 660 L 1300 900 L 300 900 Z" fill="url(#${u}ws)"/>
    <path d="M 320 652 Q 800 600 1280 652 L 1290 680 Q 800 628 310 680 Z" fill="url(#${u}wt)"/>
    ${Array.from({ length: 4 }, (_, i) => `<path d="M ${420 + i * 200} ${712 - (i === 1 || i === 2 ? 14 : 0)} L ${560 + i * 200} ${712 - (i === 1 || i === 2 ? 14 : 0)} L ${560 + i * 200} 860 L ${420 + i * 200} 860 Z" fill="#3e2112" opacity="0.5"/>`).join('')}
    <g transform="translate(860 620)"><path d="M 0 30 Q -10 -40 -60 -80" fill="none" stroke="#1a1a1e" stroke-width="7"/><ellipse cx="-66" cy="-86" rx="14" ry="20" fill="#2a2a30" transform="rotate(-40 -66 -86)"/><rect x="-24" y="22" width="48" height="16" rx="5" fill="#1a1a1e"/></g>`);
}

function courtJudge(u: string): string {
  return svg(`<defs>${linear(`${u}jw`, [[0, '#5a2e18'], [1, '#3a1c0e']])}${linear(`${u}drape`, [[0, '#7a1424'], [1, '#3a0610']], 1, 0)}</defs>
    <rect width="${W}" height="${H}" fill="url(#${u}jw)"/>
    ${panels(0, 0, W, 900, 10, '#5a2e18', '#3a1c0e', '#8a5530')}
    <g>${[0, 1].map((s) => `<path d="${s ? 'M 1600 0 L 1240 0 Q 1300 300 1260 900 L 1600 900 Z' : 'M 0 0 L 360 0 Q 300 300 340 900 L 0 900 Z'}" fill="url(#${u}drape)"/>${Array.from({ length: 5 }, (_, i) => `<path d="${s ? `M ${1280 + i * 70} 0 Q ${1320 + i * 70} 400 ${1290 + i * 70} 900` : `M ${40 + i * 70} 0 Q ${80 + i * 70} 400 ${50 + i * 70} 900`}" stroke="#2a040a" stroke-width="10" fill="none" opacity="0.5"/>`).join('')}`).join('')}</g>
    <g transform="translate(800 170)"><circle r="120" fill="#c9a24a" opacity="0.9"/><circle r="104" fill="#1f3a5a"/><path d="M 0 -50 L 0 50 M -50 -24 L 50 -24" stroke="#f3d27a" stroke-width="6" stroke-linecap="round"/><path d="M -50 -24 L -70 16 L -30 16 Z M 50 -24 L 30 16 L 70 16 Z" fill="none" stroke="#f3d27a" stroke-width="4"/></g>
    ${glow(u, 'top', 800, 200, 520, 300, '#ffdca0', 0.35)}
    ${vignette(u, 0.55)}`);
}

function judgeBench(u: string): string {
  return svg(`<defs>${linear(`${u}jb`, [[0, '#9a6236'], [0.05, '#6b3c22'], [1, '#2a140a']])}</defs>
    <path d="M 100 600 L 1500 600 L 1560 900 L 40 900 Z" fill="url(#${u}jb)"/>
    <rect x="80" y="584" width="1440" height="26" fill="#b07a48"/>
    ${Array.from({ length: 4 }, (_, i) => `<rect x="${180 + i * 330}" y="650" width="260" height="220" fill="#3e2112" opacity="0.45"/>`).join('')}
    <g transform="translate(800 690)"><rect x="-150" y="0" width="300" height="50" fill="#2a1a0c" stroke="#c9a24a" stroke-width="3"/>${text(0, 33, 'HON. A. OKAFOR', 20, '#e9cf8a', { family: "'Playfair Display', serif", spacing: 3 })}</g>
    <g transform="translate(1240 560)"><ellipse cx="0" cy="30" rx="60" ry="14" fill="#3a1c0e"/><rect x="-30" y="0" width="60" height="30" rx="6" fill="#5a2e18" transform="rotate(-12)"/><rect x="20" y="10" width="110" height="10" rx="4" fill="#7a4a28" transform="rotate(-12)"/></g>`);
}

// ---------------------------------------------------------------------------
// COURTHOUSE EXTERIOR / LOBBY

function courthouse(u: string): string {
  const r = rng(5);
  const col = (x: number) => `<rect x="${x}" y="330" width="56" height="330" fill="#efe6d4"/><rect x="${x}" y="330" width="14" height="330" fill="#fff" opacity="0.5"/><rect x="${x + 42}" y="330" width="14" height="330" fill="#b8ac94" opacity="0.6"/><rect x="${x - 8}" y="318" width="72" height="16" fill="#e2d8c2"/><rect x="${x - 8}" y="656" width="72" height="16" fill="#e2d8c2"/>`;
  return svg(`<defs>${linear(`${u}sky`, [[0, '#3a8ad8'], [0.7, '#9fd0f0'], [1, '#f6e0b8']])}${linear(`${u}st`, [[0, '#d8ccb4'], [1, '#a8987c']])}${blur(`${u}b`, 20)}</defs>
    <rect width="${W}" height="${H}" fill="url(#${u}sky)"/>
    ${Array.from({ length: 5 }, () => { const x = r() * 1500; const y = 60 + r() * 180; return `<g opacity="0.85" filter="url(#${u}b)"><ellipse cx="${x}" cy="${y}" rx="${120 + r() * 80}" ry="30" fill="#fff"/><ellipse cx="${x + 60}" cy="${y - 20}" rx="80" ry="30" fill="#fff"/></g>`; }).join('')}
    <path d="M 0 700 L 1600 700 L 1600 900 L 0 900 Z" fill="#c9b894"/>
    <path d="M 300 290 L 800 130 L 1300 290 Z" fill="#e8dec8" stroke="#b8ac94" stroke-width="6"/>
    <path d="M 380 270 L 800 150 L 1220 270 Z" fill="#d8ccb4"/>
    <rect x="280" y="280" width="1040" height="40" fill="#e2d8c2"/>
    ${text(800, 309, 'SAN QUERIDA COUNTY COURTHOUSE', 22, '#6a5a40', { family: "'Playfair Display', serif", spacing: 6 })}
    <rect x="300" y="320" width="1000" height="350" fill="#d8ccb4"/>
    <g fill="#2a2a38" opacity="0.75">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${400 + i * 150}" y="400" width="60" height="200"/>`).join('')}</g>
    ${[340, 490, 640, 790, 940, 1090, 1220].map(col).join('')}
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${260 - i * 30}" y="${670 + i * 14}" width="${1080 + i * 60}" height="16" fill="url(#${u}st)"/><rect x="${260 - i * 30}" y="${670 + i * 14}" width="${1080 + i * 60}" height="3" fill="#fff" opacity="0.4"/>`).join('')}
    ${palm(120, 880, 520, '#2a4a2a', 30)}${palm(1480, 880, 560, '#2a4a2a', -30)}${palm(1360, 880, 420, '#335a33', -10)}
    <path d="M 120 880 Q 140 600 150 360" stroke="#5a4a30" stroke-width="18" fill="none"/>
    ${vignette(u, 0.35)}`);
}

function lobby(u: string): string {
  return svg(`<defs>${linear(`${u}w`, [[0, '#d9cfbf'], [1, '#b8ab96']])}${linear(`${u}fl`, [[0, '#cbbfa8'], [1, '#8a7e6a']])}</defs>
    <rect width="${W}" height="${H}" fill="url(#${u}w)"/>
    <path d="M 0 700 L 1600 700 L 1600 900 L 0 900 Z" fill="url(#${u}fl)"/>
    <g stroke="#7a6e5a" stroke-width="2" opacity="0.5">${Array.from({ length: 12 }, (_, i) => `<path d="M ${i * 160 - 400} 900 L ${i * 120 + 100} 700"/>`).join('')}<path d="M 0 760 L 1600 760 M 0 830 L 1600 830"/></g>
    <g transform="translate(560 160)"><rect width="480" height="540" fill="#4a2614" stroke="#2a140a" stroke-width="10"/><rect x="20" y="20" width="210" height="500" fill="#5a3018"/><rect x="250" y="20" width="210" height="500" fill="#5a3018"/><rect x="160" y="250" width="40" height="14" rx="5" fill="#c9a24a"/><rect x="280" y="250" width="40" height="14" rx="5" fill="#c9a24a"/>
      <rect x="140" y="-60" width="200" height="44" fill="#2a1a0c" stroke="#c9a24a" stroke-width="3"/>${text(240, -30, 'COURTROOM 3', 18, '#e9cf8a', { family: "'Playfair Display', serif", spacing: 3 })}</g>
    <g transform="translate(120 120)"><rect width="260" height="480" fill="#fff6e0"/><rect width="260" height="480" fill="none" stroke="#7a6e5a" stroke-width="12"/><path d="M 130 0 L 130 480 M 0 160 L 260 160 M 0 320 L 260 320" stroke="#7a6e5a" stroke-width="6"/></g>
    ${cone(u, 'lw', 250, 300, 260, 600, 900, 600, '#fff2d0', 0.3)}
    <g transform="translate(1150 560)"><rect width="380" height="30" rx="6" fill="#5a3018"/><rect x="0" y="30" width="380" height="20" fill="#3a1c0e"/><rect x="20" y="50" width="16" height="90" fill="#3a1c0e"/><rect x="344" y="50" width="16" height="90" fill="#3a1c0e"/><rect x="0" y="-80" width="380" height="20" rx="6" fill="#5a3018"/></g>
    <g transform="translate(1460 420)"><path d="M 0 280 L 10 200 L 70 200 L 80 280 Z" fill="#7a4a28"/>${Array.from({ length: 7 }, (_, i) => `<path d="M 40 200 Q ${-40 + i * 25} ${100 - (i % 3) * 30} ${-60 + i * 30} ${60 + (i % 2) * 40}" stroke="#2d6a3a" stroke-width="12" fill="none"/>`).join('')}</g>
    ${vignette(u, 0.45)}`);
}

function voidBg(u: string): string {
  return svg(`<defs>${radial(`${u}v`, [[0, '#2a1840'], [1, '#05030a']], 0.5, 0.45, 0.7)}</defs><rect width="${W}" height="${H}" fill="url(#${u}v)"/>`);
}

function black(): string {
  return svg(`<rect width="${W}" height="${H}" fill="#000"/>`);
}

function readBg(u: string): string {
  return svg(`<defs>${radial(`${u}r`, [[0, '#14324a'], [0.6, '#081422'], [1, '#02060c']], 0.5, 0.45, 0.7)}</defs><rect width="${W}" height="${H}" fill="url(#${u}r)"/>
    <g stroke="#3ad0ff" opacity="0.08" fill="none">${Array.from({ length: 12 }, (_, i) => `<circle cx="800" cy="420" r="${60 + i * 70}"/>`).join('')}</g>`);
}

// ---------------------------------------------------------------------------

export const BACKGROUNDS: Record<string, BgDef> = {
  title: { name: 'San Querida', paint: title, particles: 'rain' },
  office: { name: 'Vane & Associates', paint: office, fg: officeFg, particles: 'dust', tint: 'rgba(80,40,120,0.18)' },
  detention: { name: 'County Detention', paint: detention, fg: detentionFg, particles: 'none', tint: 'rgba(60,120,100,0.16)' },
  stage: { name: 'Paramount Theater — Stage', paint: stage, fg: stageFg, particles: 'dust', tint: 'rgba(120,30,40,0.12)' },
  corridor: { name: 'Paramount Theater — Backstage', paint: corridor, particles: 'dust', tint: 'rgba(30,100,60,0.18)' },
  sable_office: { name: "Leon Sable's Office", paint: sableOffice, fg: sableOfficeFg, particles: 'dust', tint: 'rgba(40,50,110,0.16)' },
  dressing: { name: "Iris's Dressing Room", paint: dressing, particles: 'glitter', tint: 'rgba(160,60,100,0.12)' },
  court_defense: { name: 'Courtroom 3 — Defense', paint: courtDefense, fg: (u) => desk(u, 'DEFENSE'), particles: 'dust' },
  court_prosecution: { name: 'Courtroom 3 — Prosecution', paint: courtProsecution, fg: (u) => desk(u, 'PROSECUTION'), particles: 'dust', tint: 'rgba(60,80,120,0.1)' },
  court_witness: { name: 'Courtroom 3 — Witness Stand', paint: courtWitness, fg: witnessStand, particles: 'dust' },
  court_judge: { name: 'Courtroom 3 — Bench', paint: courtJudge, fg: judgeBench, particles: 'dust' },
  courthouse: { name: 'San Querida County Courthouse', paint: courthouse, particles: 'none' },
  lobby: { name: 'Defendant Lobby No. 3', paint: lobby, particles: 'dust' },
  void: { name: '', paint: voidBg, particles: 'embers' },
  read: { name: '', paint: readBg, particles: 'none' },
  black: { name: '', paint: black, particles: 'none' },
  ...CASE2_BACKGROUNDS,
};
