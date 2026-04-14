import { ThemeToggle } from "./theme-toggle";
import { APP_TITLE } from "@/config/constants";
import { Activity } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(var(--background))]/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h1 className="text-lg font-semibold text-[hsl(var(--foreground))]">
            {APP_TITLE}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
