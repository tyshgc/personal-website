import type { QuoteBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

import type { OutputBlock } from "@/shared/types/output";

import { BlockRenderer } from "./BlockRenderer";
import { RichText } from "../RichText";

type QuoteBlock = QuoteBlockObjectResponse & {
  children?: ReadonlyArray<OutputBlock>;
};

type QuoteProps = {
  block: QuoteBlock;
};

export const Quote: FC<QuoteProps> = ({ block }) => {
  return (
    <blockquote class="my-6 border-l-2 border-accent pl-4 text-muted italic">
      <RichText items={block.quote.rich_text} />
      {block.children && block.children.length > 0 ? (
        <div class="mt-2">
          <BlockRenderer blocks={block.children} />
        </div>
      ) : null}
    </blockquote>
  );
};
