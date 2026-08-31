export async function fetchStarCount(repo, token) {
  const res = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "repo-stars-app",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const err = new Error(`GitHub API error for ${repo}: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  return data.stargazers_count ?? 0;
}
