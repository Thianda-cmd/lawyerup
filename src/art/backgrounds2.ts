/** Case 2 locations ("Chain of Custody"). */
import type { BgDef } from './backgrounds';
import { H, W, blinds, blur, cone, glow, linear, neon, palm, radial, rng, skyline, stars, svg, text, vignette } from './bgkit';

// ---------------------------------------------------------------------------
// LAS LOMAS — the Pratt house in the hills. Party night / the morning after.

function party(u: string): string {
  const r = rng(41);
  const bulbs = Array.from({ length: 26 }, (_, i) => {
    const t = i / 25;
    const x = 210 + t * 1180;
    const y = 120 + Math.sin(t * Math.PI * 2) * 18 + 30;
    return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="5" fill="#ffe2a0" class="twinkle" style="animation-delay:${(-i * 0.3).toFixed(1)}s"/>`;
  }).join('');
  return svg(`<defs>
    ${linear(`${u}sky`, [[0, '#050716'], [0.7, '#141a3a'], [1, '#2a2050']])}
    ${linear(`${u}wall`, [[0, '#121624'], [1, '#1c2234']])}
    ${linear(`${u}floor`, [[0, '#2a2f3e'], [1, '#0e1018']])}
    ${linear(`${u}pool`, [[0, '#3ff0e8'], [1, '#0a7a9a']])}
    ${blur(`${u}b`, 10)}
    <clipPath id="${u}win"><rect x="200" y="80" width="1200" height="560"/></clipPath>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}wall)"/>
  <g clip-path="url(#${u}win)">
    <rect x="200" y="80" width="1200" height="560" fill="url(#${u}sky)"/>
    ${stars(r, 40, 300).replace(/cx="(\d+)"/g, (_m, x) => `cx="${200 + (Number(x) % 1200)}"`)}
    ${skyline(r, 520, 8, 40, '#0a0d1c', '#ffd27a', 0.5, 200, 1400)}
    <rect x="200" y="520" width="1200" height="120" fill="#0b0e1a"/>
    <path d="M 200 560 L 1400 560 L 1400 640 L 200 640 Z" fill="url(#${u}pool)" opacity="0.9"/>
    <g opacity="0.5">${Array.from({ length: 10 }, (_, i) => `<path d="M ${230 + i * 120} 580 q 30 -8 60 0 t 60 0" fill="none" stroke="#bffcff" stroke-width="2"/>`).join('')}</g>
    ${glow(u, 'pool', 800, 600, 700, 90, '#3ff0e8', 0.5)}
    <path d="M 200 130 Q 500 190 800 140 Q 1100 90 1400 150" fill="none" stroke="#222" stroke-width="2"/>
    ${bulbs}
  </g>
  <g fill="#0c0f18">${[200, 500, 800, 1100, 1400].map((x) => `<rect x="${x - 8}" y="80" width="16" height="560"/>`).join('')}</g>
  <rect x="190" y="70" width="1220" height="14" fill="#0c0f18"/>
  <rect y="0" width="${W}" height="18" fill="#8a5cff" opacity="0.6" filter="url(#${u}b)"/>
  <rect y="640" width="${W}" height="260" fill="url(#${u}floor)"/>
  <path d="M 0 640 L 1600 640" stroke="#3a4054" stroke-width="3"/>
  <g transform="translate(40 560)"><rect width="360" height="90" rx="20" fill="#2c3346"/><rect y="-40" width="360" height="60" rx="20" fill="#353d54"/><rect x="40" y="-20" width="80" height="40" rx="10" fill="#7a5cff" opacity="0.8"/></g>
  <g fill="#262c3c" stroke="#3a4054" stroke-width="2">${Array.from({ length: 9 }, (_, i) => `<rect x="${1240 + i * 40}" y="${600 - i * 52}" width="${360 - i * 40}" height="14"/>`).join('')}</g>
  <path d="M 1240 610 L 1600 140" stroke="#c9ccd2" stroke-width="5"/>
  <g transform="translate(1480 168) rotate(-30)"><rect width="200" height="22" fill="#f3d22a"/>${text(100, 16, 'POLICE LINE', 12, '#111', { weight: 800 })}</g>
  ${glow(u, 'led', 800, 30, 900, 120, '#8a5cff', 0.35)}
  ${vignette(u, 0.7)}`);
}

function partyFg(u: string): string {
  const cup = (x: number, y: number, rot = 0, tipped = false) =>
    tipped
      ? `<g transform="translate(${x} ${y}) rotate(${80 + rot})"><path d="M -18 -26 L 18 -26 L 13 26 L -13 26 Z" fill="#d6283a"/><rect x="-18" y="-26" width="36" height="6" fill="#f2f2f2"/></g>`
      : `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M -18 -26 L 18 -26 L 13 26 L -13 26 Z" fill="#d6283a" stroke="#7a0f1a" stroke-width="1.5"/><rect x="-18" y="-26" width="36" height="6" fill="#f2f2f2"/><path d="M -12 -16 L -9 18" stroke="#fff" stroke-width="3" opacity="0.35"/></g>`;
  return svg(`<defs>${linear(`${u}m`, [[0, '#f4f2ee'], [0.08, '#dcd8d0'], [1, '#8a8680']])}</defs>
    <path d="M -20 760 L 1620 760 L 1620 900 L -20 900 Z" fill="#2a2e3a"/>
    <path d="M -20 730 L 1620 730 L 1620 770 L -20 770 Z" fill="url(#${u}m)"/>
    <path d="M 100 740 q 80 10 160 -4 M 600 752 q 120 -8 240 4 M 1100 742 q 90 12 200 -2" fill="none" stroke="#b8b2a8" stroke-width="2" opacity="0.7"/>
    ${cup(180, 708)}${cup(240, 712, 6)}${cup(420, 724, 0, true)}${cup(1020, 706, -4)}${cup(1180, 714)}${cup(1340, 722, 0, true)}
    <g transform="translate(700 650)"><path d="M 0 80 L 0 20 Q 0 0 14 -10 L 14 -40 L 30 -40 L 30 -10 Q 44 0 44 20 L 44 80 Z" fill="#2fbf4a" opacity="0.85" stroke="#1a6a2a" stroke-width="2"/><rect x="2" y="30" width="40" height="22" fill="#f4f4f2"/>${text(22, 46, 'LIMÓN', 9, '#1a6a2a', { weight: 800 })}</g>
    <g transform="translate(860 690)"><ellipse cx="0" cy="40" rx="80" ry="14" fill="#6b1622"/><path d="M -80 0 Q -80 50 0 50 Q 80 50 80 0 Z" fill="#c43b4c" opacity="0.65" stroke="#fff" stroke-width="2"/></g>`);
}

// ---------------------------------------------------------------------------
// SQPD NARCOTICS UNIT

function precinct(u: string): string {
  return svg(`<defs>
    ${linear(`${u}w`, [[0, '#bfc4b4'], [1, '#9aa092']])}
    ${linear(`${u}fl`, [[0, '#5a5e58'], [1, '#33352f']])}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}w)"/>
  <rect width="${W}" height="70" fill="#d9ddd4"/>
  ${[200, 600, 1000, 1400].map((x) => `<rect x="${x - 120}" y="18" width="240" height="34" fill="#f6fff8" opacity="0.95"/>`).join('')}
  ${glow(u, 'f', 800, 60, 900, 120, '#f4fff4', 0.35)}
  <g transform="translate(90 130)"><rect width="420" height="300" fill="#e8f0ff"/>${blinds(0, 0, 420, 300, 20, '#d8d4c8', 0.92)}<rect width="420" height="300" fill="none" stroke="#6a6e64" stroke-width="10"/></g>
  <g transform="translate(600 120)">
    <rect width="420" height="270" fill="#f6f6f2" stroke="#6a6e64" stroke-width="6"/>
    ${text(210, 40, 'NARCOTICS UNIT', 26, '#1f3a5a', { spacing: 3 })}
    ${text(210, 80, 'ARRESTS THIS MONTH', 16, '#444')}
    ${text(210, 150, '47', 72, '#b3303d', { family: "'Special Elite', monospace" })}
    ${text(210, 200, 'SEIZURES (LBS): 112', 16, '#444')}
    ${text(210, 236, '"KEEP THE STREETS CLEAN" — K.', 13, '#1f3a5a', { family: "'Special Elite', monospace", weight: 400 })}
  </g>
  <g transform="translate(1100 110)">
    <rect width="400" height="300" fill="#a87a4a" stroke="#5a3a1a" stroke-width="8"/>
    ${[[40, 40], [160, 60], [280, 30], [70, 170], [200, 180], [310, 160]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="70" height="86" fill="#f4f0e8"/><circle cx="${x + 35}" cy="${y + 34}" r="18" fill="${['#c9a', '#9ab', '#cb9', '#a9c', '#bca', '#acb'][i]}"/><circle cx="${x + 35}" cy="${y + 4}" r="5" fill="#c43b4c"/>`).join('')}
    <path d="M 75 44 L 195 64 L 315 34 M 195 64 L 235 184 L 105 174 M 235 184 L 345 164" stroke="#c43b4c" stroke-width="2.5" fill="none"/>
  </g>
  <g transform="translate(1180 450)"><rect width="200" height="120" fill="#3a2a18" stroke="#c9a24a" stroke-width="5"/><rect x="14" y="14" width="172" height="92" fill="#1f1810"/>${text(100, 46, 'OFFICER OF THE YEAR', 12, '#e9cf8a', { spacing: 1 })}${text(100, 74, 'SGT. R. KESSLER', 16, '#f3e6c8', { family: "'Playfair Display', serif" })}${text(100, 96, '2024 • 2025', 11, '#e9cf8a')}</g>
  <rect y="600" width="${W}" height="300" fill="url(#${u}fl)"/>
  ${[0, 1].map((i) => `<g transform="translate(${140 + i * 820} 560)"><rect width="420" height="40" fill="#6b5a44"/><rect x="20" y="40" width="20" height="160" fill="#4a3e30"/><rect x="380" y="40" width="20" height="160" fill="#4a3e30"/><rect x="40" y="-110" width="160" height="110" rx="6" fill="#20242a"/><rect x="52" y="-98" width="136" height="80" fill="#2c6a4a"/><rect x="240" y="-30" width="120" height="30" fill="#e8e4d8"/><rect x="250" y="-50" width="110" height="24" fill="#d6cfbc"/></g>`).join('')}
  <g transform="translate(720 470)"><rect width="70" height="130" fill="#e8ecef"/><path d="M 5 0 L 65 0 L 55 -70 L 15 -70 Z" fill="#9fd8ff" opacity="0.7"/><rect x="20" y="20" width="30" height="40" fill="#ccd"/></g>
  ${vignette(u, 0.55)}`);
}

// ---------------------------------------------------------------------------
// HADLEY HALL — Chloe's dorm room.

function dorm(u: string): string {
  const fairy = Array.from({ length: 18 }, (_, i) => `<circle cx="${640 + i * 52}" cy="${210 + Math.sin(i * 0.9) * 14}" r="6" fill="#ffe2a0" class="twinkle" style="animation-delay:${(-i * 0.4).toFixed(1)}s"/>`).join('');
  return svg(`<defs>
    ${linear(`${u}w`, [[0, '#6e5a86'], [1, '#4c3e60']])}
    ${linear(`${u}sky`, [[0, '#2a3a7a'], [0.6, '#c06a8a'], [1, '#f2a46a']])}
    ${linear(`${u}fl`, [[0, '#4a3a2e'], [1, '#2a2018']])}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}w)"/>
  <g stroke="#5c4c72" stroke-width="2" opacity="0.6">${Array.from({ length: 14 }, (_, row) => `<path d="M 0 ${row * 60} L ${W} ${row * 60}"/>`).join('')}</g>
  <g transform="translate(1200 110)"><rect width="320" height="360" fill="url(#${u}sky)"/><rect width="320" height="360" fill="none" stroke="#e8e0f0" stroke-width="14"/><path d="M 160 0 L 160 360" stroke="#e8e0f0" stroke-width="8"/>${palm(250, 360, 200, '#2a1c30', -10)}</g>
  ${glow(u, 'win', 1360, 300, 360, 300, '#ffb07a', 0.3)}
  <path d="M 620 214 Q 900 250 1180 210" fill="none" stroke="#3a2a40" stroke-width="2"/>${fairy}
  <g transform="translate(640 470)"><rect width="540" height="110" rx="10" fill="#e8e4f0"/><rect y="90" width="540" height="140" fill="#5a4a6a"/><rect x="20" y="-40" width="160" height="60" rx="20" fill="#f4f0fa"/><path d="M 200 20 Q 360 -10 520 20 L 520 90 L 200 90 Z" fill="#8a6aa8"/></g>
  <g transform="translate(60 140)">
    <rect width="500" height="320" fill="#b88a5a" stroke="#6a4a2a" stroke-width="8"/>
    ${text(250, 40, 'THE BLUE PIPELINE', 26, '#1f2a5a', { family: "'Special Elite', monospace", weight: 400 })}
    ${[[40, 70, '#fff6a8'], [190, 60, '#fff'], [340, 80, '#ffd0e0'], [70, 200, '#fff'], [220, 190, '#c8f0ff'], [370, 210, '#fff6a8']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="100" height="74" fill="${c}" transform="rotate(${((x as number) % 7) - 3} ${(x as number) + 50} ${(y as number) + 37})"/><path d="M ${(x as number) + 12} ${(y as number) + 22} L ${(x as number) + 86} ${(y as number) + 22} M ${(x as number) + 12} ${(y as number) + 38} L ${(x as number) + 70} ${(y as number) + 38}" stroke="#555" stroke-width="2"/>`).join('')}
    <path d="M 90 110 L 240 100 L 390 120 M 240 100 L 270 230 L 120 240 M 270 230 L 420 250" stroke="#c43b4c" stroke-width="3" fill="none"/>
    <circle cx="420" cy="250" r="24" fill="none" stroke="#c43b4c" stroke-width="4"/>${text(420, 300, 'J.P. → ???', 14, '#7a1020', { family: "'Special Elite', monospace", weight: 400 })}
  </g>
  <rect y="640" width="${W}" height="260" fill="url(#${u}fl)"/>
  <g transform="translate(60 560)"><rect width="520" height="30" fill="#6a4a2a"/><rect y="30" width="20" height="200" fill="#4a3018"/><rect x="500" y="30" width="20" height="200" fill="#4a3018"/>
    <rect x="160" y="-16" width="200" height="16" rx="3" fill="#2a2a30"/><path d="M 170 -16 L 350 -16 L 336 -120 L 184 -120 Z" fill="#3a3a44"/><rect x="230" y="-90" width="60" height="30" rx="4" fill="#f3d22a"/>${text(260, -70, 'PRESS', 12, '#111', { weight: 800 })}
    <circle cx="430" cy="-6" r="14" fill="#b08040" stroke="#6e5214" stroke-width="2"/>${text(430, -2, '8', 12, '#3a2a08', { weight: 800 })}
    <rect x="30" y="-100" width="90" height="100" fill="#c9a24a"/><rect x="40" y="-90" width="70" height="80" fill="#f2ead2"/>${text(75, -54, 'STUDENT', 8, '#3a2a18')}${text(75, -42, 'JOURNALIST', 8, '#3a2a18')}${text(75, -30, 'OF THE YEAR', 8, '#3a2a18')}
  </g>
  ${[[700, 700], [880, 730], [1060, 690]].map(([x, y], i) => `<g transform="translate(${x} ${y})"><rect width="160" height="120" fill="#c8a070" stroke="#8a6a40" stroke-width="3"/><path d="M 0 0 L 80 30 L 160 0" fill="none" stroke="#8a6a40" stroke-width="3"/>${text(80, 80, ['CHLOE — BOOKS', 'WINTER CLOTHES', 'DESK STUFF'][i], 12, '#3a2a18', { family: "'Special Elite', monospace", weight: 400 })}</g>`).join('')}
  ${vignette(u, 0.6)}`);
}

// ---------------------------------------------------------------------------
// SQPD CRIME LAB

function crimeLab(u: string): string {
  const pill = (x: number, y: number, nick: boolean) =>
    `<g transform="translate(${x} ${y})"><circle r="70" fill="#6fa8e8" stroke="#3a6aa8" stroke-width="4"/><circle r="70" fill="url(#${u}shine)"/>
      ${text(0, 6, 'M', 54, '#2a4a7a', { weight: 800 })}<path d="M -50 22 L 50 22" stroke="#2a4a7a" stroke-width="3"/>${text(0, 52, nick ? '3 0' : '30', 22, '#2a4a7a', { weight: 800 })}
      ${nick ? `<circle cx="-14" cy="-26" r="14" fill="none" stroke="#ff3040" stroke-width="4"/><circle cx="-10" cy="44" r="14" fill="none" stroke="#ff3040" stroke-width="4"/>` : ''}</g>`;
  return svg(`<defs>
    ${linear(`${u}w`, [[0, '#dfeeee'], [1, '#b8d2d4']])}
    ${linear(`${u}fl`, [[0, '#9ab0b4'], [1, '#5a6e72']])}
    ${radial(`${u}shine`, [[0, '#fff', 0.5], [0.5, '#fff', 0], [1, '#000', 0.15]], 0.35, 0.3, 0.7)}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}w)"/>
  <rect width="${W}" height="60" fill="#eef8f8"/>${[300, 800, 1300].map((x) => `<rect x="${x - 150}" y="14" width="300" height="30" fill="#fff"/>`).join('')}
  ${glow(u, 'f', 800, 50, 1000, 140, '#f0ffff', 0.35)}
  <g transform="translate(60 120)"><rect width="320" height="420" fill="#c8d8da" stroke="#7a8e92" stroke-width="6"/><rect x="20" y="20" width="280" height="250" fill="#e8f6f8" opacity="0.6"/><rect x="20" y="270" width="280" height="12" fill="#7a8e92"/>${text(160, 340, 'FUME HOOD', 16, '#3a4e52')}<rect x="60" y="200" width="30" height="60" rx="4" fill="#9ad0ff" opacity="0.8"/><rect x="120" y="180" width="24" height="80" rx="4" fill="#ffd09a" opacity="0.8"/></g>
  <g transform="translate(470 110)">
    <rect width="660" height="370" rx="14" fill="#1a2228" stroke="#3a4a52" stroke-width="10"/>
    <rect x="16" y="16" width="628" height="300" fill="#0e1418"/>
    ${pill(170, 160, true)}${pill(490, 160, true)}
    ${text(170, 270, 'ITEM 7 — QUINTERO VEHICLE', 14, '#9fd8ff', { family: 'monospace', weight: 600 })}${text(490, 270, 'CASE #24-1187 — MARCH', 14, '#9fd8ff', { family: 'monospace', weight: 600 })}
    ${text(330, 300, 'DIE MARK MATCH: NICKED "M" / OFFSET "3"', 14, '#ff6070', { family: 'monospace', weight: 700 })}
    <rect x="290" y="370" width="80" height="60" fill="#2a3238"/>
  </g>
  <g transform="translate(1200 120)"><rect width="320" height="440" fill="#f0f4f4" stroke="#7a8e92" stroke-width="6"/><rect x="20" y="20" width="280" height="40" fill="#c43b4c"/>${text(160, 48, 'EVIDENCE — AUTHORIZED ONLY', 13, '#fff', { weight: 800 })}<rect x="280" y="200" width="14" height="80" rx="6" fill="#9aa"/></g>
  <rect y="560" width="${W}" height="340" fill="url(#${u}fl)"/>
  <g transform="translate(0 540)"><rect width="${W}" height="40" fill="#2a3a3e"/><rect y="40" width="${W}" height="20" fill="#1a2628"/></g>
  <g transform="translate(160 430)"><rect width="220" height="110" rx="10" fill="#e8ecef" stroke="#7a8e92" stroke-width="4"/><rect x="20" y="20" width="110" height="60" fill="#1a2a30"/><path d="M 30 64 L 50 40 L 66 56 L 84 30 L 100 60 L 120 46" fill="none" stroke="#3ff0a0" stroke-width="3"/>${text(175, 60, 'GC-MS', 18, '#3a4e52')}</g>
  <g transform="translate(560 470)"><rect x="-6" y="40" width="80" height="30" rx="6" fill="#2a3238"/><path d="M 30 40 L 30 -10 L 60 -40" stroke="#2a3238" stroke-width="16" fill="none" stroke-linecap="round"/><circle cx="62" cy="-42" r="14" fill="#3a4a52"/></g>
  ${[0, 1, 2].map((i) => `<g transform="translate(${880 + i * 110} 480) rotate(${i * 6 - 6})"><rect width="90" height="60" fill="#f2f6f8" opacity="0.9" stroke="#c43b4c" stroke-width="3"/><rect y="0" width="90" height="12" fill="#c43b4c"/><circle cx="30" cy="38" r="6" fill="#6fa8e8"/><circle cx="50" cy="40" r="6" fill="#6fa8e8"/></g>`).join('')}
  <g transform="translate(1250 600)"><rect width="260" height="130" fill="#fff" stroke="#7a8e92" stroke-width="4"/>${text(130, 40, 'BACKLOG', 18, '#3a4e52')}${text(130, 96, '1,204', 44, '#c43b4c', { family: "'Special Elite', monospace", weight: 400 })}</g>
  ${vignette(u, 0.45)}`);
}

// ---------------------------------------------------------------------------
// DA'S OFFICE — Helena Strand.

function daOffice(u: string): string {
  const r = rng(9);
  const books = Array.from({ length: 34 }, (_, i) => {
    const colors = ['#7a1f2e', '#1f3a5a', '#2a4a2a', '#5a3a1a', '#3a2a4a', '#8a6a2a'];
    return `<rect x="${i * 13}" y="${-(60 + r() * 30).toFixed(0)}" width="11" height="${(60 + r() * 30).toFixed(0)}" fill="${colors[i % 6]}"/>`;
  }).join('');
  return svg(`<defs>
    ${linear(`${u}w`, [[0, '#e6e8ec'], [1, '#c9ccd2']])}
    ${linear(`${u}sky`, [[0, '#6aa8e0'], [1, '#d8ecf8']])}
    ${linear(`${u}fl`, [[0, '#5a5e66'], [1, '#2a2c32']])}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}w)"/>
  <g transform="translate(560 80)"><rect width="520" height="440" fill="url(#${u}sky)"/>
    ${skyline(r, 440, 40, 220, '#8a9ab0', '#e8f0f8', 0.15, 0, 520).replace(/<circle[^>]*\/>/g, '')}
    <path d="M 300 290 Q 360 210 420 290 Z" fill="#c9ccd2"/><rect x="300" y="290" width="120" height="150" fill="#d8dce2"/>
    <rect width="520" height="440" fill="none" stroke="#3a3e46" stroke-width="14"/><path d="M 260 0 L 260 440" stroke="#3a3e46" stroke-width="8"/>
  </g>
  ${cone(u, 'sun', 820, 300, 520, 820, 900, 900, '#fff8e0', 0.18)}
  <g transform="translate(60 140)"><rect width="460" height="460" fill="#5a3a24"/>${[110, 220, 330, 440].map((y) => `<g transform="translate(14 ${y})">${books}</g><rect x="0" y="${y}" width="460" height="10" fill="#3a2414"/>`).join('')}</g>
  <g transform="translate(1160 120)"><rect width="160" height="120" fill="#2a2c32"/><rect x="10" y="10" width="140" height="100" fill="#f2ead2"/>${text(80, 50, 'J.D. — STANFORD', 11, '#3a2a18')}${text(80, 70, 'H. STRAND', 14, '#3a2a18', { family: "'Playfair Display', serif" })}</g>
  <g transform="translate(1360 120)"><rect width="180" height="120" fill="#fff" stroke="#3a3e46" stroke-width="5"/>${text(90, 84, '41 – 1', 46, '#1f3a5a', { family: "'Special Elite', monospace", weight: 400 })}<circle cx="132" cy="68" r="28" fill="none" stroke="#c43b4c" stroke-width="4"/></g>
  <rect y="620" width="${W}" height="280" fill="url(#${u}fl)"/>
  <g transform="translate(1200 470)"><rect width="200" height="150" fill="#3a3e46"/><rect x="20" y="-30" width="160" height="30" fill="#e8e4d8"/><g transform="translate(40 -60)">${Array.from({ length: 6 }, (_, i) => `<path d="M ${i * 22} 30 L ${i * 22 + 6} 6 L ${i * 22 + 12} 30 Z" fill="${i % 2 ? '#111' : '#f2f2f2'}" stroke="#555"/>`).join('')}</g></g>
  <g transform="translate(150 600)"><path d="M 30 0 L 50 -60 L 70 0 Z" fill="#2d6a3a"/><circle cx="50" cy="-80" r="14" fill="#f4d0e8"/><circle cx="70" cy="-70" r="12" fill="#f4d0e8"/><rect x="30" y="0" width="40" height="30" fill="#e8e4d8"/></g>
  ${vignette(u, 0.4)}`);
}

function daDesk(u: string): string {
  return svg(`<defs>${linear(`${u}g`, [[0, '#dfe8ee', 0.85], [1, '#8a9aa6', 0.9]])}</defs>
    <path d="M 120 680 L 1480 680 L 1520 720 L 80 720 Z" fill="url(#${u}g)" stroke="#6a7a86" stroke-width="3"/>
    <rect x="160" y="720" width="20" height="180" fill="#3a3e46"/><rect x="1420" y="720" width="20" height="180" fill="#3a3e46"/>
    <g transform="translate(420 650)"><rect width="200" height="34" fill="#f4f4f2" stroke="#999"/><rect x="10" y="-14" width="200" height="30" fill="#1f3a5a"/>${text(110, 6, 'PEOPLE v. QUINTERO', 12, '#fff', { weight: 700 })}</g>
    <g transform="translate(1040 640)"><rect width="140" height="44" rx="6" fill="#2a2c32"/><rect x="10" y="8" width="120" height="28" fill="#c9a24a"/>${text(70, 28, 'H. STRAND', 13, '#1a1208', { family: "'Playfair Display', serif" })}</g>`);
}

// ---------------------------------------------------------------------------
// TACOS EL GÜERO — late night.

function taqueria(u: string): string {
  const flags = Array.from({ length: 22 }, (_, i) => {
    const colors = ['#e83e8c', '#3fc1c1', '#f2c94c', '#7ac74f', '#ff7a45', '#8a5cff'];
    const x = i * 75;
    return `<path d="M ${x} 40 L ${x + 70} 40 L ${x + 70} 100 L ${x + 35} 120 L ${x} 100 Z" fill="${colors[i % 6]}" opacity="0.9"/><circle cx="${x + 35}" cy="72" r="10" fill="#000" opacity="0.15"/>`;
  }).join('');
  return svg(`<defs>
    ${linear(`${u}w`, [[0, '#7a3a2a'], [1, '#4a2018']])}
    ${linear(`${u}fl`, [[0, '#3a2a22'], [1, '#1a1210']])}
    ${linear(`${u}night`, [[0, '#0a0a18'], [1, '#1a1830']])}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}w)"/>
  <g opacity="0.25">${Array.from({ length: 20 }, (_, i) => `<path d="M ${i * 80} 120 L ${i * 80 + 40} 600" stroke="#f3c86a" stroke-width="2"/>`).join('')}</g>
  <path d="M 0 40 Q 400 70 800 40 Q 1200 10 1600 40" fill="none" stroke="#222" stroke-width="2"/>${flags}
  <g transform="translate(80 170)"><rect width="520" height="360" fill="url(#${u}night)" stroke="#2a1810" stroke-width="16"/><circle cx="420" cy="80" r="40" fill="#ffd27a" opacity="0.25"/><rect x="400" y="80" width="8" height="280" fill="#222"/><path d="M 0 300 L 520 300" stroke="#333" stroke-width="4"/>
    ${neon(u, 'open', 260, 200, 'ABIERTO', 46, '#ff3d8b', { family: "'Inter', sans-serif", flicker: true })}</g>
  <g transform="translate(700 150)"><rect width="760" height="260" fill="#1a1210" stroke="#c9a24a" stroke-width="5"/>
    ${neon(u, 'name', 380, 70, 'Tacos El Güero', 54, '#3fff9a')}
    ${[['AL PASTOR', '2.50'], ['CARNITAS', '2.50'], ['LENGUA', '3.00'], ['HORCHATA', '2.00']].map(([n, p], i) => `${text(110 + (i % 2) * 380, 140 + Math.floor(i / 2) * 60, n, 24, '#f3e6c8', { family: "'Special Elite', monospace", weight: 400, anchor: 'start' })}${text(330 + (i % 2) * 380, 140 + Math.floor(i / 2) * 60, '$' + p, 24, '#f2c94c', { family: "'Special Elite', monospace", weight: 400, anchor: 'end' })}`).join('')}
  </g>
  <g transform="translate(1440 440)"><rect width="140" height="200" fill="#d8e8f0" stroke="#666" stroke-width="4"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${14 + (i % 4) * 30}" y="${20 + Math.floor(i / 4) * 60}" width="18" height="46" rx="4" fill="${['#ff7a45', '#7ac74f', '#e83e8c', '#f2c94c'][i % 4]}"/>`).join('')}</g>
  <rect y="600" width="${W}" height="300" fill="url(#${u}fl)"/>
  <g>${[120, 640].map((x) => `<g transform="translate(${x} 560)"><rect width="380" height="160" rx="20" fill="#b3202f"/><rect x="0" y="-100" width="30" height="180" rx="10" fill="#8a1824"/><rect x="350" y="-100" width="30" height="180" rx="10" fill="#8a1824"/><rect x="60" y="20" width="260" height="20" fill="#e8e0d0"/></g>`).join('')}</g>
  ${glow(u, 'warm', 800, 300, 900, 400, '#ff9a5a', 0.2)}
  ${vignette(u, 0.7)}`);
}

// ---------------------------------------------------------------------------
// SAFEKEEP SELF STORAGE — night.

function storage(u: string): string {
  const door = (x: number, w: number, top: number, h: number, n: string) =>
    `<g><rect x="${x}" y="${top}" width="${w}" height="${h}" fill="#d0682a"/>${Array.from({ length: 8 }, (_, i) => `<path d="M ${x} ${top + (i + 1) * (h / 9)} L ${x + w} ${top + (i + 1) * (h / 9)}" stroke="#8a3a12" stroke-width="2"/>`).join('')}<rect x="${x + w / 2 - w / 10}" y="${top - h / 8}" width="${w / 5}" height="${h / 10}" fill="#f2f2f2"/>${text(x + w / 2, top - h / 8 + h / 14, n, Math.max(10, h / 12), '#111', { weight: 800 })}</g>`;
  return svg(`<defs>
    ${linear(`${u}sky`, [[0, '#05060e'], [1, '#1a1426']])}
    ${linear(`${u}lot`, [[0, '#2a2622'], [1, '#0e0c0a']])}
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${u}sky)"/>
  ${stars(rng(14), 50, 250)}
  <path d="M 0 0 L 640 330 L 640 600 L 0 900 Z" fill="#3a3632"/>
  ${[0, 1, 2, 3, 4].map((i) => { const t0 = 1 - Math.pow(0.72, i); const t1 = 1 - Math.pow(0.72, i + 1); const x0 = t0 * 640; const x1 = t1 * 640; const top0 = 120 + (330 - 120) * t0; return door(x0 + 10, (x1 - x0) - 20, top0, 520 * (1 - t0) * 0.75, String(210 + i)); }).join('')}
  <path d="M 1600 0 L 960 330 L 960 600 L 1600 900 Z" fill="#34302c"/>
  ${[0, 1, 2, 3, 4].map((i) => { const t0 = 1 - Math.pow(0.72, i); const t1 = 1 - Math.pow(0.72, i + 1); const x0 = 1600 - t0 * 640; const x1 = 1600 - t1 * 640; const top0 = 120 + (330 - 120) * t0; return door(x1 + 10, (x0 - x1) - 20, top0, 520 * (1 - t0) * 0.75, String(219 - i)); }).join('')}
  <path d="M 0 900 L 640 600 L 960 600 L 1600 900 Z" fill="url(#${u}lot)"/>
  <rect x="640" y="330" width="320" height="270" fill="#14110e"/>
  ${[[300, 60], [1300, 60], [800, 300]].map(([x, y], i) => `<rect x="${x - 3}" y="${y}" width="6" height="40" fill="#222"/><ellipse cx="${x}" cy="${y + 40}" rx="22" ry="8" fill="#ffb347"/>${cone(u, `l${i}`, x, y + 44, 30, x, 900, 700, '#ff9a2a', 0.22)}`).join('')}
  <g transform="translate(760 520)"><path d="M 0 60 L 20 10 L 140 0 L 190 40 L 200 60 Z" fill="#0a0a0c"/><circle cx="40" cy="62" r="16" fill="#111"/><circle cx="160" cy="62" r="16" fill="#111"/></g>
  ${glow(u, 'hl', 760, 570, 120, 30, '#fff6d8', 0.6)}
  ${vignette(u, 0.8)}`);
}

function storageFg(): string {
  return svg(`<g stroke="#7a7a72" stroke-width="2.5" opacity="0.55" fill="none">${Array.from({ length: 60 }, (_, i) => `<path d="M ${i * 30 - 300} 900 L ${i * 30 + 60} 540"/><path d="M ${i * 30 - 300} 540 L ${i * 30 + 60} 900"/>`).join('')}</g><rect y="530" width="${W}" height="12" fill="#5a5a52"/>`);
}

// ---------------------------------------------------------------------------
// PRESS — City Hall steps, as broadcast on KSQT 6.

function press(u: string): string {
  return svg(`<defs>${linear(`${u}sky`, [[0, '#8ab8e0'], [1, '#e0eef8']])}${linear(`${u}st`, [[0, '#e8e2d6'], [1, '#bdb4a2']])}</defs>
    <rect width="${W}" height="${H}" fill="url(#${u}sky)"/>
    <rect x="100" y="60" width="1400" height="520" fill="#ece6da"/>
    ${Array.from({ length: 9 }, (_, i) => `<rect x="${160 + i * 160}" y="120" width="64" height="460" fill="#f6f2ea"/><rect x="${160 + i * 160}" y="120" width="16" height="460" fill="#fff" opacity="0.6"/><rect x="${208 + i * 160}" y="120" width="16" height="460" fill="#c8bea8" opacity="0.6"/>`).join('')}
    <rect x="100" y="60" width="1400" height="60" fill="#ddd5c4"/>${text(800, 100, 'CITY OF SAN QUERIDA', 28, '#7a6a4a', { family: "'Playfair Display', serif", spacing: 8 })}
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${0 - i * 10}" y="${580 + i * 40}" width="${1600 + i * 20}" height="40" fill="url(#${u}st)"/><rect x="0" y="${580 + i * 40}" width="1600" height="3" fill="#fff" opacity="0.5"/>`).join('')}
    ${[[420, '#9b1d2e'], [1180, '#1f3a5a']].map(([x, c]) => `<rect x="${(x as number) - 3}" y="160" width="6" height="440" fill="#c9a24a"/><path d="M ${(x as number) + 3} 170 Q ${(x as number) + 70} 190 ${(x as number) + 120} 170 L ${(x as number) + 126} 360 Q ${(x as number) + 70} 380 ${(x as number) + 3} 360 Z" fill="${c}"/>`).join('')}
    ${vignette(u, 0.3)}`);
}

function pressFg(): string {
  const mics = [['#c43b4c', '6'], ['#1f6fb2', '2'], ['#f2c94c', '4'], ['#2a9d8f', '11'], ['#6a2fb0', '9']]
    .map(([c, n], i) => `<g transform="translate(${700 + i * 50} ${640 - (i % 2) * 20}) rotate(${(i - 2) * 6})"><rect x="-6" y="0" width="12" height="70" fill="#222"/><rect x="-18" y="-30" width="36" height="34" rx="6" fill="${c}"/>${text(0, -8, n, 14, '#fff', { weight: 800 })}<ellipse cx="0" cy="-40" rx="14" ry="16" fill="#333"/></g>`)
    .join('');
  return svg(`<g transform="translate(0 0)"><path d="M 620 700 L 980 700 L 960 900 L 640 900 Z" fill="#3a2a1a"/><rect x="610" y="690" width="380" height="20" fill="#5a4028"/><g transform="translate(800 790)"><circle r="40" fill="#c9a24a"/><circle r="32" fill="#1f3a5a"/></g></g>
    ${mics}
    <rect x="40" y="36" width="110" height="44" rx="6" fill="#d6283a"/>${text(95, 66, 'LIVE', 26, '#fff', { weight: 800, extra: 'class="blink-slow"' })}
    <g transform="translate(0 760)"><rect width="1600" height="56" fill="#0f2a52"/><rect width="230" height="56" fill="#d6283a"/>${text(115, 38, 'KSQT 6 NEWS', 24, '#fff', { weight: 800 })}
      ${text(250, 38, 'COUNCILWOMAN WHITFIELD: "CHLOE WILL BE THE LAST."', 26, '#fff', { weight: 700, anchor: 'start' })}
      <rect y="56" width="1600" height="40" fill="#f2f2f2"/>${text(250, 84, 'SQ STATE SOPHOMORE, 20, DEAD OF FENTANYL • 19-YEAR-OLD CHARGED WITH DRUG-INDUCED HOMICIDE', 18, '#0f2a52', { weight: 700, anchor: 'start' })}</g>`);
}

// ---------------------------------------------------------------------------
// ALVARADO & 5TH — Sunday, 10:20 AM.

function trafficStop(u: string): string {
  return svg(`<defs>${linear(`${u}sky`, [[0, '#6ab0f0'], [1, '#d8eefa']])}${linear(`${u}road`, [[0, '#5a5a5e'], [1, '#2a2a2e']])}</defs>
    <rect width="${W}" height="${H}" fill="url(#${u}sky)"/>
    ${[[60, '#e8d6b8'], [480, '#f2e2c8'], [960, '#d8c8b0'], [1320, '#efe0c4']].map(([x, c]) => `<g transform="translate(${x} 300)"><rect width="300" height="200" fill="${c}"/><path d="M -20 0 L 150 -90 L 320 0 Z" fill="#b8664a"/><rect x="40" y="60" width="70" height="60" fill="#8ab8d8"/><rect x="190" y="60" width="70" height="60" fill="#8ab8d8"/><rect x="125" y="110" width="50" height="90" fill="#6a4a2a"/></g>`).join('')}
    ${palm(420, 520, 360, '#2a4a2a', 10)}${palm(1280, 520, 400, '#2a4a2a', -20)}
    <rect y="500" width="${W}" height="60" fill="#d8d4cc"/>
    <path d="M 0 560 L 1600 560 L 1600 900 L 0 900 Z" fill="url(#${u}road)"/>
    <path d="M 0 720 L 1600 720" stroke="#f2d22a" stroke-width="6" stroke-dasharray="60 40"/>
    <g transform="translate(170 300)"><rect x="-4" y="0" width="8" height="220" fill="#888"/><path d="M -40 -40 L -16 -64 L 16 -64 L 40 -40 L 40 -8 L 16 16 L -16 16 L -40 -8 Z" fill="#c4202f" stroke="#fff" stroke-width="4"/>${text(0, -16, 'STOP', 20, '#fff', { weight: 800 })}<rect x="-50" y="30" width="100" height="22" fill="#2a6a3a"/>${text(0, 46, 'ALVARADO', 12, '#fff', { weight: 700 })}</g>
    <g transform="translate(300 560)"><path d="M 0 120 L 30 40 Q 60 10 120 6 L 300 6 Q 360 10 390 50 L 430 70 Q 460 80 460 110 L 460 140 L 0 140 Z" fill="#b8bec6" stroke="#5a5e66" stroke-width="3"/><path d="M 60 44 Q 90 20 140 18 L 210 18 L 210 66 L 50 66 Z" fill="#7aa8c8"/><path d="M 230 18 L 300 18 Q 340 22 362 60 L 362 66 L 230 66 Z" fill="#7aa8c8"/><circle cx="100" cy="140" r="34" fill="#1a1a1e"/><circle cx="360" cy="140" r="34" fill="#1a1a1e"/><circle cx="100" cy="140" r="14" fill="#888"/><circle cx="360" cy="140" r="14" fill="#888"/></g>
    <g transform="translate(940 540)"><path d="M 0 140 L 0 90 Q 10 60 60 54 L 140 20 Q 180 10 260 10 L 340 14 Q 380 20 410 60 L 470 74 Q 500 86 500 120 L 500 160 L 0 160 Z" fill="#f4f4f2" stroke="#2a2a2e" stroke-width="3"/><path d="M 0 110 L 500 110 L 500 140 L 0 140 Z" fill="#111"/>${text(250, 100, 'POLICE', 26, '#111', { weight: 800 })}
      <rect x="170" y="-6" width="60" height="18" rx="4" fill="#ff2a3a" class="siren-r"/><rect x="230" y="-6" width="60" height="18" rx="4" fill="#2a6aff" class="siren-b"/>
      <circle cx="110" cy="160" r="36" fill="#1a1a1e"/><circle cx="400" cy="160" r="36" fill="#1a1a1e"/><circle cx="110" cy="160" r="14" fill="#888"/><circle cx="400" cy="160" r="14" fill="#888"/></g>
    <g class="siren-r">${glow(u, 'r', 1140, 540, 300, 160, '#ff2a3a', 0.5)}</g><g class="siren-b">${glow(u, 'b', 1200, 540, 300, 160, '#2a6aff', 0.5)}</g>
    ${vignette(u, 0.35)}`);
}

export const CASE2_BACKGROUNDS: Record<string, BgDef> = {
  party: { name: 'The Pratt House, Las Lomas', paint: party, fg: partyFg, particles: 'dust', tint: 'rgba(60,40,140,0.18)' },
  precinct: { name: 'SQPD Narcotics Unit', paint: precinct, particles: 'dust', tint: 'rgba(80,110,80,0.12)' },
  dorm: { name: "Hadley Hall — Chloe's Room", paint: dorm, particles: 'dust', tint: 'rgba(150,80,140,0.14)' },
  crime_lab: { name: 'SQPD Crime Lab', paint: crimeLab, particles: 'none', tint: 'rgba(60,140,150,0.12)' },
  da_office: { name: "District Attorney's Office", paint: daOffice, fg: daDesk, particles: 'dust' },
  taqueria: { name: 'Tacos El Güero', paint: taqueria, particles: 'dust', tint: 'rgba(170,70,40,0.14)' },
  storage: { name: 'SafeKeep Self Storage', paint: storage, fg: storageFg, particles: 'none', tint: 'rgba(170,90,20,0.2)' },
  press: { name: 'City Hall', paint: press, fg: pressFg, particles: 'none' },
  traffic_stop: { name: 'Alvarado & 5th', paint: trafficStop, particles: 'none' },
};
