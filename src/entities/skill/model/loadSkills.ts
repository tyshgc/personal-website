import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { Skill } from "@/shared/types/skill";

const SKILLS_PATH = resolve(import.meta.dirname, "../../../content/skills.json");

export async function loadAllSkills(): Promise<ReadonlyArray<Skill>> {
  try {
    const text = await readFile(SKILLS_PATH, "utf8");
    return JSON.parse(text) as Skill[];
  } catch {
    return [];
  }
}
