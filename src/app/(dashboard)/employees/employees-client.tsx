"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeInput } from "@/validations";
import { 
  Search, Plus, ArrowUpDown, ChevronLeft, ChevronRight, 
  Edit2, Trash2, Eye, Download, Printer, X, Loader2
} from "lucide-react";
import Link from "next/link";

interface Department {
  id: string;
  departmentName: string;
}

interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string;
  dob: Date;
  departmentId: string;
  department: Department;
  designation: string;
  salary: number;
  joiningDate: Date;
  status: string;
  address: string;
  emergencyContact: string;
  profilePhoto?: string | null;
}

export function EmployeesClient() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters State
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 8;

  // Sorting State
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Zod forms setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      status: "Active",
      gender: "Male"
    }
  });

  // Fetch employees
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        departmentId: selectedDept,
        status: selectedStatus,
        minSalary,
        maxSalary,
        sortBy,
        sortOrder
      });

      const res = await fetch(`/api/employees?${query}`);
      if (res.ok) {
        const data = await res.json();
        setEmployees(data.employees);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments for form selection & filter
  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.departments);
      }
    } catch (err) {
      console.error("Failed to fetch departments:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedDept, selectedStatus, sortBy, sortOrder]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedDept("");
    setSelectedStatus("");
    setMinSalary("");
    setMaxSalary("");
    setPage(1);
    // Directly fetch after clearing state triggers
    setTimeout(fetchEmployees, 50);
  };

  const handleSort = (field: string) => {
    const isAsc = sortBy === field && sortOrder === "asc";
    setSortBy(field);
    setSortOrder(isAsc ? "desc" : "asc");
    setPage(1);
  };

  // Create Employee
  const onAddSubmit = async (data: EmployeeInput) => {
    setFormError(null);
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || "Failed to create employee");
        return;
      }
      setIsAddOpen(false);
      reset();
      fetchEmployees();
    } catch {
      setFormError("Server error. Please try again.");
    }
  };

  // Update Employee
  const onEditSubmit = async (data: EmployeeInput) => {
    if (!editingEmployee) return;
    setFormError(null);
    try {
      const res = await fetch(`/api/employees/${editingEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || "Failed to update employee");
        return;
      }
      setEditingEmployee(null);
      reset();
      fetchEmployees();
    } catch {
      setFormError("Server error. Please try again.");
    }
  };

  // Delete Employee
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This will remove all their records.`)) {
      try {
        const res = await fetch(`/api/employees/${id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          fetchEmployees();
        } else {
          const data = await res.json();
          alert(data.error || "Failed to delete employee");
        }
      } catch {
        alert("Server error deleting employee.");
      }
    }
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    // Populate form fields
    setValue("fullName", emp.fullName);
    setValue("email", emp.email);
    setValue("phone", emp.phone);
    setValue("gender", emp.gender as "Male" | "Female" | "Other");
    setValue("dob", new Date(emp.dob));
    setValue("departmentId", emp.departmentId);
    setValue("designation", emp.designation);
    setValue("salary", emp.salary);
    setValue("joiningDate", new Date(emp.joiningDate));
    setValue("status", emp.status as "Active" | "On Leave" | "Suspended" | "Resigned");
    setValue("address", emp.address);
    setValue("emergencyContact", emp.emergencyContact);
    setValue("profilePhoto", emp.profilePhoto || undefined);
  };

  // Export to CSV
  const exportCSV = () => {
    if (employees.length === 0) return;
    
    // Define headers
    const headers = ["Employee ID", "Full Name", "Email", "Phone", "Department", "Designation", "Salary", "Status", "Joining Date"];
    
    // Map rows
    const rows = employees.map(emp => [
      emp.employeeId,
      emp.fullName,
      emp.email,
      emp.phone,
      emp.department.departmentName,
      emp.designation,
      emp.salary,
      emp.status,
      new Date(emp.joiningDate).toLocaleDateString()
    ]);
    
    // Construct CSV String
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employee_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simple Print Action (utilizes native print styled specifically for tabular report layouts)
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Upper Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Employee Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Manage corporate workforce profiles, payroll settings, and job status.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={triggerPrint}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Printer size={14} /> Print Report
          </button>
          <button
            onClick={() => { reset(); setIsAddOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 transition-colors cursor-pointer"
          >
            <Plus size={14} /> Add Employee
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm print:hidden">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search by name, email, or employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs outline-none text-slate-700 dark:text-slate-300"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2.5 text-xs outline-none text-slate-700 dark:text-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-2.5 text-xs rounded-xl transition-colors cursor-pointer"
              >
                Apply Filters
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl transition-colors cursor-pointer"
                title="Clear Filters"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden print:border-none print:shadow-none">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-xs text-slate-400">Loading directory records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-xs font-semibold">
                  <th className="py-4 px-6">Profile</th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors" onClick={() => handleSort("employeeId")}>
                    <div className="flex items-center gap-1.5">
                      Emp ID <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-700 dark:hover:text-white" onClick={() => handleSort("fullName")}>
                    <div className="flex items-center gap-1.5">
                      Name <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-700 dark:hover:text-white" onClick={() => handleSort("salary")}>
                    <div className="flex items-center gap-1.5">
                      Salary <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 cursor-pointer hover:text-slate-700 dark:hover:text-white" onClick={() => handleSort("joiningDate")}>
                    <div className="flex items-center gap-1.5">
                      Joined <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors text-slate-700 dark:text-slate-300">
                    <td className="py-4 px-6">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                        {emp.profilePhoto ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={emp.profilePhoto} alt={emp.fullName} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          emp.fullName.split(" ").map(n => n[0]).join("")
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono font-medium text-slate-500 dark:text-slate-400">
                      <Link href={`/employees/${emp.id}`} className="hover:underline hover:text-indigo-600 dark:hover:text-indigo-400">
                        {emp.employeeId}
                      </Link>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-100">{emp.fullName}</td>
                    <td className="py-4 px-6">{emp.department.departmentName}</td>
                    <td className="py-4 px-6">{emp.designation}</td>
                    <td className="py-4 px-6 font-semibold">${emp.salary.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-semibold ${
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
                    </td>
                    <td className="py-4 px-6">{new Date(emp.joiningDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-right space-x-2 print:hidden whitespace-nowrap">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="inline-flex p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </Link>
                      <button
                        onClick={() => openEditModal(emp)}
                        className="inline-flex p-1.5 text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-200 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id, emp.fullName)}
                        className="inline-flex p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Delete Employee"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {employees.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400 text-xs">
                      No employee profiles found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {!loading && totalPages > 1 && (
          <div className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between print:hidden">
            <span className="text-slate-400 text-[10px]">
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, totalCount)} of {totalCount} profiles
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add & Edit Modal Overlays */}
      {(isAddOpen || editingEmployee !== null) && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {editingEmployee ? `Edit Profile: ${editingEmployee.fullName}` : "Add New Employee"}
              </h2>
              <button
                onClick={() => { setIsAddOpen(false); setEditingEmployee(null); }}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(editingEmployee ? onEditSubmit : onAddSubmit)} className="p-6 space-y-6">
              {formError && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Full Name</label>
                  <input
                    type="text"
                    {...register("fullName")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                    placeholder="Alice Smith"
                  />
                  {errors.fullName && <p className="text-red-400 text-[9px] mt-1">{errors.fullName.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Email Address</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                    placeholder="alice@ems.com"
                  />
                  {errors.email && <p className="text-red-400 text-[9px] mt-1">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Phone Number</label>
                  <input
                    type="text"
                    {...register("phone")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                    placeholder="+1 555-0199"
                  />
                  {errors.phone && <p className="text-red-400 text-[9px] mt-1">{errors.phone.message}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Gender</label>
                  <select
                    {...register("gender")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs outline-none text-slate-700 dark:text-slate-300 focus:border-indigo-500/50"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="text-red-400 text-[9px] mt-1">{errors.gender.message}</p>}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Date of Birth</label>
                  <input
                    type="date"
                    {...register("dob")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  />
                  {errors.dob && <p className="text-red-400 text-[9px] mt-1">{errors.dob.message}</p>}
                </div>

                {/* Joining Date */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Joining Date</label>
                  <input
                    type="date"
                    {...register("joiningDate")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  />
                  {errors.joiningDate && <p className="text-red-400 text-[9px] mt-1">{errors.joiningDate.message}</p>}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Department</label>
                  <select
                    {...register("departmentId")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs outline-none text-slate-700 dark:text-slate-300 focus:border-indigo-500/50"
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.departmentName}
                      </option>
                    ))}
                  </select>
                  {errors.departmentId && <p className="text-red-400 text-[9px] mt-1">{errors.departmentId.message}</p>}
                </div>

                {/* Designation */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Designation</label>
                  <input
                    type="text"
                    {...register("designation")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                    placeholder="Software Engineer"
                  />
                  {errors.designation && <p className="text-red-400 text-[9px] mt-1">{errors.designation.message}</p>}
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Annual Salary ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...register("salary")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                    placeholder="75000"
                  />
                  {errors.salary && <p className="text-red-400 text-[9px] mt-1">{errors.salary.message}</p>}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Status</label>
                  <select
                    {...register("status")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3 py-2 text-xs outline-none text-slate-700 dark:text-slate-300 focus:border-indigo-500/50"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                  {errors.status && <p className="text-red-400 text-[9px] mt-1">{errors.status.message}</p>}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Home Address</label>
                <textarea
                  rows={2}
                  {...register("address")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100 resize-none"
                  placeholder="Street Name, Apt 4B, City, Country"
                />
                {errors.address && <p className="text-red-400 text-[9px] mt-1">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Emergency Contact */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Emergency Contact Info</label>
                  <input
                    type="text"
                    {...register("emergencyContact")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                    placeholder="John Smith (+1 555-0100)"
                  />
                  {errors.emergencyContact && <p className="text-red-400 text-[9px] mt-1">{errors.emergencyContact.message}</p>}
                </div>

                {/* Profile Photo */}
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Profile Photo URL (Optional)</label>
                  <input
                    type="text"
                    {...register("profilePhoto")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                    placeholder="https://example.com/photo.jpg"
                  />
                  {errors.profilePhoto && <p className="text-red-400 text-[9px] mt-1">{errors.profilePhoto.message}</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); setEditingEmployee(null); }}
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
                      Saving changes...
                    </>
                  ) : (
                    "Save Profile"
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
