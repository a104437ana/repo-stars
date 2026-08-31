import { fetchStarCount } from "../lib/github.js";

export const config = {
  runtime: "edge",
};

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" };

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const repo = searchParams.get("repo");

  if (!repo || !repo.includes("/")) {
    return new Response(JSON.stringify({ error: "repo is required, in owner/name format" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  try {
    const count = await fetchStarCount(repo, process.env.GITHUB_TOKEN);

    return new Response(JSON.stringify({ repo, stars: count }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
        ...CORS_HEADERS,
      },
    });
  } catch (err) {
    const status = err.status === 404 ? 404 : 500;
    const message = err.status === 404 ? "Repo not found" : "GitHub API error";
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
}
