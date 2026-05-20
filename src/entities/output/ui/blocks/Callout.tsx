import type { CalloutBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

import type { OutputBlock } from "@/shared/types/output";

import { BlockRenderer } from "./BlockRenderer";
import { RichText } from "../RichText";

type CalloutBlock = CalloutBlockObjectResponse & {
  children?: ReadonlyArray<OutputBlock>;
};

type CalloutProps = {
  block: CalloutBlock;
};

function renderIcon(icon: CalloutBlockObjectResponse["callout"]["icon"]): string {
  if (!icon) return "💡";
  if (icon.type === "emoji") return icon.emoji;
  return "💡";
}

export const Callout: FC<CalloutProps> = ({ block }) => {
  const icon = renderIcon(block.callout.icon);
  return (
    <aside class="my-6 flex gap-3 rounded-md border border-line bg-surface p-4">
      <span class="select-none text-xl leading-tight">{icon}</span>
      <div class="flex-1 text-paper">
        <RichText items={block.callout.rich_text} />
        {block.children && block.children.length > 0 ? (
          <div class="mt-2">
            <BlockRenderer blocks={block.children} />
          </div>
        ) : null}
      </div>
    </aside>
  );
};
