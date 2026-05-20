import type {
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

import { RichText } from "../RichText";

type HeadingBlock =
  | Heading1BlockObjectResponse
  | Heading2BlockObjectResponse
  | Heading3BlockObjectResponse;

type HeadingProps = {
  block: HeadingBlock;
};

export const Heading: FC<HeadingProps> = ({ block }) => {
  if (block.type === "heading_1") {
    return (
      <h2 class="mt-12 text-2xl font-bold tracking-tight text-paper">
        <RichText items={block.heading_1.rich_text} />
      </h2>
    );
  }
  if (block.type === "heading_2") {
    return (
      <h3 class="mt-10 text-xl font-semibold tracking-tight text-paper">
        <RichText items={block.heading_2.rich_text} />
      </h3>
    );
  }
  return (
    <h4 class="mt-8 text-base font-semibold tracking-tight text-paper">
      <RichText items={block.heading_3.rich_text} />
    </h4>
  );
};
