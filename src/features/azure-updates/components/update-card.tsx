import type { AzureUpdate } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/format";
import { ExternalLink } from "lucide-react";

interface UpdateCardProps {
  update: AzureUpdate;
}

export function UpdateCard({ update }: UpdateCardProps) {
  return (
    <div className="rounded-md border border-[hsl(var(--border))] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">{update.category}</Badge>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {formatRelativeTime(update.publishedAt)}
            </span>
          </div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">
            {update.title}
          </p>
          {update.summary && (
            <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
              {update.summary}
            </p>
          )}
        </div>
        {update.link && (
          <a
            href={update.link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-md p-1 hover:bg-[hsl(var(--accent))] transition-colors"
            aria-label={`Read more about ${update.title}`}
          >
            <ExternalLink className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </a>
        )}
      </div>
    </div>
  );
}
