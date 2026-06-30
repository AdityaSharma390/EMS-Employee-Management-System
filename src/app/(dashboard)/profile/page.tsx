import { db } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { Mail, Shield, Calendar } from "lucide-react";

import { User } from "@prisma/client";

export const revalidate = 0;

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let userDetails: User | null = null;

  if (token) {
    const payload = verifyToken(token);
    if (payload) {
      userDetails = await db.user.findUnique({
        where: { id: payload.userId },
      });
    }
  }

  if (!userDetails) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <p className="text-slate-450 text-xs">Failed to load profile. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-850 dark:text-slate-100 font-sans">Admin Profile</h1>
        <p className="text-xs text-slate-400 mt-1">Review your administrator credentials and security role.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-750 dark:text-indigo-300 font-bold text-xl">
            {userDetails.name.split(" ").map((n: string) => n[0]).join("")}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{userDetails.name}</h2>
            <span className="text-[9px] uppercase font-bold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20 px-2.5 py-0.5 rounded-md inline-block mt-1">
              Role: {userDetails.role}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 mt-6 pt-6 space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <Mail className="text-slate-400 shrink-0" size={16} />
            <div>
              <p className="text-[10px] text-slate-450 font-semibold">Email Address</p>
              <p className="font-semibold text-slate-850 dark:text-slate-200 mt-0.5">{userDetails.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="text-slate-400 shrink-0" size={16} />
            <div>
              <p className="text-[10px] text-slate-450 font-semibold">Role Access Level</p>
              <p className="font-semibold text-slate-850 dark:text-slate-200 mt-0.5">Full System Administrator (CRUD)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="text-slate-400 shrink-0" size={16} />
            <div>
              <p className="text-[10px] text-slate-450 font-semibold">Account Created On</p>
              <p className="font-semibold text-slate-850 dark:text-slate-200 mt-0.5">
                {new Date(userDetails.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
