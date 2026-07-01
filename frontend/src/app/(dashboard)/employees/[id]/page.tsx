import { EmployeeDetailsClient } from "./employee-details-client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { serverFetch } from "@/lib/api";

export const revalidate = 0;

export default async function EmployeeDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let employee = null;
  let departments = [];

  try {
    const [empRes, deptRes] = await Promise.all([
      serverFetch(`/api/employees/${id}`),
      serverFetch("/api/departments"),
    ]);

    if (empRes.ok) {
      const data = await empRes.json();
      employee = data.employee;
    }

    if (deptRes.ok) {
      const data = await deptRes.json();
      departments = data.departments;
    }
  } catch (error) {
    console.error("Failed to load employee details:", error);
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Employee Profile Not Found</h2>
        <p className="text-xs text-slate-400">The profile you are looking for might have been deleted or doesn&apos;t exist.</p>
        <Link
          href="/employees"
          className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          <ArrowLeft size={14} /> Back to Directory
        </Link>
      </div>
    );
  }

  return <EmployeeDetailsClient initialEmployee={employee} departments={departments} />;
}
