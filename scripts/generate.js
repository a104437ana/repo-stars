import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { renderStarsSVG } from "../lib/svg.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function fetchStarCount(repo, token) {
  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "repo-stars-app",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`GitHub API error for ${repo}: ${res.status}`);
  }

  const data = await res.json();
  return data.stargazers_count ?? 0;
}

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

  // written to the root of the consuming repo (GITHUB_WORKSPACE)
  const workspace = process.env.GITHUB_WORKSPACE ?? resolve(__dirname, "../..");
  writeFileSync(resolve(workspace, "stars.svg"), svg);

  console.log("Done! Generated stars.svg");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
