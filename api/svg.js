import { renderStarsSVG, DEFAULT_WIDTH, DEFAULT_HEIGHT } from "../lib/svg.js";
import { fetchStarCount } from "../lib/github.js";

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
    const count = await fetchStarCount(repo, process.env.GITHUB_TOKEN);
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
    if (err.status === 404) {
      return new Response("Repo not found", { status: 404, headers: CORS_HEADERS });
    }
    return new Response("Error generating SVG", { status: 500, headers: CORS_HEADERS });
  }
}
