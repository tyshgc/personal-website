import type { FC, JSX, PropsWithChildren } from "hono/jsx";

import { cn } from "@/shared/utils/cn";

type Heading = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

type TitleProps = PropsWithChildren<
  Omit<JSX.IntrinsicElements["h2"], "children"> & {
    as?: Heading;
  }
>;

export const Title: FC<TitleProps> = ({
  as,
  class: className,
  children,
  ...props
}) => {
  const Tag = as ?? "h2";
  return (
    <Tag
      class={cn(
        "text-lg font-semibold tracking-tight text-paper",
        className as string,
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};
