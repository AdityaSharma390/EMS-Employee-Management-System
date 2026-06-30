"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { departmentSchema, type DepartmentInput } from "@/validations";
import { 
  Building2, User, Plus, Edit2, Trash2, X, Loader2
} from "lucide-react";

interface Department {
  id: string;
  departmentName: string;
  departmentHead: string;
  description: string;
  _count: {
    employees: number;
  };
}

export function DepartmentsClient() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<DepartmentInput>({
    resolver: zodResolver(departmentSchema),
  });

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments);
      }
    } catch (err) {
      console.error("Error loading departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const onAddSubmit = async (data: DepartmentInput) => {
    setFormError(null);
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || "Failed to create department");
        return;
      }
      setIsAddOpen(false);
      reset();
      fetchDepartments();
    } catch {
      setFormError("Server error. Please try again.");
    }
  };

  const onEditSubmit = async (data: DepartmentInput) => {
    if (!editingDept) return;
    setFormError(null);
    try {
      const res = await fetch(`/api/departments/${editingDept.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || "Failed to update department");
        return;
      }
      setEditingDept(null);
      reset();
      fetchDepartments();
    } catch {
      setFormError("Server error. Please try again.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the ${name} department? This action cannot be undone.`)) {
      try {
        const res = await fetch(`/api/departments/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchDepartments();
        } else {
          const data = await res.json();
          alert(data.error || "Failed to delete department");
        }
      } catch {
        alert("Server error deleting department.");
      }
    }
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setValue("departmentName", dept.departmentName);
    setValue("departmentHead", dept.departmentHead);
    setValue("description", dept.description);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Departments</h1>
          <p className="text-xs text-slate-400 mt-1">Manage corporate departments, assigned managers, and workforce allocation.</p>
        </div>
        <button
          onClick={() => { reset(); setIsAddOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 transition-colors cursor-pointer"
        >
          <Plus size={14} /> Add Department
        </button>
      </div>

      {/* Grid of Department Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
          <p className="text-xs text-slate-400">Loading department listings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-indigo-500/20 transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Building2 size={20} />
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Department"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id, dept.departmentName)}
                      className="p-1.5 text-red-400 hover:text-red-650 dark:hover:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                      title="Delete Department"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-slate-850 dark:text-slate-100">{dept.departmentName}</h3>
                  <p className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium">
                    <User size={12} className="text-slate-400" /> Head: {dept.departmentHead}
                  </p>
                  <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                    {dept.description}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 mt-5 pt-4 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                  Staffing Size
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                  {dept._count.employees} Employees
                </span>
              </div>
            </div>
          ))}

          {departments.length === 0 && (
            <div className="col-span-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-16 text-center text-slate-400 text-xs">
              No departments defined yet. Click &quot;Add Department&quot; to start.
            </div>
          )}
        </div>
      )}

      {/* Add & Edit Modal overlays */}
      {(isAddOpen || editingDept !== null) && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {editingDept ? `Edit Department: ${editingDept.departmentName}` : "Add New Department"}
              </h2>
              <button
                onClick={() => { setIsAddOpen(false); setEditingDept(null); }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(editingDept ? onEditSubmit : onAddSubmit)} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              {/* Department Name */}
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Department Name</label>
                <input
                  type="text"
                  {...register("departmentName")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  placeholder="Engineering"
                />
                {errors.departmentName && <p className="text-red-400 text-[9px] mt-1">{errors.departmentName.message}</p>}
              </div>

              {/* Department Head */}
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Department Head</label>
                <input
                  type="text"
                  {...register("departmentHead")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  placeholder="John Smith"
                />
                {errors.departmentHead && <p className="text-red-400 text-[9px] mt-1">{errors.departmentHead.message}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Description</label>
                <textarea
                  rows={3}
                  {...register("description")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100 resize-none"
                  placeholder="Responsible for software architecture and core systems development."
                />
                {errors.description && <p className="text-red-400 text-[9px] mt-1">{errors.description.message}</p>}
              </div>

              {/* Actions */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setEditingDept(null); }}
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
                      Saving...
                    </>
                  ) : (
                    "Save Department"
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
