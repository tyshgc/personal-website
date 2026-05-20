import type { FC, JSX } from "hono/jsx";

import { cn } from "@/shared/utils/cn";

type DescriptionProps = JSX.IntrinsicElements["p"];

export const Description: FC<DescriptionProps> = ({
  class: className,
  ...props
}) => {
  return (
    <p
      class={cn("text-sm text-muted", className as string)}
      {...props}
    />
  );
};
