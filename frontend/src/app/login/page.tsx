"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/validations";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, Briefcase } from "lucide-react";
import { clientFetch } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    try {
      const res = await clientFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Authentication failed");
        return;
      }

      setSuccess(true);
      
      // Store token in a client-side cookie on the vercel.app domain
      document.cookie = `token=${result.token}; path=/; max-age=86400; Secure; SameSite=Lax`;

      setTimeout(() => {
        router.refresh();
        router.push("/");
      }, 1000);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.3),rgba(255,255,255,0))] px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-slate-950/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white mb-3 shadow-lg shadow-indigo-600/30">
              <Briefcase size={28} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-sm mt-1">Sign in to manage employees & payroll</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 text-xs font-medium animate-bounce">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-green-950/30 border border-green-500/30 text-green-400 text-xs font-medium">
              Login successful! Redirecting to dashboard...
            </div>
          )}

          {/* Inputs */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="email">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@ems.com"
                  {...register("email")}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/60 rounded-xl pl-11 pr-4 py-3 text-sm outline-none text-white transition-all placeholder:text-slate-600"
                  disabled={isSubmitting || success}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-[10px] mt-1.5 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-2" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/60 rounded-xl pl-11 pr-4 py-3 text-sm outline-none text-white transition-all placeholder:text-slate-600"
                  disabled={isSubmitting || success}
                />
              </div>
              {errors.password && (
                <p className="text-red-400 text-[10px] mt-1.5 font-medium">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || success}
              className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white rounded-xl py-3 text-sm font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Info Banner */}
          <div className="mt-8 text-center border-t border-slate-800/80 pt-6">
            <span className="text-slate-500 text-xs">Demo Credentials</span>
            <div className="flex justify-center gap-4 mt-2 text-[10px] text-slate-400">
              <div>
                <span className="font-semibold text-slate-300">Email:</span> admin@ems.com
              </div>
              <div>
                <span className="font-semibold text-slate-300">Pass:</span> admin123
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
