import { defineConfig } from "astro/config";

const site = process.env.OPENBARS_SITE_URL ?? "https://alexmacflai.github.io";
const configuredBase = process.env.OPENBARS_BASE_PATH ?? "/";
const base =
  configuredBase === "/"
    ? configuredBase
    : `/${configuredBase.replace(/^\/+|\/+$/g, "")}/`;

export default defineConfig({
  output: "static",
  site,
  base,
});
