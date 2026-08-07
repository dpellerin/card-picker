# AGENTS.md

## Project Overview

**card-picker** is a mobile-first web app that simulates a deck of playing cards. Users shake their device or tap to shuffle and pick a random card from a standard 52-card deck. It uses real device motion (accelerometer) for an interactive physical feel.

## Tech Stack

- **Runtime**: Browser (no Node.js server)
- **Language**: TypeScript (strict mode)
- **Bundler**: Vite 8
- **Test Runner**: Vitest 4
- **PWA**: Service worker with web manifest for installability

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check via `tsc`, then build via `vite build` |
| `npm run preview` | Preview the production build |
| `npm test` | Run Vitest (equivalent to `vitest run`) |

## Architecture

### Entry Point

`src/main.ts` — initializes the app, renders the DOM, wires up event listeners, and manages the `AppState` state machine.

### State Machine

The app uses a simple state machine with four states:

1. **onboarding** — Initial state. First tap requests motion permission and transitions to `ready`.
2. **ready** — Waiting for user input (shake or tap) to start shuffling.
3. **shuffling** — Cards are rapidly cycling. Another tap (or app backgrounding) stops the shuffle and picks a card.
4. **selected** — A card is shown. Shake/tap starts another shuffle.

### Modules

| File | Purpose |
|------|---------|
| `src/main.ts` | App shell, state machine, DOM wiring, event handling |
| `src/cards.ts` | Card data model (`Suit`, `Rank`, `Card`), 52-card deck, cryptographically unbiased random card selection |
| `src/motion.ts` | `ShakeDetector` class — processes accelerometer samples and detects shake gestures via an impulse-pair algorithm |
| `src/shuffle-audio.ts` | `ShuffleAudio` class — plays a shuffling sound effect during the shuffle animation |
| `src/style.css` | All styling; uses CSS custom properties, keyframe animations, safe-area insets, and `prefers-reduced-motion` support |

### Public Assets

`public/` contains static assets served at the root:
- `cards/` — SVG card face images (e.g., `ace_of_spades.svg`)
- `card-back.png` — Card back image
- `sw.js` — Service worker for offline/PWA support
- `site.webmanifest` — PWA manifest
- App icons and favicons

## Design Decisions

- **Cryptographic randomness**: `crypto.getRandomValues()` is used instead of `Math.random()` for unbiased, secure card selection.
- **Unbiased indexing**: The random-index algorithm uses rejection sampling to avoid modulo bias when mapping a random 32-bit value onto deck indices.
- **Shake detection**: A two-impulse algorithm within a configurable time window (default 650ms), with a cooldown period (default 1200ms) to prevent false triggers. When only `accelerationIncludingGravity` is available, delta magnitude between consecutive samples is used.
- **Motion permission**: Supports iOS safari's `DeviceMotionEvent.requestPermission()` flow. Falls back gracefully to tap-only controls when motion is unavailable.
- **Touch-optimized**: Uses `touch-action: manipulation`, disables tap highlight, disables user selection, and respects `prefers-reduced-motion`.

## Testing

Tests use Vitest and live alongside source files:
- `src/cards.test.ts` — Unit tests for the card deck, random index generation, and `pickRandomCard`
- `src/motion.test.ts` — Unit tests for the `ShakeDetector`

Run with: `npm test`

## Code of Conduct

- **Never commit or push to git without explicit user instruction.** Always ask for confirmation before running `git commit`, `git push`, or any equivalent operation.

## Conventions

- All TypeScript is in strict mode with `noUnusedLocals` and `noUnusedParameters` enabled.
- Files use explicit `.ts` extensions in imports (required by the bundler module resolution).
- CSS follows BEM-like naming (block, block__element, block--modifier / `.is-state`).
- DOM queries use non-null assertions (`!`) only after explicit null checks.
- Async functions use `void` to explicitly mark fire-and-forget promises.