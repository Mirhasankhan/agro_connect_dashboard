"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck, ArrowRight, Sprout, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import logoImg from "@/assets/logo.png";
import loginpageBg from "@/assets/loginpage.avif";
import { useAdminLoginMutation } from "@/redux/features/auth/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/features/auth/authSlice";

const adminLoginSchema = z.object({
  email: z.string().email("Please enter a valid admin email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect");
  const dispatch = useAppDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [adminLogin, { isLoading }] = useAdminLoginMutation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: AdminLoginFormValues) => {
    try {
      const response = await adminLogin(values).unwrap();
      const { accessToken, role, user: userData } = (response.data as any) || {};

      if (role && role !== "ADMIN") {
        setError("root", {
          message: "Access restricted: Only system administrators can access this portal.",
        });
        toast.error("Access denied. Admin credentials required.");
        return;
      }

      dispatch(
        setUser({
          user: userData,
          token: accessToken,
          role: role || "ADMIN",
        }),
      );

      toast.success(response.message || "Welcome back to AgroConnect Admin Panel!");
      
      const destination = redirectPath && redirectPath.startsWith("/") ? redirectPath : "/";
      router.push(destination);
    } catch (err: any) {
      const errorMessage =
        err?.data?.message ||
        err?.message ||
        "Invalid admin credentials. Please verify your email and password.";

      setError("root", { message: errorMessage });
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* 50% LEFT: Visual Showcase with loginpage.avif */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 xl:p-14 overflow-hidden bg-[#041d0f]">
        {/* Background image from assets folder */}
        <div className="absolute inset-0 z-0">
          <Image
            src={loginpageBg}
            alt="AgroConnect Agricultural Harvest"
            fill
            priority
            className="object-cover object-center scale-105 transition-transform duration-1000 ease-out hover:scale-100"
          />
          {/* Emerald Gradient Overlay for contrast and visual excellence */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#021308]/95 via-[#041d0f]/75 to-[#021308]/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.35)_0%,transparent_60%)]" />
        </div>

        {/* Top Branding Pill */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase">
              AgroConnect Admin HQ
            </span>
          </div>
          <span className="text-xs font-medium text-emerald-200/80 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/20">
            v1.0 • Secure Portal
          </span>
        </div>

        {/* Center / Bottom Content */}
        <div className="relative z-10 space-y-6 max-w-xl my-auto pt-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Verified Administrative Gateway
          </div>

          <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-bold text-white tracking-tight leading-tight">
            Connecting Harvests to Modern Markets with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Total Transparency
            </span>
          </h1>

          <p className="text-emerald-100/80 text-sm xl:text-base leading-relaxed">
            Centralized operations hub for managing agricultural producers, verified transport drivers,
            order dispatches, quality standards, and market categories across Ivory Coast.
          </p>

          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-4">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white">
              <div className="text-2xl font-bold text-emerald-300">100%</div>
              <div className="text-xs text-emerald-100/70 font-medium mt-0.5">Direct Farm Origin</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white">
              <div className="text-2xl font-bold text-emerald-300">Real-Time</div>
              <div className="text-xs text-emerald-100/70 font-medium mt-0.5">Driver Dispatch</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white">
              <div className="text-2xl font-bold text-emerald-300">Tier-1</div>
              <div className="text-xs text-emerald-100/70 font-medium mt-0.5">Producer Verification</div>
            </div>
          </div>
        </div>

        {/* Bottom Trust Footer */}
        <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/70">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>Sustainable Agri-Food Infrastructure</span>
          </div>
          <span>Côte d&apos;Ivoire</span>
        </div>
      </div>

      {/* 50% RIGHT: Admin Login Form */}
      <div className="flex flex-col justify-center items-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Header & Logo */}
          <div className="text-center sm:text-left space-y-4">
            <div className="inline-block">
              <Image
                src={logoImg}
                alt="AgroConnect Logo"
                width={170}
                height={50}
                priority
                className="h-10 w-auto object-contain mx-auto sm:mx-0"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Administrative Access Only
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Sign in to Dashboard
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enter your administrative credentials to manage operations and users.
              </p>
            </div>
          </div>

          {/* Root Form Error */}
          {errors.root && (
            <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
              <span className="font-semibold text-rose-800">Error:</span>
              <span>{errors.root.message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="admin@agroconnect.ci"
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                      : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600/20"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-rose-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  {...register("password")}
                  className={`w-full pl-10 pr-11 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                      : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600/20"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-rose-600">{errors.password.message}</p>
              )}
            </div>

            {/* Security Indicator */}
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 flex items-center gap-2.5 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Session protected with JWT authorization and role verification.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} AgroConnect Côte d&apos;Ivoire. Authorized personnel only.
          </div>
        </div>
      </div>
    </div>
  );
}
