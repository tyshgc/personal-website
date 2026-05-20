import type { FC, JSX } from "hono/jsx";

import { cn } from "@/shared/utils/cn";

type FooterProps = JSX.IntrinsicElements["div"];

export const Footer: FC<FooterProps> = ({ class: className, ...props }) => {
  return (
    <div
      class={cn(
        "flex items-center px-6 pb-6 pt-2 text-sm text-muted",
        className as string,
      )}
      {...props}
    />
  );
};
