import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="rounded-md p-2 hover:bg-[hsl(var(--accent))] transition-colors"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5 text-[hsl(var(--foreground))]" />
      ) : (
        <Sun className="h-5 w-5 text-[hsl(var(--foreground))]" />
      )}
    </button>
  );
}
