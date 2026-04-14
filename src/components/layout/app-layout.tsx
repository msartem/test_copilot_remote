import type { ReactNode } from "react";
import { Header } from "./header";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
