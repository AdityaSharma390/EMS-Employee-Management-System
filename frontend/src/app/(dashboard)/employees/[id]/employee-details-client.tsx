"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeInput } from "@/validations";
import { clientFetch } from "@/lib/api-client";
import { 
  ArrowLeft, Edit2, Trash2, Printer, X, Mail, Phone, MapPin, 
  ShieldAlert, Loader2
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

interface EmployeeDetailsClientProps {
  initialEmployee: Employee;
  departments: Department[];
}

export function EmployeeDetailsClient({ initialEmployee, departments }: EmployeeDetailsClientProps) {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee>(initialEmployee);
  const [isEditing, setIsEditing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: employee.fullName,
      email: employee.email,
      phone: employee.phone,
      gender: employee.gender as "Male" | "Female" | "Other",
      dob: new Date(employee.dob),
      departmentId: employee.departmentId,
      designation: employee.designation,
      salary: employee.salary,
      joiningDate: new Date(employee.joiningDate),
      status: employee.status as "Active" | "On Leave" | "Suspended" | "Resigned",
      address: employee.address,
      emergencyContact: employee.emergencyContact,
      profilePhoto: employee.profilePhoto || undefined
    }
  });

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the profile of ${employee.fullName}? This will permanently remove all historical logs.`)) {
      try {
        const res = await clientFetch(`/api/employees/${employee.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          router.push("/employees");
          router.refresh();
        } else {
          const data = await res.json();
          alert(data.error || "Failed to delete employee");
        }
      } catch {
        alert("Server error deleting profile.");
      }
    }
  };

  const onEditSubmit = async (data: EmployeeInput) => {
    setFormError(null);
    try {
      const res = await clientFetch(`/api/employees/${employee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setFormError(result.error || "Failed to update profile");
        return;
      }
      setEmployee(result.employee);
      setIsEditing(false);
      router.refresh();
    } catch {
      setFormError("Server error. Please try again.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #print-profile-card, #print-profile-card * {
            visibility: visible;
          }
          #print-profile-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: white !important;
            color: black !important;
          }
        }
      `}</style>

      {/* Navigation and Top Toolbar */}
      <div className="flex justify-between items-center print:hidden">
        <Link 
          href="/employees"
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Directory
        </Link>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <Printer size={14} /> Print Profile
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/10 transition-colors cursor-pointer"
          >
            <Edit2 size={14} /> Edit Profile
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl transition-colors cursor-pointer"
          >
            <Trash2 size={14} /> Delete Profile
          </button>
        </div>
      </div>

      {/* Detail Profile Layout Grid */}
      <div id="print-profile-card" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* Banner strip */}
        <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
          <span className="absolute bottom-4 right-6 font-mono font-semibold text-sm text-white/50">
            {employee.employeeId}
          </span>
        </div>

        {/* Profile Card Header Info */}
        <div className="px-8 pb-8 relative">
          {/* Avatar placement overlapping the banner */}
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-3xl absolute -top-12 shadow-sm">
            {employee.profilePhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={employee.profilePhoto} alt={employee.fullName} className="w-full h-full rounded-full object-cover" />
            ) : (
              employee.fullName.split(" ").map(n => n[0]).join("")
            )}
          </div>

          <div className="pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{employee.fullName}</h1>
              <p className="text-xs text-slate-500 font-semibold mt-1">{employee.designation} • {employee.department.departmentName}</p>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-semibold ${
                employee.status === "Active"
                  ? "bg-green-50 text-green-700 dark:bg-green-900/10 dark:text-green-400"
                  : employee.status === "On Leave"
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-900/10 dark:text-amber-400"
                  : employee.status === "Suspended"
                  ? "bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}>
                Employment Status: {employee.status}
              </span>
            </div>
          </div>

          {/* Details Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-100 dark:border-slate-800 mt-8 pt-8 text-xs">
            {/* Contact details */}
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">Contact Details</h3>
              <div className="space-y-4 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Email Address</p>
                    <p className="font-medium mt-0.5">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Phone Number</p>
                    <p className="font-medium mt-0.5">{employee.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Home Address</p>
                    <p className="font-medium mt-0.5 leading-relaxed">{employee.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldAlert size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-medium">Emergency Contact</p>
                    <p className="font-medium mt-0.5">{employee.emergencyContact}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employment and Personal Details */}
            <div className="space-y-6">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[10px]">Employment & Personal Data</h3>
              <div className="grid grid-cols-2 gap-6 text-slate-600 dark:text-slate-300">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Employee ID</p>
                  <p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-200">{employee.employeeId}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Annual Salary</p>
                  <p className="font-semibold mt-0.5 text-slate-800 dark:text-slate-200 text-sm">
                    ${employee.salary.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Department</p>
                  <p className="font-medium mt-0.5">{employee.department.departmentName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Designation</p>
                  <p className="font-medium mt-0.5">{employee.designation}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Date of Joining</p>
                  <p className="font-medium mt-0.5">{new Date(employee.joiningDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Gender</p>
                  <p className="font-medium mt-0.5">{employee.gender}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Date of Birth</p>
                  <p className="font-medium mt-0.5">{new Date(employee.dob).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Overlay Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto print:hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
              <h2 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                Edit Profile: {employee.fullName}
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onEditSubmit)} className="p-6 space-y-6">
              {formError && (
                <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Full Name</label>
                  <input
                    type="text"
                    {...register("fullName")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  />
                  {errors.fullName && <p className="text-red-400 text-[9px] mt-1">{errors.fullName.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Email Address</label>
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  />
                  {errors.email && <p className="text-red-400 text-[9px] mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Phone Number</label>
                  <input
                    type="text"
                    {...register("phone")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  />
                  {errors.phone && <p className="text-red-400 text-[9px] mt-1">{errors.phone.message}</p>}
                </div>

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

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Date of Birth</label>
                  <input
                    type="date"
                    {...register("dob")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  />
                  {errors.dob && <p className="text-red-400 text-[9px] mt-1">{errors.dob.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Joining Date</label>
                  <input
                    type="date"
                    {...register("joiningDate")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  />
                  {errors.joiningDate && <p className="text-red-400 text-[9px] mt-1">{errors.joiningDate.message}</p>}
                </div>

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

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Designation</label>
                  <input
                    type="text"
                    {...register("designation")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  />
                  {errors.designation && <p className="text-red-400 text-[9px] mt-1">{errors.designation.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Annual Salary ($)</label>
                  <input
                    type="number"
                    step="any"
                    {...register("salary")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  />
                  {errors.salary && <p className="text-red-400 text-[9px] mt-1">{errors.salary.message}</p>}
                </div>

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

              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Home Address</label>
                <textarea
                  rows={2}
                  {...register("address")}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100 resize-none"
                />
                {errors.address && <p className="text-red-400 text-[9px] mt-1">{errors.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Emergency Contact Info</label>
                  <input
                    type="text"
                    {...register("emergencyContact")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  />
                  {errors.emergencyContact && <p className="text-red-400 text-[9px] mt-1">{errors.emergencyContact.message}</p>}
                </div>

                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-[10px] font-semibold mb-1.5 uppercase">Profile Photo URL (Optional)</label>
                  <input
                    type="text"
                    {...register("profilePhoto")}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-indigo-500/50 text-slate-800 dark:text-slate-100"
                  />
                  {errors.profilePhoto && <p className="text-red-400 text-[9px] mt-1">{errors.profilePhoto.message}</p>}
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
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
                    "Save Changes"
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
