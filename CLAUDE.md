# Claude Code Instructions

## Project Overview

Dual N-Back is a cognitive training web app built with React, TypeScript, and Vite. Players match stimuli (position, audio letter) from N steps back. The game tracks trials, detects matches, and scores performance.

## Package Manager / Runtime

This project uses **bun**. Always use `bun` instead of `node`, `npm`, or `npx`:

- Run tests: `bun test` or `bun run test`
- Install packages: `bun install`
- Run scripts: `bun run <script>`
- Execute files: `bun <file>`

## Development Commands

- `bun run dev` — start dev server (localhost:5173)
- `bun run build` — production build
- `bun run preview` — preview built app
- `bun test` — run tests once (preferred)

## Project Structure

- `src/useGame.ts` — all game logic (trial generation, match detection, scoring)
- `src/App.tsx` — phase routing + keyboard shortcuts
- `src/types.ts` — TypeScript interfaces (GameSettings, Trial, GameState, etc.)
- `src/components/` — presentational components (Settings, Grid, Controls, Results)

## Testing Conventions

- Tests colocated with components (`*.test.tsx` / `*.test.ts`)
- Use `vitest`, `@testing-library/react`, `userEvent.setup()`
- Use `renderHook` + `act` for hook tests
- Mock with `vi.fn()`

## Code Conventions

- Components are presentational; logic lives in `useGame.ts`
- Props use typed interfaces; callbacks named `onX` (e.g., `onStart`, `onUpdate`)
- CSS: kebab-case class names, colocated in `App.css`
- TypeScript strict mode is on — no unused vars/params
