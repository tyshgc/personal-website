import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export type OutputStatus = "Draft" | "Published";
export type OutputCategory = "insights" | "equestrian";
export type OutputTag = "UI Design" | "Service Design" | "Idea" | "Tech";

export type OutputCover = {
  url: string;
};

export type OutputMeta = {
  id: string;
  title: string;
  slug: string;
  status: OutputStatus;
  category: OutputCategory;
  tags: ReadonlyArray<OutputTag>;
  summary: string;
  cover?: OutputCover;
  publishedAt: string;
  updatedAt: string;
};

export type OutputBlock = BlockObjectResponse & {
  children?: ReadonlyArray<OutputBlock>;
};

export type Output = {
  meta: OutputMeta;
  blocks: ReadonlyArray<OutputBlock>;
};
