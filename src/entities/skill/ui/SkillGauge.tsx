import type { FC } from "hono/jsx";

import type { Skill } from "@/shared/types/skill";

type SkillGaugeProps = {
  skill: Skill;
};

export const SkillGauge: FC<SkillGaugeProps> = ({ skill }) => {
  const value = Math.max(0, Math.min(100, skill.proficiency));
  return (
    <div class="flex items-center gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-baseline justify-between gap-3">
          <span class="truncate text-sm text-paper">{skill.name}</span>
          {skill.nameEn ? (
            <span class="truncate font-mono text-xs text-muted">{skill.nameEn}</span>
          ) : null}
        </div>
        <div class="mt-1.5 h-1.5 rounded-full bg-surface">
          <div
            class="h-full rounded-full bg-accent"
            style={{ width: `${value}%` }}
            aria-label={`proficiency ${value}`}
          />
        </div>
      </div>
      <span class="w-10 text-right font-mono text-xs text-muted tabular-nums">{value}</span>
    </div>
  );
};
