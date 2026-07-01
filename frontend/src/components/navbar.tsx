"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

import { clientFetch } from "@/lib/api-client";

export function Navbar() {
  const pathname = usePathname();
  const [adminName, setAdminName] = useState("Admin User");
  const [adminEmail, setAdminEmail] = useState("admin@ems.com");

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await clientFetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setAdminName(data.user.name);
            setAdminEmail(data.user.email);
          }
        }
      } catch {
        console.error("Failed to fetch admin profile");
      }
    };
    fetchAdminData();
  }, []);

  const getSectionTitle = () => {
    if (pathname === "/") return "Dashboard Overview";
    if (pathname.startsWith("/employees")) return "Employee Directory";
    if (pathname.startsWith("/departments")) return "Department Management";
    if (pathname.startsWith("/payroll")) return "Payroll Records";
    if (pathname.startsWith("/reports")) return "System Reports";
    if (pathname.startsWith("/settings")) return "System Settings";
    if (pathname.startsWith("/profile")) return "Admin Profile";
    return "EMS Portal";
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between px-8 fixed top-0 right-0 left-64 z-20 transition-colors">
      {/* Title */}
      <div>
        <h2 className="font-semibold text-lg text-slate-800 dark:text-slate-100">{getSectionTitle()}</h2>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-slate-200 dark:focus:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-xs outline-none text-slate-800 dark:text-slate-200 transition-all"
          />
        </div>

        {/* Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Profile Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">
            {adminName.split(" ").map(n => n[0]).join("")}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">{adminName}</p>
            <p className="text-[10px] text-slate-400">{adminEmail}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
