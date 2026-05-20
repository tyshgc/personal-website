import type { ToggleBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

import type { OutputBlock } from "@/shared/types/output";

import { BlockRenderer } from "./BlockRenderer";
import { RichText } from "../RichText";

type ToggleBlock = ToggleBlockObjectResponse & {
  children?: ReadonlyArray<OutputBlock>;
};

type ToggleProps = {
  block: ToggleBlock;
};

export const Toggle: FC<ToggleProps> = ({ block }) => {
  return (
    <details class="my-4 rounded-md border border-line bg-surface px-4 py-3">
      <summary class="cursor-pointer text-paper">
        <RichText items={block.toggle.rich_text} />
      </summary>
      {block.children && block.children.length > 0 ? (
        <div class="mt-3 border-t border-line pt-3">
          <BlockRenderer blocks={block.children} />
        </div>
      ) : null}
    </details>
  );
};
