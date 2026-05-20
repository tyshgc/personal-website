import type { FC } from "hono/jsx";

import type { OutputMeta } from "@/shared/types/output";
import { Card } from "@/shared/ui/cards";
import { formatDate } from "@/shared/utils/formatDate";

type OutputCardProps = {
  meta: OutputMeta;
};

export const OutputCard: FC<OutputCardProps> = ({ meta }) => {
  return (
    <a
      href={`/outputs/${meta.slug}`}
      class="block transition-colors hover:bg-surface/60"
    >
      <Card class="border-transparent hover:border-line">
        <Card.Content>
          <div class="flex items-center gap-3 font-mono text-xs text-muted">
            <span>{formatDate(meta.publishedAt)}</span>
            <span class="text-line">·</span>
            <span class="uppercase">{meta.category}</span>
          </div>
          <h3 class="mt-2 text-lg font-semibold tracking-tight text-paper">
            {meta.title}
          </h3>
          {meta.summary ? (
            <p class="mt-1 text-sm text-muted">{meta.summary}</p>
          ) : null}
          {meta.tags.length > 0 ? (
            <ul class="mt-3 flex flex-wrap gap-1.5 font-mono text-xs text-muted">
              {meta.tags.map((tag) => (
                <li class="rounded border border-line px-1.5 py-0.5">#{tag}</li>
              ))}
            </ul>
          ) : null}
        </Card.Content>
      </Card>
    </a>
  );
};
