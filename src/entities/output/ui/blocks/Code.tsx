import type { CodeBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { FC } from "hono/jsx";

type CodeProps = {
  block: CodeBlockObjectResponse;
};

export const Code: FC<CodeProps> = ({ block }) => {
  const text = block.code.rich_text.map((t) => t.plain_text).join("");
  const lang = block.code.language;
  return (
    <figure class="my-6 overflow-hidden rounded-md border border-line bg-surface">
      <figcaption class="border-b border-line px-4 py-2 font-mono text-xs text-muted">
        {lang}
      </figcaption>
      <pre class="overflow-x-auto px-4 py-3 font-mono text-sm text-paper">
        <code>{text}</code>
      </pre>
    </figure>
  );
};
