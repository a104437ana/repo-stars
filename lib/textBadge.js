const FILL = "#b58900";
const STROKE = "#5c4400";
const FONT_FAMILY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

// no real font metrics available server-side - a flat per-character estimate
// is close enough for a small badge that scales as SVG anyway
function estimateTextWidth(text, fontSize) {
  return text.length * fontSize * 0.54;
}

/**
 * Renders a repo's star count as small SVG text, meant to read like a line
 * of README body text (not the star art) while staying live - it's an
 * image, so it's refetched (and can change) every time the page loads,
 * unlike plain markdown text which freezes the moment it's pasted.
 */
export function renderStarsTextSVG({ count }) {
  const label = `${count.toLocaleString()} stars`;
  const fontSize = 15;
  const padX = 2;
  const height = 20;
  const width = Math.ceil(estimateTextWidth(label, fontSize) + padX * 2);

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <text x="${padX}" y="${height - 5}" font-family="${FONT_FAMILY}" font-weight="500" font-size="${fontSize}"
    fill="${FILL}" stroke="${STROKE}" stroke-width="0.5" stroke-opacity="0.6" paint-order="stroke fill">${label}</text>
</svg>
`;
}
