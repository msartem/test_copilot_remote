import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]",
  secondary:
    "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))]",
  destructive:
    "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]",
  outline:
    "border border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
  success:
    "bg-[hsl(var(--status-good))] text-white",
  warning:
    "bg-[hsl(var(--status-warning))] text-black",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
