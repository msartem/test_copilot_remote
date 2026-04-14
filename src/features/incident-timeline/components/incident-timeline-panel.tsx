import { useState } from "react";
import type { TimeRange } from "@/types";
import { useIncidents } from "../hooks/use-incidents";
import { IncidentCard } from "./incident-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";

const timeRangeOptions: { value: TimeRange; label: string }[] = [
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last 1 year" },
  { value: "2y", label: "Last 2 years" },
];

export function IncidentTimelinePanel() {
  const [range, setRange] = useState<TimeRange>("6m");
  const { data, loading, error, refetch } = useIncidents(range);

  const selectClass =
    "rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle>Incident Timeline</CardTitle>
          <div className="flex items-center gap-3">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as TimeRange)}
              className={selectClass}
              aria-label="Time range"
            >
              {timeRangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {data && (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {data.length} incident{data.length === 1 ? "" : "s"}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data && (
          <LoadingCard message="Fetching incidents..." />
        )}
        {error && !data && <ErrorDisplay message={error} onRetry={refetch} />}
        {data && data.length === 0 && (
          <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            No incidents reported in the selected time range.
          </p>
        )}
        {data && data.length > 0 && (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {data.map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
