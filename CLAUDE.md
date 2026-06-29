# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An e-book viewer web application with stylus-based annotation (highlighting, checkboxes) and signature capabilities. Designed for embedding in Google Sites via iframe. Target platform: Android 12 tablets/devices with stylus support.

## Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript (no build tools)
- **Canvas API**: For stylus drawing, annotation overlays, and signature capture
- **Pointer Events API**: For stylus input handling (pressure, tilt) on Android 12
- **Deployment**: Static hosting (GitHub Pages / Firebase Hosting) embedded in Google Sites via iframe

## Architecture

- `index.html` — Main entry point and page structure
- `css/` — Stylesheets (responsive layout, annotation UI, signature modal)
- `js/` — JavaScript modules:
  - Ebook rendering and page navigation
  - Canvas-based annotation layer (highlight, checkbox, freeform drawing)
  - Signature pad with touch/stylus input
  - State persistence (localStorage or IndexedDB)
- `assets/` — Sample ebook content, icons

## Key Constraints

- Google Sites only supports embedding external content via iframe — no direct HTML injection
- Must handle both touch and stylus input; use `pointerType` to distinguish
- Android 12 WebView/Chrome has specific Pointer Events behavior — always use `touch-action: none` on canvas elements
- All state (annotations, signatures) must persist client-side since there's no backend
- Must be fully responsive for tablet viewports (landscape + portrait)

## Development

```bash
# Serve locally for development
npx serve .
# or
python3 -m http.server 8000
```

No build step required — open `index.html` directly or via local server.

## Testing

Manual testing on Android 12 device/emulator with Chrome. Use Chrome DevTools device emulation for basic layout testing, but stylus pressure/tilt requires a real device.
