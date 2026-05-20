import type { FC } from "hono/jsx";

import type { ExternalSite } from "@/shared/types/external-site";

import { ServiceIcon } from "./ServiceIcon";

type ExternalSiteLinkProps = {
  site: ExternalSite;
};

export const ExternalSiteLink: FC<ExternalSiteLinkProps> = ({ site }) => {
  const hasUrl = Boolean(site.url);
  const inner = (
    <span class="flex items-center gap-3">
      <ServiceIcon site={site} />
      <span class="flex flex-col">
        <span class="text-sm text-paper">{site.name}</span>
        {site.accountName ? (
          <span class="font-mono text-xs text-muted">{site.accountName}</span>
        ) : null}
      </span>
    </span>
  );

  if (!hasUrl) {
    return <span class="block rounded-md border border-line bg-surface px-4 py-3">{inner}</span>;
  }

  return (
    <a
      href={site.url}
      target="_blank"
      rel="noopener noreferrer"
      class="block rounded-md border border-line bg-surface px-4 py-3 transition-colors hover:border-accent"
    >
      {inner}
    </a>
  );
};
