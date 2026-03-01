# FlappyBird (Vite + TypeScript)

A canvas-based Flappy Bird web game built with TypeScript and Vite.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (default: `http://127.0.0.1:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Controls

- `Space` or mouse/touch click: flap / start / retry
- `F`: toggle fullscreen
- `Esc`: exit fullscreen

## Project structure

- `src/main.ts`: game loop, physics, pipes, scoring, collisions
- `src/style.css`: page and canvas styling
- `index.html`: app entry

## Free hosting options

You can host this game for free because it is a static frontend app.

### 1) GitHub Pages (best with this repo)

- Free hosting for public repos
- Free default domain: `https://<username>.github.io/<repo>`
- Supports custom domains

### 2) Cloudflare Pages

- Free plan with static hosting
- Free default domain: `*.pages.dev`
- Supports custom domains

### 3) Netlify / Vercel (free tiers)

- Free static hosting tiers
- Free default domain: `*.netlify.app` or `*.vercel.app`
- Support custom domains

## Domain + hosting cost reality

- Hosting can be free (all options above).
- A custom domain (for example `mygame.com`) is usually paid yearly.
- Fully free combo is possible if you use a platform subdomain (`github.io`, `pages.dev`, `netlify.app`, `vercel.app`).

## Suggested path for your repo

1. Push `main` to GitHub.
2. Enable GitHub Pages for this repo (Actions or `gh-pages` branch).
3. Start with the free `github.io` URL.
4. Add a paid custom domain later if you want branding.

## GitHub Pages URL

This repo is configured to deploy to:

- `https://dashscoob23.github.io/FlappyBird`

Deployment is automated via GitHub Actions on every push to `main`:

- workflow file: `.github/workflows/deploy.yml`
