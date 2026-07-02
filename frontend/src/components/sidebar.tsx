"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  DollarSign, 
  BarChart3, 
  Settings, 
  User, 
  LogOut,
  Briefcase,
  Banknote
} from "lucide-react";
import { useState } from "react";
import { clientFetch } from "@/lib/api-client";

interface SidebarProps {
  isLoggingOut?: boolean;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Employees", href: "/employees", icon: Users },
    { label: "Departments", href: "/departments", icon: Building2 },
    { label: "Payroll", href: "/payroll", icon: Banknote },
    { label: "Reports", href: "/reports", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Profile", href: "/profile", icon: User },
  ];

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      setIsLoggingOut(true);
      try {
        const res = await clientFetch("/api/auth/logout", { method: "POST" });
        // Clear local cookie
        document.cookie = "token=; path=/; max-age=0; Secure; SameSite=Lax";
        
        router.refresh();
        router.push("/login");
      } catch {
        console.error("Logout failed");
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  return (
    <aside className="w-64 h-screen bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-100 flex flex-col fixed left-0 top-0 border-r border-slate-100 dark:border-slate-850 z-30 transition-colors">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-850 flex items-center gap-3">
        <div className="p-2 bg-indigo-600 rounded-lg text-white">
          <Briefcase size={20} />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none text-slate-800 dark:text-white">EMS Admin</h1>
          <span className="text-xs text-slate-400 dark:text-slate-500">Management Suite</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // Strict check for homepage, and prefix check for other pages
          const isActive = item.href === "/" 
            ? pathname === "/" 
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-500 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-450 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout Area */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-850">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-450 hover:bg-red-50/70 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-all duration-200 cursor-pointer disabled:opacity-50"
        >
          <LogOut size={18} />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </aside>
  );
}
