# ⭐ repo-stars
## Your GitHub repo's stars for your README ✨

Your GitHub repo's stars, for your README. Up to 60, you see every star. More than that, you see many stars.

See your stars here: https://repo-stars.vercel.app

Example 1:

[![a104437ana/sakura-garden stars](https://repo-stars.vercel.app/api/stars-badge?repo=a104437ana%2Fsakura-garden)](https://github.com/a104437ana/sakura-garden/stargazers)
[![a104437ana/sakura-garden stars](https://repo-stars.vercel.app/api/svg?repo=a104437ana%2Fsakura-garden)](https://github.com/a104437ana/sakura-garden/stargazers)

Example 2:

[![torvalds/linux stars](https://repo-stars.vercel.app/api/stars-badge?repo=torvalds%2Flinux)](https://github.com/torvalds/linux/stargazers)
[![torvalds/linux stars](https://repo-stars.vercel.app/api/svg?repo=torvalds%2Flinux)](https://github.com/torvalds/linux/stargazers)

## ⚡ Quick Setup

1. Go to https://repo-stars.vercel.app
2. Enter `owner/repo`
3. Copy stars
4. Paste into your README
5. Commit and push

## 🔧 Manual Setup

1. Copy the code below
```markdown
[![your-repo stars](https://repo-stars.vercel.app/api/stars-badge?repo=owner/name)](https://github.com/owner/name/stargazers)
[![your-repo stars](https://repo-stars.vercel.app/api/svg?repo=owner/name)](https://github.com/owner/name/stargazers)
```
2. Replace `owner/name` with your repo
3. Paste into your README

Both images are fetched live, so they always reflect the repo's current star count.

## 🚀 Advanced Setup

Prefer the image committed straight into your repo instead of loaded live?

1. Create `.github/workflows/repo-stars.yml`
2. Copy the code below
```yaml
name: Repo Stars

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:

jobs:
  generate:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Generate repo-stars
        uses: a104437ana/repo-stars@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Commit and push
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add stars.svg
          git commit -m "Update repo-stars" || exit 0
          git push
```
3. Paste into the file you just created
4. Copy the code below
```markdown
[![your-repo stars](https://raw.githubusercontent.com/owner/name/main/stars.svg)](https://github.com/owner/name/stargazers)
```
5. Replace `owner/name` with your repo
6. Paste into your README

## Features

- ⭐ Every star drawn is a real one, up to 60 — past that, a capped field represents the count instead of trying to draw it all
- 🌗 One SVG works on both light and dark backgrounds — no separate files, no `<picture>` needed
- 💻 Dedicated [website](https://repo-stars.vercel.app) to preview and copy the snippet

## API

You can also hit the API directly, without going through the site:

`https://repo-stars.vercel.app/api/svg?repo=owner/name`

- `repo` — required, in `owner/name` format
- `width`, `height` — optional, in pixels (default `1000`×`110`)

The image itself carries no text — the count isn't legible from the art alone by design. Pair it with the text badge below if you want the number readable.

To show the count as legible text, without it going stale the moment your star count changes:

`https://repo-stars.vercel.app/api/stars-badge?repo=owner/name`

This renders small SVG text (not the star art) that's refetched — and can change — every time your README is viewed, unlike plain markdown text which freezes the moment it's pasted. The "Quick Setup" snippet already includes this above the star field.

If you just want the raw number as JSON (to build your own text yourself):

`https://repo-stars.vercel.app/api/stars?repo=owner/name`

returns `{ "repo": "owner/name", "stars": 16 }`.

## Also check out

- [sakura-garden](https://sakura-garden.vercel.app) — your GitHub contributions as a blooming garden
- [gitcolors](https://gitcolors.vercel.app) — your contributions graph in any color

## Support

If you like this project, please consider giving it a star ⭐

## Stars
