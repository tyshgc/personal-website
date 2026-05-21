import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { OutputBlock } from "../src/shared/types/output";

const PUBLIC_IMAGES = "public/images";

/** Notion-hosted file URLs are signed (expiring) S3 / notion URLs that must be localized. */
function isNotionHosted(url: string): boolean {
  return /amazonaws\.com|notion\.so|notion-static\.com/.test(url);
}

async function downloadMedia(url: string, subdir: string, root: string): Promise<string> {
  const parsed = new URL(url);
  const basename = (parsed.pathname.split("/").pop() || "file").replace(/[^\w.-]/g, "_");
  const hash = createHash("sha1").update(parsed.pathname).digest("hex").slice(0, 8);
  const filename = `${hash}-${basename}`;

  const destDir = resolve(root, PUBLIC_IMAGES, subdir);
  await mkdir(destDir, { recursive: true });

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(resolve(destDir, filename), buf);

  return `/images/${subdir}/${filename}`;
}

/** Localize a single URL if it is Notion-hosted; otherwise return it unchanged. */
export async function localizeUrl(url: string, subdir: string, root: string): Promise<string> {
  if (!url || !isNotionHosted(url)) return url;
  return downloadMedia(url, subdir, root);
}

/** Remove previously-localized assets for a slug so re-publishing does not leave orphans. */
export async function cleanSlugDir(subdir: string, root: string): Promise<void> {
  await rm(resolve(root, PUBLIC_IMAGES, subdir), { recursive: true, force: true });
}

/** Recursively rewrite Notion-hosted file URLs in image/video/file blocks to local paths. */
export async function localizeBlocks(
  blocks: ReadonlyArray<OutputBlock>,
  subdir: string,
  root: string,
): Promise<void> {
  for (const block of blocks) {
    if (block.type === "image" && block.image.type === "file") {
      block.image.file.url = await localizeUrl(block.image.file.url, subdir, root);
    } else if (block.type === "video" && block.video.type === "file") {
      block.video.file.url = await localizeUrl(block.video.file.url, subdir, root);
    } else if (block.type === "file" && block.file.type === "file") {
      block.file.file.url = await localizeUrl(block.file.file.url, subdir, root);
    }
    if (block.children && block.children.length > 0) {
      await localizeBlocks(block.children, subdir, root);
    }
  }
}
