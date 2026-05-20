import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { Output } from "@/shared/types/output";

const OUTPUTS_DIR = resolve(import.meta.dirname, "../../../content/outputs");

export async function loadAllOutputs(): Promise<ReadonlyArray<Output>> {
  let files: string[];
  try {
    files = await readdir(OUTPUTS_DIR);
  } catch {
    return [];
  }

  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  const outputs = await Promise.all(
    jsonFiles.map(async (filename) => {
      const text = await readFile(resolve(OUTPUTS_DIR, filename), "utf8");
      return JSON.parse(text) as Output;
    }),
  );

  return outputs.sort((a, b) =>
    b.meta.publishedAt.localeCompare(a.meta.publishedAt),
  );
}

export async function loadOutputBySlug(slug: string): Promise<Output | null> {
  const path = resolve(OUTPUTS_DIR, `${slug}.json`);
  try {
    const text = await readFile(path, "utf8");
    return JSON.parse(text) as Output;
  } catch {
    return null;
  }
}
