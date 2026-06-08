import type { FC } from "hono/jsx";

import { SkillGauge } from "@/entities/skill";
import type { Skill, SkillCategory } from "@/shared/types/skill";
import { SKILL_CATEGORIES } from "@/shared/types/skill";

type SkillsByCategoryProps = {
  skills: ReadonlyArray<Skill>;
};

function groupByCategory(skills: ReadonlyArray<Skill>): Map<SkillCategory, Skill[]> {
  const map = new Map<SkillCategory, Skill[]>();
  for (const skill of skills) {
    const bucket = map.get(skill.category) ?? [];
    bucket.push(skill);
    map.set(skill.category, bucket);
  }
  for (const [, bucket] of map) {
    bucket.sort((a, b) => b.proficiency - a.proficiency);
  }
  return map;
}

export const SkillsByCategory: FC<SkillsByCategoryProps> = ({ skills }) => {
  if (skills.length === 0) {
    return (
      <p class="font-mono text-sm text-muted">
        no skills registered yet — run <code class="text-paper">/publish</code> to sync from Notion.
      </p>
    );
  }
  const grouped = groupByCategory(skills);
  return (
    <div class="grid gap-8 sm:grid-cols-2">
      {SKILL_CATEGORIES.map((category) => {
        const bucket = grouped.get(category);
        if (!bucket || bucket.length === 0) return null;
        return (
          <section class="min-w-0">
            <h3 class="font-mono text-xs uppercase tracking-wider text-muted">### {category}</h3>
            <ul class="mt-3 flex flex-col gap-3">
              {bucket.map((skill) => (
                <li>
                  <SkillGauge skill={skill} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
