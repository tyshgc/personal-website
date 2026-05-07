import * as fs from "node:fs/promises";
import { resolve } from "node:path";

import { toSSG } from "hono/ssg";

const ROOT = resolve(import.meta.dirname, "..");
const DIST = resolve(ROOT, "dist");
const MANIFEST_PATH = resolve(DIST, ".vite", "manifest.json");

type ManifestEntry = {
  file: string;
  src?: string;
  isEntry?: boolean;
  css?: string[];
};

type Manifest = Record<string, ManifestEntry>;

async function resolveCssHref(): Promise<string> {
  const raw = await fs.readFile(MANIFEST_PATH, "utf8");
  const manifest = JSON.parse(raw) as Manifest;
  const entry = manifest["src/styles/global.css"];
  if (!entry?.file) {
    throw new Error(
      `Could not resolve src/styles/global.css in vite manifest at ${MANIFEST_PATH}`,
    );
  }
  return `/${entry.file}`;
}

async function main(): Promise<void> {
  const cssHref = await resolveCssHref();

  const { assetsConfig } = await import("../src/shared/config/assets");
  assetsConfig.setCssHref(cssHref);

  const { default: app } = await import("../src/app/index");

  const result = await toSSG(app, fs, { dir: DIST });

  if (!result.success) {
    console.error("SSG build failed:", result.error);
    process.exit(1);
  }

  console.log(`SSG build complete. Files written: ${result.files?.length ?? 0}`);
}

await main();
