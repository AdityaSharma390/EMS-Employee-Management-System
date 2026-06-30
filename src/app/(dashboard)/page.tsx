import { db } from "@/lib/db";
import { DashboardCharts } from "@/components/dashboard-charts";
import { Users, UserCheck, UserMinus, DollarSign, Building2 } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Disable server component caching

export default async function DashboardPage() {
  // 1. Fetch core stats from DB
  const [totalEmployees, activeEmployees, inactiveEmployees, departmentsCount, recentEmployees] = await Promise.all([
    db.employee.count(),
    db.employee.count({ where: { status: "Active" } }),
    db.employee.count({ where: { status: { in: ["On Leave", "Resigned", "Suspended"] } } }),
    db.department.count(),
    db.employee.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { department: true },
    }),
  ]);

  // 2. Fetch latest payroll sum
  const latestPayroll = await db.payroll.findFirst({
    orderBy: [
      { year: "desc" },
      { month: "desc" },
    ],
    select: { month: true, year: true },
  });

  let monthlyPayrollSum = 0;
  let payrollMonthName = "";

  if (latestPayroll) {
    const sumResult = await db.payroll.aggregate({
      where: {
        month: latestPayroll.month,
        year: latestPayroll.year,
      },
      _sum: {
        netSalary: true,
      },
    });
    monthlyPayrollSum = sumResult._sum.netSalary || 0;
    const date = new Date(latestPayroll.year, latestPayroll.month - 1, 1);
    payrollMonthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  } else {
    payrollMonthName = "No logs yet";
  }

  // 3. Compute Employee Growth
  const joinDates = await db.employee.findMany({
    select: { joiningDate: true },
    orderBy: { joiningDate: "asc" },
  });

  const growthMap = new Map<string, number>();
  for (const emp of joinDates) {
    const date = new Date(emp.joiningDate);
    const key = date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    growthMap.set(key, (growthMap.get(key) || 0) + 1);
  }

  let cumulative = 0;
  const growthData = Array.from(growthMap.entries()).map(([name, val]) => {
    cumulative += val;
    return { name, count: cumulative };
  });

  // Ensure there's data for charts to render if empty
  if (growthData.length === 0) {
    growthData.push({ name: "No data", count: 0 });
  }

  // 4. Compute Salary Distribution
  const employeesList = await db.employee.findMany({
    select: { salary: true },
  });

  const salaryData = [
    { range: "< $50k", count: 0 },
    { range: "$50k - $80k", count: 0 },
    { range: "$80k - $120k", count: 0 },
    { range: "$120k+", count: 0 },
  ];

  for (const emp of employeesList) {
    if (emp.salary < 50000) salaryData[0].count++;
    else if (emp.salary <= 80000) salaryData[1].count++;
    else if (emp.salary <= 120000) salaryData[2].count++;
    else salaryData[3].count++;
  }

  // 5. Compute Department Aggregations
  const departmentCounts = await db.department.findMany({
    select: {
      departmentName: true,
      _count: {
        select: { employees: true },
      },
    },
  });

  const departmentData = departmentCounts.map((dept) => ({
    name: dept.departmentName,
    count: dept._count.employees,
  }));

  if (departmentData.length === 0) {
    departmentData.push({ name: "No Departments", count: 0 });
  }

  // Stats Card data
  const statCards = [
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: Users,
      color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Active Employees",
      value: activeEmployees,
      icon: UserCheck,
      color: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Inactive Employees",
      value: inactiveEmployees,
      icon: UserMinus,
      color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Monthly Payroll",
      value: monthlyPayrollSum > 0 ? `$${monthlyPayrollSum.toLocaleString()}` : "$0",
      subtext: `Month: ${payrollMonthName}`,
      icon: DollarSign,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20",
    },
    {
      title: "Departments",
      value: departmentsCount,
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
            growthData={growthData}
            salaryData={salaryData}
            departmentData={departmentData}
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
                    <p className="text-[10px] text-slate-400 mt-0.5">{emp.designation} • {emp.department.departmentName}</p>
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
