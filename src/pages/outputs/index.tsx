import type { FC } from "hono/jsx";

import { Layout } from "@/app/layout";
import { OutputList } from "@/features/outputs/view-list";
import type { Output } from "@/shared/types/output";

type OutputsPageProps = {
  outputs: ReadonlyArray<Output>;
};

export const OutputsPage: FC<OutputsPageProps> = ({ outputs }) => {
  return (
    <Layout title="Outputs" currentPath="/outputs">
      <h1 class="text-4xl font-bold tracking-tight text-paper"># Outputs</h1>
      <p class="mt-3 font-mono text-sm text-muted">
        &gt; {outputs.length} {outputs.length === 1 ? "entry" : "entries"}
      </p>

      <div class="mt-10">
        <OutputList outputs={outputs} />
      </div>
    </Layout>
  );
};
