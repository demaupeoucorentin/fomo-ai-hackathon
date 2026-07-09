import { Sidebar } from "./_components/sidebar";
import { BRAND } from "@/lib/brand";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/70 px-6 text-sm text-muted-foreground backdrop-blur-md">
          <span className="font-medium text-foreground">{BRAND}</span>
          <span className="text-border">/</span>
          <span>Dashboard</span>
        </header>
        <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
