# Open Bars

Static Astro rebuild of the Open Bars archive: a single-page public collection of CC0 music releases, visually aligned to the original WordPress site but generated at build time from release assets.

## What this repo is
- The public site repo for Open Bars.
- A static archive page grouped by year and ordered reverse-chronologically.
- A frontend that expects one playable MP3 and one downloadable ZIP per release.

## What this repo is not
- Not a CMS.
- Not a server-rendered app.
- Not the long-term home for release assets.

## Stack
- Astro for static site generation.
- Plain CSS and browser JavaScript for the player and interactions.
- DreamHost-friendly static output.

## Local development
```bash
npm install
npm run dev
```

Other useful commands:
```bash
npm run build
npm run preview
npm run check
```

## Release data and assets

Open Bars is designed around a separate public assets repo. By default, release metadata is inferred from the asset folder and file names.

Canonical asset structure:
```text
releases/YYYY/MM/{release}.mp3
releases/YYYY/MM/{release}.zip
```

Example:
```text
releases/2024/01/20240118.mp3
releases/2024/01/20240118.zip
```

Conventions:
- One release maps to one MP3 and one ZIP.
- Release IDs are date-based.
- Releases are grouped by year on the archive page.
- If a release is missing either asset, the build fails.

## Environment configuration

### Canonical mode
Use this once the asset repo follows the canonical structure above.

```bash
OPENBARS_SOURCE_MODE=canonical
OPENBARS_ASSETS_DIR=/absolute/path/to/openbars-assets
OPENBARS_ASSETS_BASE_URL=https://your-user.github.io/openbars-assets/
```

### Migration mode
Temporary compatibility mode for older mixed-source assets.

Expected local sources:
- ZIP files as `YYYY/YYYYMMDD.zip`
- MP3 files under `reference/audio-files/YYYY/MM/YYYYMMDD.mp3`

```bash
OPENBARS_SOURCE_MODE=migration
OPENBARS_MIGRATION_ZIP_DIR=/absolute/path/to/openbars-site
OPENBARS_MIGRATION_AUDIO_DIR=/absolute/path/to/audio-files
OPENBARS_MIGRATION_ZIP_BASE_URL=https://raw.githubusercontent.com/your-user/your-repo/master/
OPENBARS_MIGRATION_AUDIO_BASE_URL=https://raw.githubusercontent.com/your-user/your-repo/master/reference/audio-files/
```

## Deployment notes
- The built site is static and suitable for DreamHost deployment.
- Public MP3 and ZIP files should be served from GitHub-hosted asset URLs.
- This repo should preserve the original archive experience while shedding WordPress-only scaffolding.
