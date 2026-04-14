import type { RegionHealth } from "@/types";
import { StatusIndicator } from "@/components/ui/status-indicator";

interface RegionStatusMapProps {
  regions: RegionHealth[];
}

export function RegionStatusMap({ regions }: RegionStatusMapProps) {
  const grouped = groupByGeography(regions);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([geography, geoRegions]) => {
        const unhealthy = geoRegions.filter((r) => r.status !== "good").length;
        return (
          <div key={geography}>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                {geography}
              </h4>
              {unhealthy > 0 && (
                <span className="text-xs text-[hsl(var(--status-warning))]">
                  {unhealthy} region{unhealthy === 1 ? "" : "s"} affected
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
              {geoRegions.map((region) => (
                <div
                  key={region.region}
                  className="flex items-center justify-between rounded border border-[hsl(var(--border))] px-2 py-1.5"
                >
                  <span className="truncate text-xs text-[hsl(var(--foreground))]">
                    {region.region}
                  </span>
                  <StatusIndicator
                    status={region.status}
                    size="sm"
                    showLabel={false}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function groupByGeography(
  regions: RegionHealth[],
): Record<string, RegionHealth[]> {
  const groups: Record<string, RegionHealth[]> = {};
  for (const region of regions) {
    const list = groups[region.geography] ?? [];
    list.push(region);
    groups[region.geography] = list;
  }
  return groups;
}
