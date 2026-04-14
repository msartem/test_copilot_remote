import type { AzureService } from "@/types";
import { StatusIndicator } from "@/components/ui/status-indicator";

interface ServiceHealthGridProps {
  services: AzureService[];
}

export function ServiceHealthGrid({ services }: ServiceHealthGridProps) {
  if (services.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
        No services match the current filters.
      </p>
    );
  }

  const grouped = groupByCategory(services);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, categoryServices]) => (
        <div key={category}>
          <h4 className="mb-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
            {category}
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categoryServices.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between rounded-md border border-[hsl(var(--border))] px-3 py-2"
              >
                <span className="text-sm text-[hsl(var(--foreground))]">
                  {service.name}
                </span>
                <StatusIndicator status={service.status} size="sm" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function groupByCategory(
  services: AzureService[],
): Record<string, AzureService[]> {
  const groups: Record<string, AzureService[]> = {};
  for (const service of services) {
    const list = groups[service.category] ?? [];
    list.push(service);
    groups[service.category] = list;
  }
  return groups;
}
