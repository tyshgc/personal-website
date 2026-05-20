import type { FC, JSX } from "hono/jsx";

import { cn } from "@/shared/utils/cn";

type HeaderProps = JSX.IntrinsicElements["div"];

export const Header: FC<HeaderProps> = ({ class: className, ...props }) => {
  return <div class={cn("flex flex-col gap-1.5 px-6 pt-6", className as string)} {...props} />;
};
