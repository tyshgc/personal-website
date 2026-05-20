import type { FC } from "hono/jsx";

import { Layout } from "@/app/layout";
import { ExternalSiteList } from "@/features/externals/view-list";
import type { ExternalSite } from "@/shared/types/external-site";

type ExternalsPageProps = {
  sites: ReadonlyArray<ExternalSite>;
};

export const ExternalsPage: FC<ExternalsPageProps> = ({ sites }) => {
  return (
    <Layout title="Externals" currentPath="/externals">
      <h1 class="text-4xl font-bold tracking-tight text-paper"># Externals</h1>
      <p class="mt-3 font-mono text-sm text-muted">
        &gt; {sites.length} {sites.length === 1 ? "site" : "sites"}
      </p>

      <div class="mt-10">
        <ExternalSiteList sites={sites} />
      </div>
    </Layout>
  );
};
