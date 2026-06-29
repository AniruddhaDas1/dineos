import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-12 w-full rounded-md bg-surface-2 border border-border px-3 text-base text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:border-accent",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
