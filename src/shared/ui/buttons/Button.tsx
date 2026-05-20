import { cva, type VariantProps } from "class-variance-authority";
import type { FC, JSX } from "hono/jsx";

import { cn } from "@/shared/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-accent text-ink hover:bg-accent/90 focus-visible:ring-accent",
        secondary:
          "border border-line bg-transparent text-paper hover:bg-surface focus-visible:ring-line",
        ghost: "text-paper hover:bg-surface focus-visible:ring-line",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = JSX.IntrinsicElements["button"] & VariantProps<typeof buttonVariants>;

export const Button: FC<ButtonProps> = ({
  variant,
  size,
  class: className,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      class={cn(buttonVariants({ variant, size }), className as string)}
      {...props}
    />
  );
};
