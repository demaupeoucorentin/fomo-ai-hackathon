import { Sidebar } from "./_components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <header className="flex h-14 items-center border-b px-6 text-sm text-muted-foreground">
          Dashboard
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
