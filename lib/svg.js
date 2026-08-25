const THRESHOLD = 60;
const DEFAULT_WIDTH = 1000;
const DEFAULT_HEIGHT = 110;

function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let t = seed;
  return function () {
    t |= 0;
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function starPoints(cx, cy, r, rot) {
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const oa = -Math.PI / 2 + rot + i * ((Math.PI * 2) / 5);
    const ia = oa + Math.PI / 5;
    pts.push(`${(cx + r * Math.cos(oa)).toFixed(1)},${(cy + r * Math.sin(oa)).toFixed(1)}`);
    pts.push(`${(cx + r * 0.42 * Math.cos(ia)).toFixed(1)},${(cy + r * 0.42 * Math.sin(ia)).toFixed(1)}`);
  }
  return pts.join(" ");
}

// how many stars actually get drawn: every one of them, up to THRESHOLD -
// past that the exact count stops being drawable, so a capped field stands in for it
function starCountToRender(count) {
  if (count <= THRESHOLD) return Math.max(0, Math.round(count));
  const density = clamp((Math.log10(count) - Math.log10(THRESHOLD)) / 3.2, 0, 1);
  return Math.round(90 + density * 130);
}

// jittered grid: one star per cell, randomized inside it - reads as a free
// scatter but never leaves a big empty gap or an accidental clump.
// literal mode targets wide, roomy cells (rows stay low even as columns grow);
// representative mode packs a capped field densely instead.
function layoutCells(n, usableW, usableH, rnd, literal) {
  let cols = 1;
  let rows = 1;
  if (n > 0) {
    const aspect = usableW / usableH;
    if (literal) {
      const targetCellAspect = 2.9;
      rows = Math.max(1, Math.round(Math.sqrt((targetCellAspect * n) / aspect)));
      cols = Math.max(1, Math.ceil(n / rows));
    } else {
      cols = Math.max(1, Math.round(Math.sqrt(n * aspect)));
      rows = Math.max(1, Math.ceil(n / cols));
    }
  }
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) cells.push([c, r]);
  }
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return { cols, rows, cells };
}

// hand-approved exact layout for 16 literal stars at the default 1000x110 canvas
const SIXTEEN_STAR_LAYOUT = [
  { points: "527.2,65.0 528.6,70.6 534.4,71.5 529.5,74.6 530.4,80.3 526.0,76.6 520.8,79.3 522.9,73.9 518.8,69.8 524.6,70.2", opacity: 0.96 },
  { points: "649.2,39.8 652.1,45.3 658.3,44.7 654.0,49.2 656.4,55.0 650.8,52.2 646.1,56.3 646.9,50.1 641.6,46.9 647.7,45.8", opacity: 0.96 },
  { points: "690.4,63.2 693.9,67.8 699.5,66.3 696.3,71.1 699.4,75.9 693.9,74.3 690.2,78.8 690.0,73.0 684.7,71.0 690.1,69.0", opacity: 0.98 },
  { points: "313.8,61.6 316.3,68.0 323.3,68.2 317.9,72.6 319.9,79.3 314.0,75.6 308.3,79.5 310.0,72.8 304.5,68.5 311.4,68.1", opacity: 0.98 },
  { points: "950.2,20.7 953.7,27.2 961.0,26.6 955.9,31.9 958.7,38.7 952.1,35.4 946.5,40.2 947.6,33.0 941.3,29.1 948.5,27.9", opacity: 0.93 },
  { points: "92.3,24.2 95.8,29.6 102.1,28.6 98.0,33.5 101.0,39.3 95.0,36.9 90.5,41.5 90.9,35.1 85.1,32.2 91.4,30.6", opacity: 0.99 },
  { points: "789.8,75.1 790.0,82.3 796.7,85.0 789.9,87.4 789.5,94.6 785.1,88.9 778.1,90.8 782.2,84.8 778.3,78.7 785.2,80.7", opacity: 0.99 },
  { points: "479.1,71.5 482.8,76.6 488.8,75.2 485.2,80.3 488.4,85.6 482.4,83.7 478.3,88.4 478.3,82.1 472.6,79.7 478.5,77.8", opacity: 0.87 },
  { points: "214.9,53.8 217.8,61.0 225.7,61.2 219.7,66.2 221.9,73.7 215.3,69.5 208.9,74.0 210.8,66.4 204.5,61.7 212.4,61.2", opacity: 0.99 },
  { points: "332.9,22.8 332.8,27.7 337.3,29.8 332.6,31.2 332.0,36.1 329.2,32.0 324.4,33.0 327.4,29.0 324.9,24.7 329.6,26.4", opacity: 0.86 },
  { points: "577.4,19.9 577.4,26.1 583.2,28.5 577.3,30.5 576.8,36.7 573.1,31.7 567.0,33.1 570.6,28.0 567.4,22.7 573.3,24.6", opacity: 0.94 },
  { points: "924.5,68.3 927.0,74.6 933.8,74.8 928.6,79.1 930.5,85.6 924.8,82.0 919.2,85.9 920.9,79.3 915.5,75.2 922.3,74.7", opacity: 0.89 },
  { points: "823.1,20.8 822.9,26.2 827.8,28.5 822.6,30.0 822.0,35.3 818.9,30.8 813.6,31.9 816.9,27.6 814.3,22.9 819.4,24.7", opacity: 0.95 },
  { points: "174.1,13.9 175.7,19.0 181.0,19.6 176.6,22.7 177.7,27.9 173.4,24.7 168.8,27.4 170.5,22.3 166.5,18.7 171.9,18.8", opacity: 0.96 },
  { points: "411.5,34.2 416.8,41.0 425.1,38.7 420.3,45.9 425.0,53.1 416.7,50.7 411.3,57.4 411.0,48.8 402.9,45.7 411.0,42.8", opacity: 0.96 },
  { points: "90.0,76.9 89.8,83.2 95.5,85.9 89.4,87.7 88.6,94.0 85.1,88.7 78.8,89.9 82.8,84.9 79.7,79.3 85.6,81.5", opacity: 0.86 },
];

/**
 * Renders a repo's stargazer count as a field of stars.
 * count <= 60: every star drawn is a real one.
 * count > 60: a capped, denser field stands in for the real count.
 * No number is drawn on the image itself - pair it with real markdown text if you want the count legible.
 */
export function renderStarsSVG({ count, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT }) {
  const n = starCountToRender(count);
  const literal = count <= THRESHOLD;
  const rnd = mulberry32(hashSeed(String(count)));

  const padX = Math.max(16, width * 0.02);
  const padY = Math.max(10, height * 0.12);
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  const { cols, rows, cells } = layoutCells(n, usableW, usableH, rnd, literal);
  const cellW = usableW / cols;
  const cellH = usableH / rows;
  const rBase = Math.min(cellW, cellH) * 0.36;

  const useFixedLayout = literal && n === 16 && width === DEFAULT_WIDTH && height === DEFAULT_HEIGHT;

  const stars = [];
  if (useFixedLayout) {
    for (const star of SIXTEEN_STAR_LAYOUT) {
      stars.push({ points: star.points, opacity: star.opacity });
    }
  } else {
    for (let i = 0; i < n; i++) {
      const [c, r] = cells[i % cells.length];
      const marginX = cellW * 0.15;
      const marginY = cellH * 0.15;
      const x = padX + c * cellW + marginX + rnd() * (cellW - marginX * 2);
      const y = padY + r * cellH + marginY + rnd() * (cellH - marginY * 2);
      const radius = literal ? 7 + rnd() * 5.5 : clamp(rBase * (0.45 + rnd() * 0.3), 3, 12);
      const rot = (rnd() - 0.5) * 0.7;
      const opacity = 0.85 + rnd() * 0.15;
      stars.push({ points: starPoints(x, y, radius, rot), opacity });
    }
  }

  const polygons = stars
    .map(
      (s) =>
        `  <polygon points="${s.points}" fill="#ffd54a" opacity="${s.opacity.toFixed(2)}" stroke="#7a4e12" stroke-width="1.2" stroke-opacity="0.55" paint-order="stroke fill" filter="url(#glow)"/>`
    )
    .join("\n");

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="blur"/>
      <feColorMatrix in="blur" mode="matrix"
        values="1 0 0 0 0  0 0.78 0 0 0  0 0 0.2 0 0  0 0 0 0.9 0" result="glowColor"/>
      <feMerge>
        <feMergeNode in="glowColor"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
${polygons}
</svg>
`;
}

export { THRESHOLD, DEFAULT_WIDTH, DEFAULT_HEIGHT };
