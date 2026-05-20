import type { BookmarkBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

type BookmarkProps = {
  block: BookmarkBlockObjectResponse;
};

export const Bookmark: FC<BookmarkProps> = ({ block }) => {
  const url = block.bookmark.url;
  const caption = block.bookmark.caption.map((t) => t.plain_text).join("");

  let host = url;
  try {
    host = new URL(url).host;
  } catch {
    // keep url as-is
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      class="my-6 block rounded-md border border-line bg-surface px-4 py-3 transition-colors hover:border-accent"
    >
      <div class="font-mono text-xs text-muted">{host}</div>
      <div class="mt-1 text-sm text-paper">{caption || url}</div>
    </a>
  );
};
