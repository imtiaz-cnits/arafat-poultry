"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Clock,
  Sparkles,
  UserPlus,
  Loader2,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { CustomSelect } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { SYSTEM_ROLE_OPTIONS, type SystemRole } from "@/lib/roles";

interface RegisteredUserSummary {
  id: number;
  name: string;
  email: string | null;
  mobile: string;
  role: string;
  status: string;
}

export default function SignupForm() {
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SystemRole>("staff");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registeredUser, setRegisteredUser] = useState<RegisteredUserSummary | null>(null);

  function resetForm() {
    setName("");
    setMobile("");
    setEmail("");
    setRole("staff");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setRegisteredUser(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedMobile = mobile.trim();
    const trimmedEmail = email.trim();
    const mobileDigits = trimmedMobile.replace(/\D/g, "");

    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setError("Full name must be between 2 and 50 characters.");
      return;
    }

    if (
      !trimmedMobile ||
      trimmedMobile.length > 50 ||
      !/^[0-9+\-\s()]+$/.test(trimmedMobile) ||
      mobileDigits.length < 6 ||
      mobileDigits.length > 15
    ) {
      setError("Please enter a valid mobile number.");
      return;
    }

    if (trimmedEmail && (trimmedEmail.length > 50 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail))) {
      setError("Please enter a valid email address (max 50 characters).");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    if (password.length > 72) {
      setError("Password must not exceed 72 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          mobile: trimmedMobile,
          email: trimmedEmail || null,
          role,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || data?.status !== "success") {
        setError(data?.message || "Registration failed. Please try again.");
        return;
      }

      setRegisteredUser(data.data);
      setPassword("");
      setConfirmPassword("");
      toast.success("Account created! Waiting for administrator approval.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred during registration."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0b0f19] p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left Side: Brand Showcase */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#166534] via-[#15803d] to-[#047857] text-white relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center">
              <Image
                src="/logo2.png"
                alt="Arafat Poultry & Fisheries"
                width={48}
                height={48}
                priority
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-tight">
                ARAFAT POULTRY
              </h1>
              <p className="text-xs text-emerald-100 tracking-wider font-semibold">
                &amp; FISHERIES MANAGEMENT
              </p>
            </div>
          </div>

          {/* Middle Value Proposition */}
          <div className="relative z-10 my-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>User Account Registration</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
                Quality Products.
                <br />
                Trusted Service.
              </h2>
              <p className="text-sm text-emerald-100/90 leading-relaxed max-w-md">
                Register an account with your desired role. For security, every new account remains pending until approved by an administrator.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <ShieldCheck className="w-5 h-5 text-emerald-200 shrink-0" />
                <span className="text-xs font-semibold">Role-Based Presets</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <Clock className="w-5 h-5 text-amber-200 shrink-0" />
                <span className="text-xs font-semibold">Admin Approval Flow</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Credit */}
          <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100/80">
            <span>Enterprise Farm Edition</span>
            <span>Software By: CodeNext IT</span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          {/* Mobile Logo View */}
          <div className="lg:hidden flex items-center gap-3 mb-7">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1.5 shadow-sm flex items-center justify-center">
              <Image
                src="/logo2.png"
                alt="Arafat Poultry & Fisheries"
                width={40}
                height={40}
                priority
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-white leading-tight">
                ARAFAT POULTRY
              </h2>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                &amp; Fisheries Management
              </p>
            </div>
          </div>

          {registeredUser ? (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Registration Submitted
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  Your account has been created and is currently{" "}
                  <span className="font-bold text-[#EA580C]">Pending Approval</span>. You will be able to sign in once an administrator approves your account.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border-[1.5px] border-[#cbd5e1] dark:border-[#334155] space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Full Name</span>
                  <span className="font-bold text-slate-800 dark:text-white">{registeredUser.name}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Mobile</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-white">{registeredUser.mobile}</span>
                </div>
                {registeredUser.email && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Email</span>
                    <span className="font-bold text-slate-800 dark:text-white">{registeredUser.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Requested Role</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold capitalize border border-sky-200 dark:border-sky-800">
                    {registeredUser.role}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">Status</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/50 text-[#EA580C] dark:text-orange-300 font-bold capitalize border border-orange-200 dark:border-orange-800">
                    <Clock className="w-3 h-3" />
                    {registeredUser.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                <Link
                  href="/login"
                  className="flex-1 h-[42px] rounded-xl bg-gradient-to-r from-[#166534] to-[#15803d] hover:from-[#14532d] hover:to-[#166534] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Go to Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={resetForm}
                  className="h-[42px] px-4 rounded-xl border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Register Another</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Create Account
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  Register a new user account. Admin approval is required before signing in.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="signup-name"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider"
                    >
                      Full Name <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="signup-name"
                        type="text"
                        required
                        maxLength={50}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Md. Rafiqul Islam"
                        className="w-full h-[42px] pl-10 pr-3.5 rounded-xl bg-white dark:bg-slate-800/90 text-sm text-slate-800 dark:text-white border-[1.5px] border-[#cbd5e1] dark:border-[#334155] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-mobile"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider"
                    >
                      Mobile Number <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        id="signup-mobile"
                        type="tel"
                        required
                        maxLength={50}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full h-[42px] pl-10 pr-3.5 rounded-xl bg-white dark:bg-slate-800/90 text-sm font-mono text-slate-800 dark:text-white border-[1.5px] border-[#cbd5e1] dark:border-[#334155] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="signup-email"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider"
                    >
                      Email <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="signup-email"
                        type="email"
                        maxLength={50}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@arafatpoultry.com"
                        className="w-full h-[42px] pl-10 pr-3.5 rounded-xl bg-white dark:bg-slate-800/90 text-sm text-slate-800 dark:text-white border-[1.5px] border-[#cbd5e1] dark:border-[#334155] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Account Role <span className="text-rose-600">*</span>
                    </label>
                    <CustomSelect
                      options={SYSTEM_ROLE_OPTIONS}
                      value={role}
                      onChange={(val) => setRole(val as SystemRole)}
                      matchTriggerWidth
                      triggerClassName="h-[42px] px-3.5 rounded-xl bg-white dark:bg-slate-800/90"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider"
                    >
                      Password <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={4}
                        maxLength={72}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 4 characters"
                        className="w-full h-[42px] pl-10 pr-10 rounded-xl bg-white dark:bg-slate-800/90 text-sm text-slate-800 dark:text-white border-[1.5px] border-[#cbd5e1] dark:border-[#334155] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-confirm-password"
                      className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider"
                    >
                      Confirm Password <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={4}
                        maxLength={72}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat password"
                        className="w-full h-[42px] pl-10 pr-10 rounded-xl bg-white dark:bg-slate-800/90 text-sm text-slate-800 dark:text-white border-[1.5px] border-[#cbd5e1] dark:border-[#334155] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-[#EA580C]" />
                  <span>
                    New accounts remain <strong>Pending</strong> until an administrator activates them from User Management.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[42px] rounded-xl bg-gradient-to-r from-[#166534] to-[#15803d] hover:from-[#14532d] hover:to-[#166534] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Account</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Already have an approved account?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-[#166534] dark:text-emerald-400 hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
