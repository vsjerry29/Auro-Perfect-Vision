import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "plum" | "gold" | "sage" | "outline" | "success" | "warning" | "faint";
}

export function Badge({
  className,
  variant = "sage",
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide uppercase";

  const variantStyles = {
    plum: "bg-plum-muted text-plum",
    gold: "bg-gold-muted text-gold-dark border border-gold/20",
    sage: "bg-sage text-sage-dark",
    outline: "border border-ink-border text-ink-muted bg-white/60",
    success: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
    faint: "bg-canvas-dark/60 text-ink-muted",
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {children}
    </span>
  );
}
