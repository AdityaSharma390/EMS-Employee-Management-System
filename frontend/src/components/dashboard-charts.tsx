"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface DashboardChartsProps {
  growthData: { name: string; count: number }[];
  salaryData: { range: string; count: number }[];
  departmentData: { name: string; count: number }[];
}

export function DashboardCharts({ growthData, salaryData, departmentData }: DashboardChartsProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="h-[350px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
        <div className="h-[350px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Visual Palette
  const PIE_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];
  const gridColor = theme === "dark" ? "#1e293b" : "#f1f5f9";
  const labelColor = theme === "dark" ? "#94a3b8" : "#64748b";

  return (
    <div className="space-y-8">
      {/* Upper Grid: Growth and Salary charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Growth Area Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-6">Employee Growth Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" stroke={labelColor} fontSize={10} tickLine={false} />
                <YAxis stroke={labelColor} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                    borderColor: theme === "dark" ? "#1e293b" : "#e2e8f0",
                    color: theme === "dark" ? "#f8fafc" : "#0f172a",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" name="Total Employees" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Distribution Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-6">Salary Distribution Spread</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="range" stroke={labelColor} fontSize={10} tickLine={false} />
                <YAxis stroke={labelColor} fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                    borderColor: theme === "dark" ? "#1e293b" : "#e2e8f0",
                    color: theme === "dark" ? "#f8fafc" : "#0f172a",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Employees Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Row: Department-wise Count */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-6">Department Headcount</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#0f172a" : "#ffffff",
                    borderColor: theme === "dark" ? "#1e293b" : "#e2e8f0",
                    color: theme === "dark" ? "#f8fafc" : "#0f172a",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {departmentData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{item.name}</p>
                    <p className="text-[10px] text-slate-400">{item.count} Employees</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
