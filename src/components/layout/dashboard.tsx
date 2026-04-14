import { Suspense, lazy } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingCard } from "@/components/ui/loading";
import { RefreshCw, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import { useState, useEffect } from "react";

const ServiceHealthPanel = lazy(() =>
  import("@/features/service-health").then((m) => ({
    default: m.ServiceHealthPanel,
  })),
);

const IncidentTimelinePanel = lazy(() =>
  import("@/features/incident-timeline").then((m) => ({
    default: m.IncidentTimelinePanel,
  })),
);

const RegionStatusPanel = lazy(() =>
  import("@/features/region-status").then((m) => ({
    default: m.RegionStatusPanel,
  })),
);

const AzureUpdatesPanel = lazy(() =>
  import("@/features/azure-updates").then((m) => ({
    default: m.AzureUpdatesPanel,
  })),
);

function useCurrentTime() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);
  return now;
}

export function Dashboard() {
  const now = useCurrentTime();
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
          <Clock className="h-3.5 w-3.5" />
          <span>Last checked: {formatDateTime(now.toISOString())}</span>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="inline-flex items-center gap-1.5 rounded-md border border-[hsl(var(--border))] px-3 py-1.5 text-xs text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent))] transition-colors"
          aria-label="Refresh all data"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      <div key={refreshKey} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ErrorBoundary>
            <Suspense fallback={<LoadingCard message="Loading service health..." />}>
              <ServiceHealthPanel />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary>
            <Suspense fallback={<LoadingCard message="Loading incidents..." />}>
              <IncidentTimelinePanel />
            </Suspense>
          </ErrorBoundary>
        </div>

        <ErrorBoundary>
          <Suspense fallback={<LoadingCard message="Loading region status..." />}>
            <RegionStatusPanel />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary>
          <Suspense fallback={<LoadingCard message="Loading Azure updates..." />}>
            <AzureUpdatesPanel />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
