import type { FC } from "hono/jsx";

import type { OutputBlock } from "@/shared/types/output";

import { Bookmark } from "./Bookmark";
import { Callout } from "./Callout";
import { Code } from "./Code";
import { Columns } from "./Columns";
import { Divider } from "./Divider";
import { Heading } from "./Heading";
import { Image } from "./Image";
import { ListItem } from "./ListItem";
import { Paragraph } from "./Paragraph";
import { Quote } from "./Quote";
import { Table } from "./Table";
import { Toggle } from "./Toggle";
import { VideoEmbed } from "./VideoEmbed";

type BlockGroup =
  | { kind: "single"; block: OutputBlock }
  | { kind: "bulleted_list"; items: OutputBlock[] }
  | { kind: "numbered_list"; items: OutputBlock[] };

function groupBlocks(blocks: ReadonlyArray<OutputBlock>): BlockGroup[] {
  const groups: BlockGroup[] = [];
  for (const block of blocks) {
    if (block.type === "bulleted_list_item") {
      const last = groups[groups.length - 1];
      if (last?.kind === "bulleted_list") {
        last.items.push(block);
      } else {
        groups.push({ kind: "bulleted_list", items: [block] });
      }
    } else if (block.type === "numbered_list_item") {
      const last = groups[groups.length - 1];
      if (last?.kind === "numbered_list") {
        last.items.push(block);
      } else {
        groups.push({ kind: "numbered_list", items: [block] });
      }
    } else {
      groups.push({ kind: "single", block });
    }
  }
  return groups;
}

function renderBlock(block: OutputBlock) {
  switch (block.type) {
    case "paragraph":
      return <Paragraph block={block} />;
    case "heading_1":
    case "heading_2":
    case "heading_3":
      return <Heading block={block} />;
    case "code":
      return <Code block={block} />;
    case "quote":
      return <Quote block={block} />;
    case "image":
      return <Image block={block} />;
    case "callout":
      return <Callout block={block} />;
    case "bookmark":
      return <Bookmark block={block} />;
    case "toggle":
      return <Toggle block={block} />;
    case "column_list":
      return <Columns block={block} />;
    case "divider":
      return <Divider />;
    case "table":
      return <Table block={block} />;
    case "video":
    case "embed":
      return <VideoEmbed block={block} />;
    default:
      return null;
  }
}

type BlockRendererProps = {
  blocks: ReadonlyArray<OutputBlock>;
};

export const BlockRenderer: FC<BlockRendererProps> = ({ blocks }) => {
  const groups = groupBlocks(blocks);
  return (
    <>
      {groups.map((group) => {
        if (group.kind === "bulleted_list") {
          return (
            <ul class="my-4 list-disc pl-6 text-paper">
              {group.items.map((item) => (
                <ListItem
                  block={
                    item as Extract<OutputBlock, { type: "bulleted_list_item" }>
                  }
                />
              ))}
            </ul>
          );
        }
        if (group.kind === "numbered_list") {
          return (
            <ol class="my-4 list-decimal pl-6 text-paper">
              {group.items.map((item) => (
                <ListItem
                  block={
                    item as Extract<OutputBlock, { type: "numbered_list_item" }>
                  }
                />
              ))}
            </ol>
          );
        }
        return renderBlock(group.block);
      })}
    </>
  );
};
