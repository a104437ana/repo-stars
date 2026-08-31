import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { renderStarsSVG } from "../lib/svg.js";
import { renderStarsTextSVG } from "../lib/textBadge.js";
import { fetchStarCount } from "../lib/github.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const repo = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;

  if (!repo) {
    console.error("Error: missing GITHUB_REPOSITORY");
    process.exit(1);
  }

  console.log(`Fetching star count for ${repo}...`);
  const count = await fetchStarCount(repo, token);
  console.log(`${repo} has ${count} stars`);

  const svg = renderStarsSVG({ count });
  const badgeSvg = renderStarsTextSVG({ count });

  // written to the root of the consuming repo (GITHUB_WORKSPACE)
  const workspace = process.env.GITHUB_WORKSPACE ?? resolve(__dirname, "../..");
  writeFileSync(resolve(workspace, "stars.svg"), svg);
  writeFileSync(resolve(workspace, "stars-badge.svg"), badgeSvg);

  console.log("Done! Generated stars.svg and stars-badge.svg");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
