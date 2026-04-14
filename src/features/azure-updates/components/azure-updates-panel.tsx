import { useState, useMemo } from "react";
import { useAzureUpdates } from "../hooks/use-azure-updates";
import { UpdateCard } from "./update-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoadingCard } from "@/components/ui/loading";
import { ErrorDisplay } from "@/components/ui/error-display";

export function AzureUpdatesPanel() {
  const { data, loading, error, refetch } = useAzureUpdates();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = useMemo(() => {
    if (!data) return [];
    const cats = new Set(data.map((u) => u.category));
    return Array.from(cats).sort();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((update) => {
      if (selectedCategory !== "all" && update.category !== selectedCategory)
        return false;
      if (
        searchQuery &&
        !update.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !update.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [data, selectedCategory, searchQuery]);

  const inputClass =
    "rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]";
  const selectClass =
    "rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Azure Blog</CardTitle>
          {data && (
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              {filtered.length} update{filtered.length === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data && (
          <LoadingCard message="Fetching Azure updates..." />
        )}
        {error && !data && <ErrorDisplay message={error} onRetry={refetch} />}
        {data && (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                type="text"
                placeholder="Search updates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={inputClass}
                aria-label="Search updates"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={selectClass}
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                No updates match the current filters.
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {filtered.map((update) => (
                  <UpdateCard key={update.id} update={update} />
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
