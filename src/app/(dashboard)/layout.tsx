import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Sidebar />

      <div className="pl-64 flex flex-col min-h-screen">
        <Navbar />

        <main className="flex-1 pt-16 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
