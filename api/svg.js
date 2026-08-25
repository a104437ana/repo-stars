import { renderStarsSVG, DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../lib/svg.js";

export const config = {
  runtime: "edge",
};

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const repo = searchParams.get("repo");
  const width = Number(searchParams.get("width")) || DEFAULT_WIDTH;
  const height = Number(searchParams.get("height")) || DEFAULT_HEIGHT;

  if (!repo || !repo.includes("/")) {
    return new Response("repo is required, in owner/name format", {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  try {
    const ghRes = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "repo-stars-app",
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });

    if (ghRes.status === 404) {
      return new Response("Repo not found", { status: 404, headers: CORS_HEADERS });
    }
    if (!ghRes.ok) {
      return new Response("GitHub API error", { status: ghRes.status, headers: CORS_HEADERS });
    }

    const data = await ghRes.json();
    const count = data.stargazers_count ?? 0;
    const svg = renderStarsSVG({ count, width, height });

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    return new Response("Error generating SVG", { status: 500, headers: CORS_HEADERS });
  }
}
