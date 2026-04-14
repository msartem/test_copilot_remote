import { useState, useMemo } from "react";
import { useServiceHealth } from "../hooks/use-service-health";
import { ServiceHealthGrid } from "./service-health-grid";
import { ServiceHealthFilter } from "./service-health-filter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";
import { Badge } from "@/components/ui/badge";

export function ServiceHealthPanel() {
  const { data, loading, error, refetch, categories, summary } =
    useServiceHealth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = useMemo(() => {
    if (!data) return [];
    return data.filter((service) => {
      if (selectedCategory !== "all" && service.category !== selectedCategory)
        return false;
      if (selectedStatus !== "all" && service.status !== selectedStatus)
        return false;
      if (
        searchQuery &&
        !service.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, selectedCategory, selectedStatus, searchQuery]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Service Health</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="success">{summary.healthy} Healthy</Badge>
            {summary.degraded > 0 && (
              <Badge variant="warning">{summary.degraded} Degraded</Badge>
            )}
            {summary.outage > 0 && (
              <Badge variant="destructive">{summary.outage} Outage</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data && <LoadingCard message="Fetching service status..." />}
        {error && !data && <ErrorDisplay message={error} onRetry={refetch} />}
        {data && (
          <>
            <ServiceHealthFilter
              categories={categories}
              selectedCategory={selectedCategory}
              selectedStatus={selectedStatus}
              searchQuery={searchQuery}
              onCategoryChange={setSelectedCategory}
              onStatusChange={setSelectedStatus}
              onSearchChange={setSearchQuery}
            />
            <ServiceHealthGrid services={filteredServices} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
