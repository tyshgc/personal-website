import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { ExternalSite } from "@/shared/types/external-site";

const EXTERNALS_PATH = resolve(import.meta.dirname, "../../../content/externals.json");

export async function loadAllExternalSites(): Promise<ReadonlyArray<ExternalSite>> {
  try {
    const text = await readFile(EXTERNALS_PATH, "utf8");
    return JSON.parse(text) as ExternalSite[];
  } catch {
    return [];
  }
}
