import type { ParagraphBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

import { RichText } from "../RichText";

type ParagraphProps = {
  block: ParagraphBlockObjectResponse;
};

export const Paragraph: FC<ParagraphProps> = ({ block }) => {
  return (
    <p class="my-4 text-paper leading-relaxed">
      <RichText items={block.paragraph.rich_text} />
    </p>
  );
};
