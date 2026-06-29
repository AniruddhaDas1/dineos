import * as React from "react";
import { cn } from "@/lib/cn";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg bg-surface border border-border", className)}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = (p: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-4", p.className)} {...p} />
);

export const CardContent = (p: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4 pt-0", p.className)} {...p} />
);
