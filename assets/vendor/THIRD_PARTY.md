# Motion dependencies

- Anime.js 4.5.0 — MIT — https://github.com/juliangarnier/anime
  Official npm UMD bundle. License: anime-LICENSE.md.
- NumberFlow 0.6.2 — MIT — https://github.com/barvian/number-flow
  Bundled for browsers with esbuild 0.25.12; browser export condition.
  License: number-flow-LICENSE.md. Includes esm-env (MIT).

Research alternatives: Motion (MIT) also supports spring animations, but a second general animation engine is unnecessary here.
All runtime files are served locally. No CDN calls or account setup.

NumberFlow is retained as an evaluated dependency but is no longer loaded at runtime; the speed readout now renders stable plain text.

## Optical record transfer

qrcode-generator 1.4.4 (MIT), https://github.com/kazuhikoarase/qrcode-generator
jsQR 1.4.0 (MIT), https://github.com/cozmo/jsQR
fflate 0.8.2 (MIT), https://github.com/101arrowz/fflate
All three are bundled locally into assets/qr-transfer.js; license texts are included beside this file.
