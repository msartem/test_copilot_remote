import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

export function LoadingSpinner({ className, size = "md" }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-[hsl(var(--muted-foreground))] border-t-[hsl(var(--primary))]",
          sizeStyles[size],
        )}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}

interface LoadingCardProps {
  message?: string;
}

export function LoadingCard({ message = "Loading data..." }: LoadingCardProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
        {message}
      </p>
    </div>
  );
}
