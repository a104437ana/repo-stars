const FILL = "#b58900";
const STROKE = "#5c4400";
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const FONT_SIZE = 17;
const HEIGHT = 24;

// no real font metrics available server-side - a flat per-character estimate
// is close enough for a small badge that scales as SVG anyway
function estimateTextWidth(text, fontSize) {
  return text.length * fontSize * 0.54;
}

// Width is fixed per badge variant, sized for a star count up to 999,999 -
// otherwise the badge (and any inline text wrapped around it) would reflow
// every time the count's digit count changes.
function fixedWidthFor(suffix) {
  return Math.ceil(estimateTextWidth(`999,999${suffix}`, FONT_SIZE) + 4);
}

const WORD_WIDTH = fixedWidthFor(" stars");
const SYMBOL_WIDTH = fixedWidthFor(" ★");

function renderBadgeSVG(label, width) {
  const x = width / 2;

  return `<svg width="${width}" height="${HEIGHT}" viewBox="0 0 ${width} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <text x="${x}" y="${HEIGHT - 7}" text-anchor="middle" font-family="${FONT_FAMILY}" font-weight="500" font-size="${FONT_SIZE}"
    fill="${FILL}" stroke="${STROKE}" stroke-width="0.5" stroke-opacity="0.6" paint-order="stroke fill">${label}</text>
</svg>
`;
}

/**
 * Renders a repo's star count as small SVG text, meant to read like a line
 * of README body text (not the star art) while staying live - it's an
 * image, so it's refetched (and can change) every time the page loads,
 * unlike plain markdown text which freezes the moment it's pasted.
 */
export function renderStarsTextSVG({ count }) {
  const label = `${count.toLocaleString()} ${count === 1 ? "star" : "stars"}`;
  return renderBadgeSVG(label, WORD_WIDTH);
}

/**
 * Same live SVG text badge as renderStarsTextSVG, but with a ★ symbol
 * instead of the word "star(s)" - same color, size, and font.
 */
export function renderStarsSymbolSVG({ count }) {
  const label = `${count.toLocaleString()} ★`;
  return renderBadgeSVG(label, SYMBOL_WIDTH);
}
