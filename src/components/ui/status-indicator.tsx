import { cn } from "@/lib/utils";
import type { ServiceStatus } from "@/types";

interface StatusIndicatorProps {
  status: ServiceStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const statusConfig: Record<
  ServiceStatus,
  { label: string; colorClass: string; dotClass: string }
> = {
  good: {
    label: "Healthy",
    colorClass: "text-[hsl(var(--status-good))]",
    dotClass: "bg-[hsl(var(--status-good))]",
  },
  warning: {
    label: "Degraded",
    colorClass: "text-[hsl(var(--status-warning))]",
    dotClass: "bg-[hsl(var(--status-warning))]",
  },
  critical: {
    label: "Outage",
    colorClass: "text-[hsl(var(--status-critical))]",
    dotClass: "bg-[hsl(var(--status-critical))]",
  },
  unknown: {
    label: "Unknown",
    colorClass: "text-[hsl(var(--status-unknown))]",
    dotClass: "bg-[hsl(var(--status-unknown))]",
  },
};

const sizeStyles = {
  sm: { dot: "h-2 w-2", text: "text-xs" },
  md: { dot: "h-3 w-3", text: "text-sm" },
  lg: { dot: "h-4 w-4", text: "text-base" },
};

export function StatusIndicator({
  status,
  size = "md",
  showLabel = true,
  className,
}: StatusIndicatorProps) {
  const config = statusConfig[status];
  const sizeStyle = sizeStyles[size];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      <span className={cn("rounded-full", sizeStyle.dot, config.dotClass)} />
      {showLabel && (
        <span className={cn(sizeStyle.text, config.colorClass, "font-medium")}>
          {config.label}
        </span>
      )}
    </span>
  );
}
