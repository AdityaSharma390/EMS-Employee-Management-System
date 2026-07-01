"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { payrollSchema, type PayrollInput } from "@/validations";
import { clientFetch } from "@/lib/api-client";
import { 
  Plus, Edit2, Trash2, X, Loader2
} from "lucide-react";

interface Department {
  id: string;
  departmentName: string;
}

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  salary: number;
  status: string;
  department: Department;
}

interface PayrollRecord {
  id: string;
  employeeId: string;
  employee: Employee;
  basicSalary: number;
  bonus: number;
  deductions: number;
  tax: number;
  netSalary: number;
  month: number;
  year: number;
}

export function PayrollClient() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState<PayrollRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      bonus: 0,
      deductions: 0,
      tax: 0,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear()
    }
  });

  // Watch fields for real-time Net Salary computation
  const watchedEmployeeId = watch("employeeId");
  const basicInput = watch("basicSalary") || 0;
  const bonusInput = watch("bonus") || 0;
  const deductionsInput = watch("deductions") || 0;
  const taxInput = watch("tax") || 0;

  const calculatedBasic = parseFloat(basicInput.toString()) || 0;
  const calculatedBonus = parseFloat(bonusInput.toString()) || 0;
  const calculatedDeductions = parseFloat(deductionsInput.toString()) || 0;
  const calculatedTax = parseFloat(taxInput.toString()) || 0;
  const netSalaryResult = calculatedBasic + calculatedBonus - calculatedDeductions - calculatedTax;

  // Auto-set basic salary based on selected employee's annual salary (base / 12)
  useEffect(() => {
    if (watchedEmployeeId && employees.length > 0) {
      const selected = employees.find(e => e.id === watchedEmployeeId);
      if (selected && !editingPayroll) {
        const monthlyBase = Math.round((selected.salary / 12) * 100) / 100;
        setValue("basicSalary", monthlyBase);
        // Estimate 15% tax and 5% deductions as starter values for convenience
        setValue("tax", Math.round((monthlyBase * 0.15) * 100) / 100);
        setValue("deductions", Math.round((monthlyBase * 0.05) * 100) / 100);
      }
    }
  }, [watchedEmployeeId, employees, setValue, editingPayroll]);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterMonth) query.append("month", filterMonth);
      if (filterYear) query.append("year", filterYear);

      const res = await clientFetch(`/api/payroll?${query}`);
      if (res.ok) {
        const data = await res.json();
        setPayrolls(data.payrolls);
      }
    } catch {
      console.error("Error loading payroll");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      // Fetch all employees to assign payroll.
      const res = await clientFetch("/api/employees?limit=100");
      if (res.ok) {
        const data = await res.json();
        // Exclude resigned employees
        setEmployees(data.employees.filter((e: Employee) => e.status !== "Resigned"));
      }
    } catch {
      console.error("Error loading employees");
    }
  };

  useEffect(() => {
    fetchPayrolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMonth, filterYear]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const onAddSubmit = async (data: PayrollInput) => {
    setFormError(null);
    try {
      const res = await clientFetch("/api/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || "Failed to log payroll");
        return;
      }
      setIsAddOpen(false);
      reset();
      fetchPayrolls();
    } catch {
      setFormError("Server error. Please try again.");
    }
  };

  const onEditSubmit = async (data: PayrollInput) => {
    if (!editingPayroll) return;
    setFormError(null);
    try {
      const res = await clientFetch(`/api/payroll/${editingPayroll.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || "Failed to update payroll");
        return;
      }
      setEditingPayroll(null);
      reset();
      fetchPayrolls();
    } catch {
      setFormError("Server error. Please try again.");
    }
  };

  const handleDelete = async (id: string, name: string, month: number, year: number) => {
    const formattedDate = new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (confirm(`Are you sure you want to delete the payroll slip of ${name} for ${formattedDate}?`)) {
      try {
        const res = await clientFetch(`/api/payroll/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchPayrolls();
        } else {
          const data = await res.json();
          alert(data.error || "Failed to delete payroll record");
        }
      } catch {
        alert("Server error deleting payroll slip.");
      }
    }
  };

  const openEditModal = (rec: PayrollRecord) => {
    setEditingPayroll(rec);
    setValue("employeeId", rec.employeeId);
    setValue("basicSalary", rec.basicSalary);
    setValue("bonus", rec.bonus);
    setValue("deductions", rec.deductions);
    setValue("tax", rec.tax);
    setValue("month", rec.month);
    setValue("year", rec.year);
  };

  const getMonthName = (m: number) => {
    return new Date(2026, m - 1, 1).toLocaleDateString("en-US", { month: "short" });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Payroll Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage employee salary slips, compute bonuses/deductions, and review payroll logs.</p>
        </div>
        <button
          onClick={() => { reset(); setIsAddOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 transition-colors cursor-pointer"
        >
          <Plus size={14} /> Generate Payroll
        </button>
      </div>

      {/* Filter Options */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label className="text-[10px] uppercase font-semibold text-slate-400">Filter Period:</label>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs outline-none text-slate-750 dark:text-slate-300"
          >
            <option value="">All Months</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2026, m - 1, 1).toLocaleDateString("en-US", { month: "long" })}
              </option>
            ))}
          </select>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs outline-none text-slate-750 dark:text-slate-300"
          >
            <option value="">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>

        {(filterMonth || filterYear) && (
          <button
            onClick={() => { setFilterMonth(""); setFilterYear(""); }}
            className="text-xs font-semibold text-red-500 hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-xs text-slate-400">Loading payroll history...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  <th className="py-4 px-6">Employee ID</th>
                  <th className="py-4 px-6">Full Name</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Pay Period</th>
                  <th className="py-4 px-6">Basic Salary</th>
                  <th className="py-4 px-6">Bonus</th>
                  <th className="py-4 px-6">Deductions</th>
                  <th className="py-4 px-6">Tax</th>
                  <th className="py-4 px-6 font-bold text-slate-800 dark:text-slate-250">Net Salary</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs text-slate-700 dark:text-slate-300">
                {payrolls.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-slate-500 dark:text-slate-400">
                      {rec.employee.employeeId}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-100">
                      {rec.employee.fullName}
                    </td>
                    <td className="py-4 px-6">
                      {rec.employee.department.departmentName}
                    </td>
                    <td className="py-4 px-6 font-medium">
                      {getMonthName(rec.month)} {rec.year}
                    </td>
                    <td className="py-4 px-6">${rec.basicSalary.toLocaleString()}</td>
                    <td className="py-4 px-6 text-green-600 dark:text-green-400">+${rec.bonus.toLocaleString()}</td>
                    <td className="py-4 px-6 text-red-500">-${rec.deductions.toLocaleString()}</td>
                    <td className="py-4 px-6 text-red-500">-${rec.tax.toLocaleString()}</td>
                    <td className="py-4 px-6 font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                      ${rec.netSalary.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(rec)}
                        className="inline-flex p-1.5 text-indigo-400 hover:text-indigo-650 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Slip"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id, rec.employee.fullName, rec.month, rec.year)}
                        className="inline-flex p-1.5 text-red-400 hover:text-red-650 rounded-lg hover:bg-red-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                        title="Delete Slip"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}

                {payrolls.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-400 text-xs">
                      No payroll records logged for this filter period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(isAddOpen || editingPayroll !== null) && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {editingPayroll ? `Edit Payroll Log: ${editingPayroll.employee.fullName}` : "Generate Employee Payroll"}
              </h2>
              <button
                onClick={() => { setIsAddOpen(false); setEditingPayroll(null); }}
                className="p-1 text-slate-400 hover:text-slate-650 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(editingPayroll ? onEditSubmit : onAddSubmit)} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              {/* Employee Selection */}
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Employee</label>
                <select
                  disabled={editingPayroll !== null}
                  {...register("employeeId")}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs outline-none text-slate-700 dark:text-slate-300 focus:border-indigo-500/50 disabled:opacity-50"
                >
                  <option value="">Select Employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.fullName} ({e.employeeId} - {e.department.departmentName})
                    </option>
                  ))}
                </select>
                {errors.employeeId && <p className="text-red-400 text-[9px] mt-1">{errors.employeeId.message}</p>}
              </div>

              {/* Pay Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Month</label>
                  <select
                    {...register("month")}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs outline-none text-slate-700 dark:text-slate-300 focus:border-indigo-500/50"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        {new Date(2026, m - 1, 1).toLocaleDateString("en-US", { month: "long" })}
                      </option>
                    ))}
                  </select>
                  {errors.month && <p className="text-red-400 text-[9px] mt-1">{errors.month.message}</p>}
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Year</label>
                  <select
                    {...register("year")}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs outline-none text-slate-700 dark:text-slate-300 focus:border-indigo-500/50"
                  >
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                  {errors.year && <p className="text-red-400 text-[9px] mt-1">{errors.year.message}</p>}
                </div>
              </div>

              {/* Salaries Grid */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/85 pt-4">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Basic Salary ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...register("basicSalary")}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-850 dark:text-slate-100"
                    placeholder="5000"
                  />
                  {errors.basicSalary && <p className="text-red-400 text-[9px] mt-1">{errors.basicSalary.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Bonus ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...register("bonus")}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-855 dark:text-slate-100"
                    placeholder="0"
                  />
                  {errors.bonus && <p className="text-red-400 text-[9px] mt-1">{errors.bonus.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Deductions ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...register("deductions")}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-855 dark:text-slate-100"
                    placeholder="200"
                  />
                  {errors.deductions && <p className="text-red-400 text-[9px] mt-1">{errors.deductions.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Tax Withholding ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...register("tax")}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-855 dark:text-slate-100"
                    placeholder="750"
                  />
                  {errors.tax && <p className="text-red-400 text-[9px] mt-1">{errors.tax.message}</p>}
                </div>
              </div>

              {/* Calculated Net Salary Banner */}
              <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Calculated Net Salary</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Basic + Bonus - Deductions - Tax</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                    ${netSalaryResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setEditingPayroll(null); }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Saving slip...
                    </>
                  ) : (
                    "Confirm Salary Slip"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
