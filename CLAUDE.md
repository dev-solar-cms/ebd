# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app does (see PROJECT.md for the original French spec)

An Electron desktop app (Windows, macOS ARM, Linux) that searches Anna's Archive for ebooks and downloads
them to the user's Downloads folder, with a progress view during download.

## Commands

- `npm run dev` — start electron-vite in dev mode (HMR renderer + auto-restarting main/preload), launches the app window.
- `npm run build` — production build of main/preload/renderer into `out/`.
- `npm run start` — preview a production build (`electron-vite preview`) without packaging.
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, `@electron-toolkit` base + React rules).
- `npm run format` — Prettier write.
- `npm run build:unpack` — build + `electron-builder --dir` (unpacked app, no installer; fastest way to sanity-check a packaged build locally).
- `npm run build:mac` / `build:win` / `build:linux` — build + platform installer via electron-builder.

There is no test runner configured yet.

## Architecture

Standard electron-vite three-process layout, each with its own Vite build config in `electron.vite.config.mjs`:

- `src/main/` — Node/Electron main process. `index.js` creates the `BrowserWindow` and registers all `ipcMain.handle` channels. The actual Anna's Archive logic lives in `src/main/services/`, not in `index.js`, so it stays testable independent of Electron wiring:
  - `services/annasArchive.js` — plain `fetch` + `cheerio` scraping of `/search` and `/md5/{id}` pages. These pages are _not_ bot-protected, so this works with a regular HTTP request.
  - `services/downloader.js` — `resolveMirrorLink()` and `downloadFile()`. Unlike search/details, the `/slow_download/{id}/n/m` page **is** bot-protected (returns 403 to a plain `fetch`/curl — verified during scaffolding) and shows a countdown before revealing the real off-site mirror URL, so it must be loaded in a real `BrowserWindow` and polled via `executeJavaScript` for the first external (non-`annas-archive.gl`) link. The actual download is then done via `webContents.downloadURL()` + the session's `will-download` event (not a manual stream), so it reuses whatever cookies the challenge page set and Electron handles the save-to-Downloads + progress bytes natively via `DownloadItem`.
- `src/preload/index.js` — the only bridge between renderer and main; exposes `window.api.{searchBooks, getBookDetails, downloadBook, onDownloadProgress}` via `contextBridge`. Renderer code must go through this — it has no direct `ipcRenderer`/Node access (`contextIsolation` is on, `sandbox: false` only for the preload itself).
- `src/renderer/` — React UI. `App.jsx` is a single file with three inline view components (`SearchView` → `DetailsView` → `DownloadView`) switched via local state in `App` (`{ name: 'search' | 'details' | 'download' }`) — there's no router since the flow is strictly linear.

IPC channel names are namespaced `annas:*` (`annas:search`, `annas:details`, `annas:download`, and the `annas:download-progress` event pushed from main to renderer during a download).

## Scraping notes (fragile — Anna's Archive markup, not a stable API)

- Search results are parsed by finding `a.js-vim-focus` (the title link, `href="/md5/{id}"`) and reading sibling data from its closest `div.flex.pt-3.pb-3` row: cover `<img>`, `a[href^="/search?q="]` for author/publisher, and `div.text-gray-800` for the "English · PDF · 30.2MB · 2022 · ..." info line (split on the `·` character after stripping the trailing "Save" `<a>`/`<script>`).
- Detail pages reuse the same info-line parsing inside the page's first `div.p-6...shadow-lg` container, and read `a.js-download-link[href^="/slow_download/"]` for the list of slow-download mirrors.
- If results ever come back empty, check these selectors against a fresh `curl` of a search/md5 page before assuming the IPC/network layer is broken — the site's markup is the most likely thing to have shifted.

## Known environment gotcha: Electron binary extraction

In this sandboxed dev environment, `npm install`'s postinstall step for the `electron` package downloads the
correct zip (network egress to GitHub/Azure blob storage works fine) but **silently fails to fully extract it**
using `extract-zip`/`yauzl` under this environment's Node version — it writes only `LICENSES.chromium.html`
and exits 0 with no error, leaving `node_modules/electron/dist/` incomplete and `path.txt` missing. `npm run dev`
then fails with `Error: Electron uninstall`.

If that happens: extract the already-downloaded, checksum-valid zip with the native `unzip` CLI instead, then
recreate `path.txt` by hand:

```bash
ZIP=$(find ~/Library/Caches/electron -name '*.zip' | head -1)
rm -rf node_modules/electron/dist
unzip -q "$ZIP" -d node_modules/electron/dist
printf 'Electron.app/Contents/MacOS/Electron' > node_modules/electron/path.txt
```

(On Linux/Windows the `path.txt` contents would be `electron` / `electron.exe` respectively — adjust if this
recurs on those platforms.)

## Not yet implemented (see PROJECT.md for the full requirement list)

- Code signing for Windows (spec explicitly says no paid certificate — needs its own decision, e.g. accepting
  the SmartScreen warning vs. researching a free/low-cost signing route).
- Desktop icon / Start Menu / Applications entry — electron-builder's NSIS (`createDesktopShortcut: always`)
  and default DMG/AppImage behavior should cover this once real icons replace the template placeholders in
  `build/icon.{ico,icns,png}` and `resources/icon.png`.
