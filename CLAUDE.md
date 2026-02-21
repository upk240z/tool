# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm run dev          # Start dev server (Vite)
pnpm run dev:netlify  # Start dev server via Netlify CLI (includes serverless functions)
pnpm run build        # Production build
pnpm run check        # TypeScript/Svelte type checking
pnpm run check:watch  # Type checking in watch mode
```

No test suite is configured. Type checking via `pnpm run check` is the primary validation step.

## Architecture

This is a **SvelteKit** developer utility app deployed on **Netlify**, built with TypeScript, Tailwind CSS, and Flowbite-Svelte UI components.

### Routing & Tools

Each developer tool lives at `src/routes/<tool-name>/+page.svelte`. The complete list of tools is defined in `src/lib/constants.ts` (`MENU_LINKS`), which drives both the sidebar nav and the homepage list. **When adding a new tool, create the route and add an entry to `MENU_LINKS`.**

### Shared Libraries (`src/lib/`)

- **`store.ts`** — Svelte writable stores for global `loading` spinner and `toastMessage`, plus `getItem`/`setItem` wrappers for localStorage persistence
- **`utils.ts`** — `copyClip()` (clipboard + toast), `setMessage()` (toast), `hash()` (Web Crypto), `buildQuery()`, `encodeUrlWithEncoding()` (iconv-lite)
- **`constants.ts`** — `MENU_LINKS` array (single source of truth for navigation)
- **`fld.ts`** — Fixed-length data file parser (Shift-JIS via encoding-japanese); definitions saved in localStorage
- **`flat-xml-parser.ts`** — Parses flat/sequential XML into grouped objects using `fast-xml-parser`
- **`map.ts`**, **`bingo.ts`** — Tool-specific logic

### Components (`src/lib/components/`)

- **`ResultBox.svelte`** — Reusable output display with label, `<pre>` block, and copy-to-clipboard button. Props: `label: string`, `text: string`. Only renders when `text.length > 0`.

### Netlify Serverless Functions (`netlify/functions/`)

Handles LINE Messaging API calls (rich menu management). Functions use `lib.ts` helpers for CORS and response formatting, and `line-client.ts` (`LineClient` class) for LINE API communication. The frontend passes a LINE channel access token via the `line-token` request header.

### Environment Variables

- `PUBLIC_NETLIFY_FUNCTION_BASE` — Base URL for Netlify functions (set in `.env.local` for local dev)

### Deployment

Netlify adapter with `fallback: 'index.html'` (SPA mode). Build command is `pnpm run build`, publish directory is `build`.
