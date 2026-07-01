import { DashboardCharts } from "@/components/dashboard-charts";
import { Users, UserCheck, UserMinus, DollarSign, Building2 } from "lucide-react";
import Link from "next/link";
import { serverFetch } from "@/lib/api";

export const revalidate = 0; // Disable server component caching

interface MetricData {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  monthlyWages: number;
  totalDepartments: number;
}

interface ChartData {
  deptHeadcount: { name: string; count: number }[];
  salaryRanges: { range: string; count: number }[];
  growthTrend: { name: string; count: number }[];
}

interface Employee {
  id: string;
  fullName: string;
  designation: string;
  status: string;
  profilePhoto?: string | null;
  department: {
    departmentName: string;
  };
}

export default async function DashboardPage() {
  let metrics: MetricData = {
    totalEmployees: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    monthlyWages: 0,
    totalDepartments: 0
  };

  let recentEmployees: Employee[] = [];
  let charts: ChartData = {
    deptHeadcount: [],
    salaryRanges: [],
    growthTrend: []
  };

  try {
    const res = await serverFetch("/api/dashboard");
    if (res.ok) {
      const data = await res.json();
      metrics = data.metrics;
      recentEmployees = data.recentEmployees;
      charts = data.charts;
    }
  } catch (error) {
    console.error("Dashboard fetch error:", error);
  }

  const statCards = [
    {
      title: "Total Employees",
      value: metrics.totalEmployees,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Active Employees",
      value: metrics.activeEmployees,
      icon: UserCheck,
      color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Inactive Employees",
      value: metrics.inactiveEmployees,
      icon: UserMinus,
      color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Monthly Payroll",
      value: metrics.monthlyWages > 0 ? `$${metrics.monthlyWages.toLocaleString()}` : "$0",
      subtext: "Current Month",
      icon: DollarSign,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Departments",
      value: metrics.totalDepartments,
      icon: Building2,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time statistics and corporate workforce analytics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-2">{card.value}</h3>
              {card.subtext && <p className="text-[10px] text-slate-400 mt-1">{card.subtext}</p>}
            </div>
            <div className={`p-3 rounded-xl shrink-0 ${card.color}`}>
              <card.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Table section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 cols: Charts */}
        <div className="lg:col-span-2">
          <DashboardCharts
            growthData={charts.growthTrend}
            salaryData={charts.salaryRanges}
            departmentData={charts.deptHeadcount}
          />
        </div>

        {/* Right 1 col: Recent Employees */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Recent Employees</h3>
            <Link href="/employees" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {recentEmployees.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                    {emp.profilePhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={emp.profilePhoto} alt={emp.fullName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      emp.fullName.split(" ").map(n => n[0]).join("")
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">{emp.fullName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{emp.designation} • {emp.department?.departmentName || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <span className={`text-[9px] font-semibold px-2 py-1 rounded-full ${
                    emp.status === "Active"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400"
                      : emp.status === "On Leave"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400"
                      : emp.status === "Suspended"
                      ? "bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    {emp.status}
                  </span>
                </div>
              </div>
            ))}

            {recentEmployees.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No recent employees found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
