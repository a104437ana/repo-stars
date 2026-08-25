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
// scatter but never leaves a big empty gap or an accidental clump
function layoutCells(n, usableW, usableH, rnd) {
  let cols = 1;
  let rows = 1;
  if (n > 0) {
    const aspect = usableW / usableH;
    cols = Math.max(1, Math.round(Math.sqrt(n * aspect)));
    rows = Math.max(1, Math.ceil(n / cols));
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

/**
 * Renders a repo's stargazer count as a field of stars.
 * count <= 60: every star drawn is a real one.
 * count > 60: a capped, denser field stands in for the real count.
 * No number is drawn on the image itself - pair it with real markdown text if you want the count legible.
 */
export function renderStarsSVG({ repo, count, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, animate = true }) {
  const n = starCountToRender(count);
  const rnd = mulberry32(hashSeed(`${repo}:${count}`));

  const padX = Math.max(16, width * 0.02);
  const padY = Math.max(10, height * 0.12);
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  const { cols, rows, cells } = layoutCells(n, usableW, usableH, rnd);
  const cellW = usableW / cols;
  const cellH = usableH / rows;
  const rBase = Math.min(cellW, cellH) * 0.36;

  const stars = [];
  for (let i = 0; i < n; i++) {
    const [c, r] = cells[i % cells.length];
    const marginX = cellW * 0.18;
    const marginY = cellH * 0.18;
    const x = padX + c * cellW + marginX + rnd() * (cellW - marginX * 2);
    const y = padY + r * cellH + marginY + rnd() * (cellH - marginY * 2);
    const radius = clamp(rBase * (0.7 + rnd() * 0.55), 4, 18);
    const rot = (rnd() - 0.5) * 0.7;
    const opacity = 0.85 + rnd() * 0.15;
    stars.push({
      x,
      y,
      radius,
      rot,
      opacity,
      delay: Math.round(rnd() * 4000),
      duration: Math.round(2600 + rnd() * 2200),
    });
  }

  const polygons = stars
    .map((s) => {
      const pts = starPoints(s.x, s.y, s.radius, s.rot);
      const style = animate
        ? ` style="animation-delay:${s.delay}ms;animation-duration:${s.duration}ms"`
        : "";
      const cls = animate ? ' class="tw"' : "";
      return `  <polygon points="${pts}" fill="#ffd54a" opacity="${s.opacity.toFixed(2)}" stroke="#7a4e12" stroke-width="1.1" stroke-opacity="0.55" paint-order="stroke fill" filter="url(#glow)"${cls}${style}/>`;
    })
    .join("\n");

  const style = animate
    ? `
  <style>
    .tw { animation-name: twinkle; animation-timing-function: ease-in-out; animation-iteration-count: infinite; transform-box: fill-box; transform-origin: center; }
    @keyframes twinkle { 0%, 100% { opacity: 1; } 50% { opacity: 0.45; } }
    @media (prefers-reduced-motion: reduce) { .tw { animation: none; } }
  </style>`
    : "";

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.4" result="blur"/>
      <feColorMatrix in="blur" mode="matrix"
        values="1 0 0 0 0  0 0.78 0 0 0  0 0 0.2 0 0  0 0 0 0.9 0" result="glowColor"/>
      <feMerge>
        <feMergeNode in="glowColor"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>${style}
${polygons}
</svg>
`;
}

export { THRESHOLD, DEFAULT_WIDTH, DEFAULT_HEIGHT };
