# Open Bars Agent Notes

## Project Intent
- Preserve the Open Bars experience as a single-page public archive of CC0 music releases.
- Keep the visual design, interactions, and overall feel materially aligned with the WordPress reference.
- Replace WordPress with a simpler static architecture and build-time data ingestion.

## Non-Goals
- No CMS in v1.
- No individual release pages in v1.
- No server-side runtime for zipping, playback, or content rendering.

## Architecture Defaults
- This repo is the site repo.
- Release assets live in a separate public repo.
- The site is built statically and deployed to DreamHost.
- Public MP3 and ZIP files are served from GitHub-hosted asset URLs.
- Release data is derived from folder/file structure by default.

## Content Conventions
- One release should expose one playable MP3 and one downloadable ZIP.
- Release ordering is reverse chronological.
- The archive groups releases by year.
- Canonical asset structure is `releases/YYYY/MM/{release}.mp3` and `releases/YYYY/MM/{release}.zip`.
- If duplicate-day releases ever appear, revisit the structure then instead of planning ahead now.

## Migration Constraint
- Same experience, new architecture.
- When migrating behavior, preserve what the archive page actually uses and ignore WordPress-only scaffolding.

## Collaboration Rule
- If recurring preferences, workflows, or principles emerge, the agent may suggest adding them to this file.
- The agent must not add them automatically; explicit user approval is required before updating this document.
