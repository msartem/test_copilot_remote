import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({ message, onRetry, className }: ErrorDisplayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-[hsl(var(--destructive))] bg-[hsl(var(--destructive))]/10 p-6 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-[hsl(var(--destructive))]">
        Error loading data
      </p>
      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
        {message}
      </p>
      {onRetry && (
        <button
          className="mt-3 rounded-md bg-[hsl(var(--primary))] px-3 py-1.5 text-xs text-[hsl(var(--primary-foreground))] hover:opacity-90"
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
}
