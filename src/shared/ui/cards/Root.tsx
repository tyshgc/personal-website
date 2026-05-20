import type { FC, JSX } from "hono/jsx";

import { cn } from "@/shared/utils/cn";

type RootProps = JSX.IntrinsicElements["div"];

export const Root: FC<RootProps> = ({ class: className, ...props }) => {
  return (
    <div class={cn("rounded-lg border border-line bg-surface", className as string)} {...props} />
  );
};
