import type { FC } from "hono/jsx";

import { OutputCard } from "@/entities/output";
import type { Output } from "@/shared/types/output";

type OutputListProps = {
  outputs: ReadonlyArray<Output>;
};

export const OutputList: FC<OutputListProps> = ({ outputs }) => {
  if (outputs.length === 0) {
    return (
      <p class="font-mono text-sm text-muted">
        no outputs yet — run <code class="text-paper">/publish</code> to sync from
        Notion.
      </p>
    );
  }
  return (
    <ul class="flex flex-col gap-3">
      {outputs.map((output) => (
        <li>
          <OutputCard meta={output.meta} />
        </li>
      ))}
    </ul>
  );
};
