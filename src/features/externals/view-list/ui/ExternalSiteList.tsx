import type { FC } from "hono/jsx";

import { ExternalSiteLink } from "@/entities/external-site";
import type { ExternalSite } from "@/shared/types/external-site";

type ExternalSiteListProps = {
  sites: ReadonlyArray<ExternalSite>;
};

export const ExternalSiteList: FC<ExternalSiteListProps> = ({ sites }) => {
  if (sites.length === 0) {
    return (
      <p class="font-mono text-sm text-muted">
        no external sites registered yet — run <code class="text-paper">/publish</code> to sync from Notion.
      </p>
    );
  }
  return (
    <ul class="grid gap-3 sm:grid-cols-2">
      {sites.map((site) => (
        <li>
          <ExternalSiteLink site={site} />
        </li>
      ))}
    </ul>
  );
};
