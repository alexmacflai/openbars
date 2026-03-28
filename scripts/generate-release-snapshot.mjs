import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const assetsDir = path.resolve(
  process.env.OPENBARS_ASSETS_DIR ?? path.join(projectRoot, "..", "openbars-assets"),
);
const localManifestPath = path.join(assetsDir, "releases.json");
const outputPath = path.join(projectRoot, "public", "releases.snapshot.json");
const remoteManifestUrl =
  process.env.OPENBARS_ASSETS_MANIFEST_URL ??
  withTrailingSlash(
    process.env.OPENBARS_ASSETS_BASE_URL ?? "https://alexmacflai.github.io/openbars-assets/",
  ) + "releases.json";

async function main() {
  const manifestText = await loadManifestText();
  const manifest = JSON.parse(manifestText);

  if (!Array.isArray(manifest.releases) || manifest.releases.length === 0) {
    throw new Error("Release snapshot source did not contain any releases.");
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Wrote release snapshot to ${outputPath}`);
}

async function loadManifestText() {
  const localStats = await stat(localManifestPath).catch(() => null);

  if (localStats?.isFile()) {
    return readFile(localManifestPath, "utf8");
  }

  const response = await fetch(remoteManifestUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch release manifest from ${remoteManifestUrl}: ${response.status}`);
  }

  return response.text();
}

function withTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
