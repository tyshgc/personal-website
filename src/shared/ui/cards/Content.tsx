import type { FC, JSX } from "hono/jsx";

import { cn } from "@/shared/utils/cn";

type ContentProps = JSX.IntrinsicElements["div"];

export const Content: FC<ContentProps> = ({ class: className, ...props }) => {
  return <div class={cn("px-6 py-4", className as string)} {...props} />;
};
