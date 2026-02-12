# Softgames Assignment

<p align="left">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white">
  <img alt="PixiJS" src="https://img.shields.io/badge/PixiJS-v8-EA4AAA?logo=pixiv&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white">
  <img alt="Build" src="https://img.shields.io/badge/build-passing-2ea043">
</p>

Interactive PixiJS demo with three assignment scenes:

- `Ace of Shadows`
- `Magic Words`
- `Phoenix Flame`

Focus areas: scene architecture, lifecycle safety, and rendering performance.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Available Scripts](#available-scripts)
- [Assignment Scenes](#assignment-scenes)
- [Architecture](#architecture)
- [Quality and Lifecycle](#quality-and-lifecycle)
- [Highlights](#highlights)
- [Notes](#notes)

## Tech Stack

- `TypeScript`
- `PixiJS v8`
- `Vite`

## Quick Start

```bash
npm install
npm run dev
```

Open the printed local URL in browser.

## Available Scripts

- `npm run dev` - start development server
- `npm run build` - type-check + production build
- `npm run preview` - preview production build

## Assignment Scenes

| Scene | Requirement | Status |
|---|---|---|
| `Ace of Shadows` | 144 sprite cards in overlapping stacks, move top card every 1s with 2s animation | Done |
| `Magic Words` | Mix text + custom emojis from remote JSON endpoint | Done |
| `Phoenix Flame` | Fire particle demo with max 10 sprites simultaneously | Done |

### 1) Ace of Shadows

- Creates `144` cards as **sprites** (not graphics objects)
- Cards are distributed across stacks and overlap like a deck
- Every `1s` the top card starts moving to another stack
- Movement animation duration is `2s`

Additional UX polish:
- Card rank labels (`2..A`) rendered on card corners
- Config-driven layout/timing/colors via `AceOfShadowsConfig`

### 2) Magic Words

- Loads dialogue data from endpoint:
  - `https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords`
- Supports inline emoji tokens in text, e.g.:
  - `Agreed. {neutral} Though I still maintain...`
- Renders avatars, messages, and rich text line-by-line
- Includes visible custom scrollbar and wheel scrolling

Robustness improvements:
- Retry-friendly URL texture cache
- Parallel loading for emoji/avatar textures
- Clean component split (`scene` / `components` / `services`)
- Config split by responsibility (`panel` layout vs `message` rendering)

### 3) Phoenix Flame

- Particle fire demo with hard limit of `10` sprites at a time
- Aggressive flame behavior driven by service physics
- Layered glow + particle tint/alpha progression

Performance improvements:
- Prebuilt glow graphics (transform updates instead of redraw-per-frame)
- Pool-style particle reuse
- Config-driven spawn/update tuning in `PhoenixFlameConfig`

## Architecture

Core flow:

- `Game` initializes Pixi app and root container
- `SceneManager` switches active scene and forwards resize events
- Each scene implements `IScene`:
  - `onResize(width, height)`
  - `destroy()`
  - `view: Container`

Project layout:

```text
src/
  app/
    Game.ts
    SceneManager.ts
    scenes/
      MenuScene.ts
      IScene.ts
      aceOfShadows/
      magicWords/
      phoenixFlame/
  ui/
    Button.ts
    ScrollBar.ts
```

## Highlights

- Centralized per-scene tuning via config files:
  - `AceOfShadowsConfig`
  - `MagicWordsConfig`
  - `PhoenixFlameConfig`
- Cleaner UI primitives:
  - `Button` supports custom normal/hover colors
  - Fullscreen button label is state-aware (`Enter` / `Exit`)
- Scroll UX:
  - visible custom scrollbar
  - wheel input scoped to dialogue panel bounds

## Quality and Lifecycle

The project includes explicit cleanup paths to avoid leaks:

- Scene teardown on navigation
- Listener cleanup (`resize`, `wheel`, `fullscreenchange`)
- Child display-object destruction where needed
- Optional `Game.destroy()` / `SceneManager.destroy()` lifecycle paths

## Notes

- Fullscreen menu button toggles label dynamically:
  - `Enter Fullscreen` / `Exit Fullscreen`
- Main menu buttons support custom colors and hover colors
- Production build is verified with `npm run build`
