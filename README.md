# Viswajith E — portfolio

Single-page portfolio for Viswajith Elayambari. Dark layout, starfield, shattered-glass hero, and a 3D project rail. Content lives in `src/data/site.ts`.

## Stack

Vite, React 19, TypeScript, Tailwind CSS v4, three.js, GSAP, and Motion for the project modal.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
```

The contact form posts to `/api/telegram`. Set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env` for local delivery. Those values stay out of git.

## Layout notes

The hero photo is `public/hero/hero-bg.jpg`. On screens under 768px the glass shards swap their axes and sample the right side of that plate, where the portrait sits. The 3D project rail shows the eight projects marked `featured` in `src/data/site.ts`. Reduced motion and a missing WebGL context fall back to the full project grid.
