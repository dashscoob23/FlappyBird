Original prompt: Lets build a flappy bird webapp game.

- Created first playable scaffold with canvas-based Flappy Bird in `index.html`, `style.css`, and `game.js`.
- Implemented start, gameplay, and game-over loops with flapping, gravity, moving pipes, scoring, and collision.
- Added deterministic hooks `window.advanceTime(ms)` and `window.render_game_to_text()` for Playwright-driven testing.
- Added fullscreen toggle (`f`) and retained `Esc` default browser fullscreen exit.
- TODO: Run Playwright client loop and tune collision/spacing/difficulty based on screenshot and text-state validation.
- Migrated project to npm + Vite + TypeScript (`package.json`, `tsconfig.json`, `src/main.ts`, `src/style.css`).
- Preserved gameplay behavior and kept deterministic test hooks on `window`.
- Noted tooling constraint: pinned `vite@6.2.4` to match current Node `v22.4.1`.
- TODO: Validate new Vite-served build with Playwright loop and then commit/push migration.
- Verified TypeScript build using `npm run build` (passes with Vite v6.2.4).
- Ran Playwright validation against Vite dev server; captured screenshots/state under `output/web-game-vite`.
- Confirmed start-to-play-to-gameover flow renders on canvas and text-state hook remains available for automation.
- TODO: Tune difficulty/pipe timing once we gather your preferred gameplay feel (easy/normal/hard).
