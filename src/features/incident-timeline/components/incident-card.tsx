import { useState } from "react";
import type { Incident } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, formatDateTime } from "@/lib/format";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface IncidentCardProps {
  incident: Incident;
}

const severityVariant: Record<Incident["severity"], "destructive" | "warning" | "secondary"> = {
  critical: "destructive",
  warning: "warning",
  informational: "secondary",
};

const statusLabels: Record<Incident["status"], string> = {
  active: "Active",
  investigating: "Investigating",
  resolved: "Resolved",
};

export function IncidentCard({ incident }: IncidentCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-md border border-[hsl(var(--border))] p-3">
      <button
        className="flex w-full items-start justify-between text-left"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={severityVariant[incident.severity]}>
              {incident.severity}
            </Badge>
            <Badge variant={incident.status === "resolved" ? "outline" : "secondary"}>
              {statusLabels[incident.status]}
            </Badge>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {formatRelativeTime(incident.updatedAt)}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-[hsl(var(--foreground))]">
            {incident.title}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-[hsl(var(--border))] pt-3">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {incident.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
            <span>Started: {formatDateTime(incident.startedAt)}</span>
            {incident.affectedServices.length > 0 && (
              <span>
                Affected: {incident.affectedServices.join(", ")}
              </span>
            )}
          </div>
          {incident.link && (
            <a
              href={incident.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-[hsl(var(--primary))] hover:underline"
            >
              View details
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
