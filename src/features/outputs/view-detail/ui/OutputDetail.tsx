import type { FC } from "hono/jsx";

import { BlockRenderer } from "@/entities/output";
import type { Output } from "@/shared/types/output";
import { formatDate } from "@/shared/utils/formatDate";

type OutputDetailProps = {
  output: Output;
};

export const OutputDetail: FC<OutputDetailProps> = ({ output }) => {
  const { meta, blocks } = output;
  return (
    <article>
      <p class="font-mono text-xs text-muted">
        <a href="/outputs" class="hover:text-paper">
          ← outputs
        </a>
      </p>

      <header class="mt-8">
        <div class="flex items-center gap-3 font-mono text-xs text-muted">
          <span>{formatDate(meta.publishedAt)}</span>
          <span class="text-line">·</span>
          <span class="uppercase">{meta.category}</span>
        </div>
        <h1 class="mt-2 text-4xl font-bold tracking-tight text-paper">{meta.title}</h1>
        {meta.summary ? <p class="mt-3 text-base text-muted">{meta.summary}</p> : null}
        {meta.tags.length > 0 ? (
          <ul class="mt-4 flex flex-wrap gap-1.5 font-mono text-xs text-muted">
            {meta.tags.map((tag) => (
              <li class="rounded border border-line px-1.5 py-0.5">#{tag}</li>
            ))}
          </ul>
        ) : null}
      </header>

      <div class="mt-10">
        <BlockRenderer blocks={blocks} />
      </div>
    </article>
  );
};
