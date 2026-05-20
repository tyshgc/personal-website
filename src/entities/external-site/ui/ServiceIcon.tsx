import type { FC } from "hono/jsx";

import type { ExternalSite, ServiceType } from "@/shared/types/external-site";
import { cn } from "@/shared/utils/cn";

type ServiceIconProps = {
  site: ExternalSite;
  class?: string;
};

const LABEL_MAP: Record<ServiceType, string> = {
  X: "X",
  Instagram: "IG",
  Zenn: "Z",
  SpeakerDeck: "SD",
  GitHub: "GH",
  YouTube: "YT",
  image: "",
};

export const ServiceIcon: FC<ServiceIconProps> = ({ site, class: className }) => {
  const baseClass = cn(
    "inline-flex h-8 w-8 items-center justify-center rounded border border-line bg-surface text-paper",
    className,
  );

  if (site.type === "image" && site.iconFile) {
    return (
      <span class={baseClass}>
        <img
          src={site.iconFile}
          alt={site.name}
          class="h-full w-full rounded object-cover"
        />
      </span>
    );
  }

  return (
    <span class={cn(baseClass, "font-mono text-xs font-semibold")}>
      {LABEL_MAP[site.type]}
    </span>
  );
};
