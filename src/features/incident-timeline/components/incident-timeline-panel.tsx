import { useIncidents } from "../hooks/use-incidents";
import { IncidentCard } from "./incident-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";

export function IncidentTimelinePanel() {
  const { data, loading, error, refetch } = useIncidents();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Incident Timeline</CardTitle>
          {data && (
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {data.length} incident{data.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data && (
          <LoadingCard message="Fetching incidents..." />
        )}
        {error && !data && <ErrorDisplay message={error} onRetry={refetch} />}
        {data && data.length === 0 && (
          <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
            No active incidents reported. All systems are operational.
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
