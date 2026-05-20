import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

import { cn } from "@/shared/utils/cn";

type RichTextProps = {
  items: ReadonlyArray<RichTextItemResponse>;
};

function annotationClasses(item: RichTextItemResponse): string {
  const a = item.annotations;
  return cn(
    a.bold && "font-semibold",
    a.italic && "italic",
    a.strikethrough && "line-through",
    a.underline && "underline underline-offset-2",
    a.code && "rounded bg-surface px-1.5 py-0.5 font-mono text-[0.85em] text-paper",
  );
}

export const RichText: FC<RichTextProps> = ({ items }) => {
  return (
    <>
      {items.map((item) => {
        const text = item.plain_text;
        const classes = annotationClasses(item);
        const content = classes ? <span class={classes}>{text}</span> : text;
        if (item.href) {
          return (
            <a
              href={item.href}
              class="text-accent underline-offset-4 hover:underline"
              target={item.href.startsWith("http") ? "_blank" : undefined}
              rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {content}
            </a>
          );
        }
        return content;
      })}
    </>
  );
};
