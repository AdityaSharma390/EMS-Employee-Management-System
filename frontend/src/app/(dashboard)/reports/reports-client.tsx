"use client";

import { useEffect, useState } from "react";
import { 
  Printer, Loader2, Users, DollarSign, Wallet, ArrowDownToLine
} from "lucide-react";
import { clientFetch } from "@/lib/api-client";

interface Department {
  id: string;
  departmentName: string;
  departmentHead: string;
  _count?: { employees: number };
}

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: Department;
  designation: string;
  salary: number;
  joiningDate: Date;
  status: string;
}

interface Payroll {
  id: string;
  employee: Employee;
  basicSalary: number;
  bonus: number;
  deductions: number;
  tax: number;
  netSalary: number;
  month: number;
  year: number;
}

export function ReportsClient() {
  const [reportType, setReportType] = useState<"employees" | "payroll" | "departments" | "salary">("employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterDept, setFilterDept] = useState("");
  const [filterMonth, setFilterMonth] = useState("6"); // default to June
  const [filterYear, setFilterYear] = useState("2026");

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const [empRes, payRes, deptRes] = await Promise.all([
        clientFetch("/api/employees?limit=1000"),
        clientFetch("/api/payroll"),
        clientFetch("/api/departments")
      ]);

      if (empRes.ok && payRes.ok && deptRes.ok) {
        const empData = await empRes.json();
        const payData = await payRes.json();
        const deptData = await deptRes.json();

        setEmployees(empData.employees);
        setPayrolls(payData.payrolls);
        setDepartments(deptData.departments);
      }
    } catch (err) {
      console.error("Error fetching report datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Compute Report Data based on parameters
  const getCompiledReport = () => {
    if (reportType === "employees") {
      let filtered = [...employees];
      if (filterDept) {
        filtered = filtered.filter(e => e.department.id === filterDept);
      }
      return {
        headers: ["ID", "Name", "Email", "Department", "Designation", "Joining Date", "Status", "Annual Salary"],
        rows: filtered.map(e => [
          e.employeeId,
          e.fullName,
          e.email,
          e.department.departmentName,
          e.designation,
          new Date(e.joiningDate).toLocaleDateString(),
          e.status,
          `$${e.salary.toLocaleString()}`
        ]),
        raw: filtered
      };
    } else if (reportType === "payroll") {
      let filtered = payrolls.filter(p => 
        p.month.toString() === filterMonth && 
        p.year.toString() === filterYear
      );
      if (filterDept) {
        filtered = filtered.filter(p => p.employee.department.id === filterDept);
      }
      return {
        headers: ["ID", "Employee Name", "Department", "Basic Salary", "Bonus", "Deductions", "Tax", "Net Payout"],
        rows: filtered.map(p => [
          p.employee.employeeId,
          p.employee.fullName,
          p.employee.department.departmentName,
          `$${p.basicSalary.toLocaleString()}`,
          `+$${p.bonus.toLocaleString()}`,
          `-$${p.deductions.toLocaleString()}`,
          `-$${p.tax.toLocaleString()}`,
          `$${p.netSalary.toLocaleString()}`
        ]),
        raw: filtered
      };
    } else if (reportType === "departments") {
      const summary = departments.map(d => {
        const deptEmps = employees.filter(e => e.department.id === d.id);
        const activeEmps = deptEmps.filter(e => e.status === "Active").length;
        const totalSalary = deptEmps.reduce((acc, curr) => acc + curr.salary, 0);
        const avgSalary = deptEmps.length > 0 ? totalSalary / deptEmps.length : 0;

        return {
          name: d.departmentName,
          head: d.departmentHead,
          headcount: deptEmps.length,
          active: activeEmps,
          totalBudget: totalSalary,
          avgSalary
        };
      });

      return {
        headers: ["Department Name", "Department Head", "Staff Count", "Active Staff", "Annual Budget", "Average Salary"],
        rows: summary.map(s => [
          s.name,
          s.head,
          s.headcount,
          s.active,
          `$${s.totalBudget.toLocaleString()}`,
          `$${Math.round(s.avgSalary).toLocaleString()}`
        ]),
        raw: summary
      };
    } else {
      // Salary distribution summary
      const ranges = [
        { label: "Entry Level (< $50k)", count: 0, budget: 0 },
        { label: "Mid Level ($50k - $80k)", count: 0, budget: 0 },
        { label: "Senior Level ($80k - $120k)", count: 0, budget: 0 },
        { label: "Executive Level ($120k+)", count: 0, budget: 0 }
      ];

      employees.forEach(e => {
        if (e.salary < 50000) {
          ranges[0].count++;
          ranges[0].budget += e.salary;
        } else if (e.salary <= 80000) {
          ranges[1].count++;
          ranges[1].budget += e.salary;
        } else if (e.salary <= 120000) {
          ranges[2].count++;
          ranges[2].budget += e.salary;
        } else {
          ranges[3].count++;
          ranges[3].budget += e.salary;
        }
      });

      return {
        headers: ["Salary Level", "Headcount", "Percentage", "Annual Cost Pool", "Average Salary"],
        rows: ranges.map(r => {
          const pct = employees.length > 0 ? (r.count / employees.length) * 100 : 0;
          const avg = r.count > 0 ? r.budget / r.count : 0;
          return [
            r.label,
            r.count,
            `${pct.toFixed(1)}%`,
            `$${r.budget.toLocaleString()}`,
            `$${Math.round(avg).toLocaleString()}`
          ];
        }),
        raw: ranges
      };
    }
  };

  const compiled = getCompiledReport();

  // Export to CSV/Excel
  const exportCSV = () => {
    if (compiled.rows.length === 0) return;
    const csvContent = "data:text/csv;charset=utf-8," 
      + [compiled.headers.join(","), ...compiled.rows.map(e => e.map(val => `"${val.toString().replace(/[$+,-]/g, '')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = () => {
    window.print();
  };

  // Summaries computations
  const totalWages = employees.reduce((acc, curr) => acc + curr.salary, 0);
  const avgWage = employees.length > 0 ? totalWages / employees.length : 0;

  return (
    <div className="space-y-6">
      {/* Print settings wrapper */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-report-sheet, #print-report-sheet * {
            visibility: visible;
          }
          #print-report-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            padding: 0 !important;
          }
        }
      `}</style>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 font-sans">System Reports</h1>
          <p className="text-xs text-slate-400 mt-1">Generate, review, and print corporate workforce and financial statement summaries.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            disabled={loading || compiled.rows.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
          >
            <ArrowDownToLine size={14} /> Export CSV/Excel
          </button>
          <button
            onClick={triggerPrint}
            disabled={loading || compiled.rows.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Printer size={14} /> Print Report (PDF)
          </button>
        </div>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800 gap-1 print:hidden">
        <button
          onClick={() => setReportType("employees")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            reportType === "employees"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          Workforce Directory
        </button>
        <button
          onClick={() => setReportType("payroll")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            reportType === "payroll"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          Payroll Analysis
        </button>
        <button
          onClick={() => setReportType("departments")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            reportType === "departments"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          Department Summary
        </button>
        <button
          onClick={() => setReportType("salary")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 cursor-pointer transition-colors ${
            reportType === "salary"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          }`}
        >
          Salary Spread
        </button>
      </div>

      {/* Filter panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap gap-4 items-center print:hidden">
        <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
          Filters:
        </span>

        {/* Department Filter (Applicable for employees and payroll) */}
        {(reportType === "employees" || reportType === "payroll") && (
          <div>
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs outline-none text-slate-700 dark:text-slate-300"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.departmentName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Month/Year selector (Only for payroll) */}
        {reportType === "payroll" && (
          <div className="flex items-center gap-2">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs outline-none text-slate-750 dark:text-slate-300"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2026, m - 1, 1).toLocaleDateString("en-US", { month: "long" })}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs outline-none text-slate-750 dark:text-slate-300"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>
        )}

        <div className="text-[10px] text-slate-400 ml-auto font-medium">
          Total Base Records: {employees.length} Employees
        </div>
      </div>

      {/* Compiled Report Preview Sheet */}
      <div id="print-report-sheet" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-8 space-y-6 print:border-none print:shadow-none">
        {/* Print only Header */}
        <div className="hidden print:flex justify-between items-center border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">EMS Corporate Statement</h1>
            <p className="text-[10px] text-slate-500 mt-1">Generated: {new Date().toLocaleDateString()} • System Report</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold text-slate-800 capitalize">{reportType} Report</h2>
          </div>
        </div>

        {/* Summary metrics strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-5 text-xs">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Users size={12} /> Headcount Pool
            </p>
            <p className="text-lg font-bold text-slate-850 dark:text-slate-100">{employees.length} Staff members</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <DollarSign size={12} /> Total Wage Pool
            </p>
            <p className="text-lg font-bold text-slate-850 dark:text-slate-100">${totalWages.toLocaleString()}/yr</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Wallet size={12} /> Avg Staff Salary
            </p>
            <p className="text-lg font-bold text-slate-850 dark:text-slate-100">${Math.round(avgWage).toLocaleString()}/yr</p>
          </div>
        </div>

        {/* Data list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-xs text-slate-400">Compiling report statistics...</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800/80 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold">
                  {compiled.headers.map((h, i) => (
                    <th key={i} className="py-3 px-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {compiled.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-850/10">
                    {row.map((val, cellIdx) => (
                      <td key={cellIdx} className="py-3 px-5">{val}</td>
                    ))}
                  </tr>
                ))}

                {compiled.rows.length === 0 && (
                  <tr>
                    <td colSpan={compiled.headers.length} className="text-center py-10 text-slate-400">
                      No records found matching current query filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Print Signature block */}
        <div className="hidden print:flex justify-between items-end pt-12 text-[10px] text-slate-500">
          <div>
            <p className="border-t border-slate-300 w-48 text-center pt-2">Authorized Officer Signature</p>
          </div>
          <div>
            <p className="border-t border-slate-300 w-48 text-center pt-2">Date Signed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
