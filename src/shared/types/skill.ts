export const SKILL_CATEGORIES = [
  "Design",
  "Frontend",
  "Backend",
  "Infurastructure",
  "上流工程",
  "分析",
  "Leadership",
  "AI",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export type Skill = {
  id: string;
  name: string;
  nameEn: string;
  category: SkillCategory;
  proficiency: number;
  tags: ReadonlyArray<string>;
};
