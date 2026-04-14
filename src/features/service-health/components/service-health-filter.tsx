interface ServiceHealthFilterProps {
  categories: string[];
  selectedCategory: string;
  selectedStatus: string;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
}

export function ServiceHealthFilter({
  categories,
  selectedCategory,
  selectedStatus,
  searchQuery,
  onCategoryChange,
  onStatusChange,
  onSearchChange,
}: ServiceHealthFilterProps) {
  const selectClass =
    "rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))]";
  const inputClass =
    "rounded-md border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]";

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <input
        type="text"
        placeholder="Search services..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={inputClass}
        aria-label="Search services"
      />
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
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
      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="all">All Statuses</option>
        <option value="good">Healthy</option>
        <option value="warning">Degraded</option>
        <option value="critical">Outage</option>
      </select>
    </div>
  );
}
