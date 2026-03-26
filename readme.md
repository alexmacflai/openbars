# Open Bars Site

Static rebuild of Open Bars using Astro.

## Architecture
- This repo is the site/app repo.
- Release assets are expected to live in a separate public repo.
- The archive page is generated at build time from the asset structure.
- The site output is static and suitable for DreamHost deployment.

## Commands
```bash
npm install
npm run dev
npm run build
npm run check
```

## Asset Ingestion Modes

### Canonical mode
Default mode once the public `openbars-assets` repo exists in canonical form.

Expected structure:
```text
releases/YYYY/MM/{release}.mp3
releases/YYYY/MM/{release}.zip
```

Optional environment variables:
```bash
OPENBARS_SOURCE_MODE=canonical
OPENBARS_ASSETS_DIR=/absolute/path/to/openbars-assets
OPENBARS_ASSETS_BASE_URL=https://your-user.github.io/openbars-assets/
```

### Migration mode
Keep this around only while reconciling the older mixed sources.

Expected local sources:
- ZIP files in this repo as `YYYY/YYYYMMDD.zip`
- MP3 files under `reference/audio-files/YYYY/MM/YYYYMMDD.mp3`

Optional environment variables:
```bash
OPENBARS_SOURCE_MODE=migration
OPENBARS_MIGRATION_ZIP_DIR=/absolute/path/to/openbars-site
OPENBARS_MIGRATION_AUDIO_DIR=/absolute/path/to/audio-files
OPENBARS_MIGRATION_ZIP_BASE_URL=https://raw.githubusercontent.com/your-user/your-repo/master/
OPENBARS_MIGRATION_AUDIO_BASE_URL=https://raw.githubusercontent.com/your-user/your-repo/master/reference/audio-files/
```

## Validation
- The build fails if a release is missing an MP3 or ZIP.
- Canonical mode requires releases to live under `releases/YYYY/MM/`.
- Migration mode fails if a release id has multiple MP3 matches.
- Releases are sorted reverse-chronologically and grouped by year.
