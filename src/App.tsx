import { ThemeProvider } from "@/hooks/use-theme";
import { AppLayout } from "@/components/layout/app-layout";
import { Dashboard } from "@/components/layout/dashboard";

export function App() {
  return (
    <ThemeProvider>
      <AppLayout>
        <Dashboard />
      </AppLayout>
    </ThemeProvider>
  );
}
