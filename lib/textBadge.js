const FILL = "#b58900";
const STROKE = "#5c4400";
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

// No real font metrics available server-side. Digits in this font stack are
// tabular (every digit the same width), so the number part can be measured
// exactly by character; the word/symbol suffixes are a fixed, small set of
// strings, so their pixel widths were measured once and hardcoded instead of
// guessed - a flat per-character estimate overshot noticeably on " stars"
// (letters are narrower than digits), leaving a visible gap in the badge.
const DIGIT_WIDTH = 9.45;
const SEPARATOR_WIDTH = 4.72; // thousands comma, same width as a space here
const SUFFIX_WIDTH = { star: 33.06, stars: 41.56, symbol: 19.96 };

function estimateNumberWidth(numberStr) {
  let width = 0;
  for (const ch of numberStr) {
    width += ch === "," ? SEPARATOR_WIDTH : DIGIT_WIDTH;
  }
  return width;
}

function renderBadgeSVG(numberStr, suffix, suffixWidth) {
  const fontSize = 17;
  const padX = 2;
  const height = 24;
  const width = Math.ceil(estimateNumberWidth(numberStr) + suffixWidth + padX * 2);
  const label = `${numberStr}${suffix}`;

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <text x="${padX}" y="${height - 7}" font-family="${FONT_FAMILY}" font-weight="500" font-size="${fontSize}"
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
  const numberStr = count.toLocaleString();
  const suffix = count === 1 ? " star" : " stars";
  const suffixWidth = count === 1 ? SUFFIX_WIDTH.star : SUFFIX_WIDTH.stars;
  return renderBadgeSVG(numberStr, suffix, suffixWidth);
}

/**
 * Same live SVG text badge as renderStarsTextSVG, but with a ★ symbol
 * instead of the word "star(s)" - same color, size, and font.
 */
export function renderStarsSymbolSVG({ count }) {
  const numberStr = count.toLocaleString();
  return renderBadgeSVG(numberStr, " ★", SUFFIX_WIDTH.symbol);
}
