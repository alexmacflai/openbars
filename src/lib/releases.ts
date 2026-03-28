import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";

export type Release = {
  id: string;
  slug: string;
  date: string;
  year: string;
  audioUrl: string;
  downloadUrl: string;
  durationSeconds: number | null;
  emoji: string;
  isNew: boolean;
};

export type ReleaseManifestEntry = {
  id: string;
  slug: string;
  date: string;
  year: string;
  audioPath: string;
  downloadPath: string;
  audioUrl?: string;
  downloadUrl?: string;
  durationSeconds?: number | null;
};

type ReleaseManifest = {
  generatedAt: string;
  releases: ReleaseManifestEntry[];
};

const EMOJIS = [
  "🥶",
  "😵‍💫",
  "🤐",
  "👽",
  "🤖",
  "💄",
  "🦷",
  "🫀",
  "🪢",
  "🎩",
  "👑",
  "💍",
  "👓",
  "🦅",
  "🐞",
  "🕷️",
  "🕸️",
  "🐺",
  "🍁",
  "🍄",
  "🌚",
  "🪐",
  "🔥",
  "🌈",
  "❄️",
  "🥏",
  "🏵️",
  "🎹",
  "🎧",
  "🎼",
  "🎯",
  "🎲",
  "🚨",
  "🛸",
  "🚀",
  "⚓️",
  "⛱️",
  "⛺️",
  "⛩️",
  "🕹️",
  "💾",
  "🎚️",
  "📡",
  "💎",
  "⚔️",
  "🪬",
  "💊",
  "🎈",
  "🪞",
  "🪩",
  "🪭",
  "🥁",
  "🔌",
  "💀",
  "👠",
  "💍",
  "🍸",
  "🎲",
  "🚦",
  "📼",
  "🎛️",
  "🕳️",
  "🦠",
  "🧪",
  "🎀",
  "📎",
  "🖤",
  "❤️‍🔥",
  "♾️",
  "🟪",
  "📢",
  "♠️",
  "♣️",
  "♦️",
];

type CanonicalRelease = {
  id: string;
  slug: string;
  date: string;
  audioPath: string;
  downloadPath: string;
  durationSeconds?: number | null;
};

const projectRoot = process.cwd();
const sourceMode = process.env.OPENBARS_SOURCE_MODE ?? "canonical";
const snapshotManifestPath = path.join(projectRoot, "public", "releases.snapshot.json");

const canonicalAssetsDir = path.resolve(
  process.env.OPENBARS_ASSETS_DIR ?? path.join(projectRoot, "..", "openbars-assets"),
);
const canonicalAssetsBaseUrl = withTrailingSlash(
  process.env.OPENBARS_ASSETS_BASE_URL ?? "https://alexmacflai.github.io/openbars-assets/",
);
const canonicalAssetsManifestUrl =
  process.env.OPENBARS_ASSETS_MANIFEST_URL ?? toPublicUrl(canonicalAssetsBaseUrl, "releases.json");

const migrationAudioDir = path.resolve(
  process.env.OPENBARS_MIGRATION_AUDIO_DIR ??
    path.join(projectRoot, "reference", "audio-files"),
);
const migrationZipRootDir = path.resolve(
  process.env.OPENBARS_MIGRATION_ZIP_DIR ?? projectRoot,
);
const migrationAudioBaseUrl = withTrailingSlash(
  process.env.OPENBARS_MIGRATION_AUDIO_BASE_URL ??
    "https://raw.githubusercontent.com/alexmacflai/openbars/master/reference/audio-files/",
);
const migrationZipBaseUrl = withTrailingSlash(
  process.env.OPENBARS_MIGRATION_ZIP_BASE_URL ??
    "https://raw.githubusercontent.com/alexmacflai/openbars/master/",
);

export async function getReleases(): Promise<Release[]> {
  const canonicalReleases = await loadCanonicalReleases();

  return canonicalReleases
    .map((release) => ({
      id: release.id,
      slug: release.slug,
      date: release.date,
      year: release.date.slice(0, 4),
      audioUrl:
        sourceMode === "canonical"
          ? toPublicUrl(canonicalAssetsBaseUrl, release.audioPath)
          : toPublicUrl(migrationAudioBaseUrl, release.audioPath),
      downloadUrl:
        sourceMode === "canonical"
          ? toPublicUrl(canonicalAssetsBaseUrl, release.downloadPath)
          : toPublicUrl(migrationZipBaseUrl, release.downloadPath),
      durationSeconds: release.durationSeconds ?? null,
      emoji: emojiForSeed(release.slug),
      isNew: isNewRelease(release.date),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getLiveManifestUrl(): string | null {
  return sourceMode === "canonical" ? canonicalAssetsManifestUrl : null;
}

async function loadCanonicalReleases(): Promise<CanonicalRelease[]> {
  if (sourceMode !== "canonical") {
    return scanMigrationSources();
  }

  const snapshotManifest = await readManifest(snapshotManifestPath);
  if (snapshotManifest?.releases.length) {
    return snapshotManifest.releases.map((release) => ({
      id: release.id,
      slug: release.slug,
      date: release.date,
      audioPath: release.audioPath,
      downloadPath: release.downloadPath,
      durationSeconds: release.durationSeconds ?? null,
    }));
  }

  return scanCanonicalAssets(canonicalAssetsDir);
}

async function scanCanonicalAssets(assetsDir: string): Promise<CanonicalRelease[]> {
  const releasesRoot = path.join(assetsDir, "releases");
  const releaseFiles = await walkFiles(releasesRoot, (relativePath) =>
    /^\d{4}\/\d{2}\/\d{8}\.(mp3|zip)$/i.test(relativePath),
  );
  const grouped = new Map<string, { mp3?: string; zip?: string }>();
  const releases: CanonicalRelease[] = [];

  for (const relativeFile of releaseFiles) {
    const id = path.basename(relativeFile, path.extname(relativeFile));
    const entry = grouped.get(id) ?? {};

    if (relativeFile.toLowerCase().endsWith(".mp3")) {
      entry.mp3 = normalizeSlashes(path.join("releases", relativeFile));
    }

    if (relativeFile.toLowerCase().endsWith(".zip")) {
      entry.zip = normalizeSlashes(path.join("releases", relativeFile));
    }

    grouped.set(id, entry);
  }

  for (const [id, media] of grouped) {
    if (!/^\d{8}$/.test(id)) {
      throw new Error(`Invalid canonical release id "${id}". Expected YYYYMMDD.`);
    }

    const year = id.slice(0, 4);
    const month = id.slice(4, 6);
    const expectedPrefix = `${year}/${month}/`;

    if (!media.mp3 || !media.zip) {
      throw new Error(`Expected both MP3 and ZIP for canonical release ${id}.`);
    }

    if (!media.mp3.startsWith(`releases/${expectedPrefix}`) || !media.zip.startsWith(`releases/${expectedPrefix}`)) {
      throw new Error(`Canonical release ${id} is not stored under releases/${year}/${month}/.`);
    }

    releases.push({
      id,
      slug: id,
      date: `${year}-${month}-${id.slice(6, 8)}`,
      audioPath: media.mp3,
      downloadPath: media.zip,
    });
  }

  if (releases.length === 0) {
    throw new Error(
      `No releases were found in ${releasesRoot}. Set OPENBARS_ASSETS_DIR or switch OPENBARS_SOURCE_MODE.`,
    );
  }

  return releases;
}

async function scanMigrationSources(): Promise<CanonicalRelease[]> {
  const zipFiles = await walkFiles(migrationZipRootDir, (relativePath) =>
    /^\d{4}\/\d{8}\.zip$/i.test(relativePath),
  );
  const mp3Files = await walkFiles(migrationAudioDir, (relativePath) =>
    /^\d{4}\/\d{2}\/\d{8}\.mp3$/i.test(relativePath),
  );

  const zipMap = new Map<string, string>();
  const mp3Map = new Map<string, string[]>();

  for (const relativeZip of zipFiles) {
    const id = path.basename(relativeZip, ".zip");
    zipMap.set(id, relativeZip);
  }

  for (const relativeMp3 of mp3Files) {
    const id = path.basename(relativeMp3, ".mp3");
    const existing = mp3Map.get(id) ?? [];
    existing.push(relativeMp3);
    mp3Map.set(id, existing);
  }

  const releases: CanonicalRelease[] = [];

  for (const [id, downloadPath] of zipMap) {
    if (!/^\d{8}$/.test(id)) {
      continue;
    }

    const audioMatches = mp3Map.get(id) ?? [];
    if (audioMatches.length === 0) {
      throw new Error(`Missing MP3 for release ${id}.`);
    }

    const resolvedAudioPath = resolveMigrationMp3Path(id, audioMatches);

    if (!resolvedAudioPath) {
      throw new Error(
        `Found multiple MP3 candidates for release ${id}: ${audioMatches.join(", ")}.`,
      );
    }

    releases.push({
      id,
      slug: id,
      date: `${id.slice(0, 4)}-${id.slice(4, 6)}-${id.slice(6, 8)}`,
      audioPath: resolvedAudioPath,
      downloadPath,
    });
  }

  const missingZipIds = [...mp3Map.keys()].filter((id) => !zipMap.has(id));
  if (missingZipIds.length > 0) {
    throw new Error(`Missing ZIP for release(s): ${missingZipIds.sort().join(", ")}.`);
  }

  if (releases.length === 0) {
    throw new Error("No releases were found in migration source mode.");
  }

  return releases;
}
async function walkFiles(
  rootDir: string,
  matcher: (relativePath: string) => boolean,
): Promise<string[]> {
  const matches: string[] = [];

  async function visit(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === ".DS_Store") {
        continue;
      }

      const absolutePath = path.join(currentDir, entry.name);
      const relativePath = normalizeSlashes(path.relative(rootDir, absolutePath));

      if (entry.isDirectory()) {
        await visit(absolutePath);
        continue;
      }

      if (matcher(relativePath)) {
        matches.push(relativePath);
      }
    }
  }

  const rootStats = await stat(rootDir).catch(() => null);
  if (!rootStats?.isDirectory()) {
    throw new Error(`Source directory not found: ${rootDir}`);
  }

  await visit(rootDir);

  return matches.sort();
}

function emojiForSeed(seedSource: string): string {
  let seed = 0;
  for (const char of seedSource) {
    seed += char.codePointAt(0) ?? 0;
  }

  return EMOJIS[seed % EMOJIS.length];
}

function resolveMigrationMp3Path(id: string, matches: string[]): string | null {
  if (matches.length === 1) {
    return matches[0];
  }

  const expectedPath = `${id.slice(0, 4)}/${id.slice(4, 6)}/${id}.mp3`;
  const exactMatch = matches.find((match) => match === expectedPath);

  if (exactMatch) {
    return exactMatch;
  }

  return null;
}

function isNewRelease(date: string): boolean {
  const now = new Date();
  const releaseDate = new Date(`${date}T00:00:00`);
  const diffInMs = now.getTime() - releaseDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays <= 30;
}

function toPublicUrl(baseUrl: string, relativePath: string): string {
  return new URL(relativePath, baseUrl).toString();
}

function withTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeSlashes(value: string): string {
  return value.split(path.sep).join("/");
}

async function readManifest(manifestPath: string): Promise<ReleaseManifest | null> {
  const rawManifest = await readFile(manifestPath, "utf8").catch(() => null);

  if (!rawManifest) {
    return null;
  }

  const manifest = JSON.parse(rawManifest) as Partial<ReleaseManifest>;
  if (!Array.isArray(manifest.releases)) {
    throw new Error(`Invalid release manifest: ${manifestPath}`);
  }

  return {
    generatedAt: manifest.generatedAt ?? "",
    releases: manifest.releases.map((release) => normalizeManifestEntry(release)),
  };
}

function normalizeManifestEntry(entry: Partial<ReleaseManifestEntry>): ReleaseManifestEntry {
  if (
    !entry.id ||
    !entry.slug ||
    !entry.date ||
    !entry.year ||
    !entry.audioPath ||
    !entry.downloadPath
  ) {
    throw new Error("Release manifest entry is missing required fields.");
  }

  return {
    id: entry.id,
    slug: entry.slug,
    date: entry.date,
    year: entry.year,
    audioPath: entry.audioPath,
    downloadPath: entry.downloadPath,
    audioUrl: entry.audioUrl,
    downloadUrl: entry.downloadUrl,
    durationSeconds:
      typeof entry.durationSeconds === "number" ? Math.round(entry.durationSeconds) : null,
  };
}
