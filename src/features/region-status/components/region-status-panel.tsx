import { useRegionStatus } from "../hooks/use-region-status";
import { RegionStatusMap } from "./region-status-map";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";

export function RegionStatusPanel() {
  const { data, loading, error, refetch } = useRegionStatus();

  const totalRegions = data?.length ?? 0;
  const healthyRegions = data?.filter((r) => r.status === "good").length ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Region Status</CardTitle>
          {data && (
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {healthyRegions}/{totalRegions} regions healthy
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data && (
          <LoadingCard message="Fetching region status..." />
        )}
        {error && !data && <ErrorDisplay message={error} onRetry={refetch} />}
        {data && <RegionStatusMap regions={data} />}
      </CardContent>
    </Card>
  );
}
