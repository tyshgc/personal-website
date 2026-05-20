import type {
  BulletedListItemBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

import type { OutputBlock } from "@/shared/types/output";

import { BlockRenderer } from "./BlockRenderer";
import { RichText } from "../RichText";

type ListItemBlock = (
  | BulletedListItemBlockObjectResponse
  | NumberedListItemBlockObjectResponse
) & { children?: ReadonlyArray<OutputBlock> };

type ListItemProps = {
  block: ListItemBlock;
};

export const ListItem: FC<ListItemProps> = ({ block }) => {
  const richText =
    block.type === "bulleted_list_item"
      ? block.bulleted_list_item.rich_text
      : block.numbered_list_item.rich_text;

  return (
    <li class="my-1 text-paper">
      <RichText items={richText} />
      {block.children && block.children.length > 0 ? (
        <div class="ml-4">
          <BlockRenderer blocks={block.children} />
        </div>
      ) : null}
    </li>
  );
};
