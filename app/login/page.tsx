"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== "success") {
        setError(data.message || "Invalid credentials. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Store token in localStorage for client-side API requests that use Bearer header
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.role);
      }

      setTimeout(() => {
        window.location.replace("/dashboard");
      }, 400);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail("admin@gmail.com");
    setPassword("admin123");
    setError("");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-[#0b0f19] p-4 sm:p-6 transition-colors">
      <div className="w-full max-w-5xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
        {/* Left Side: Brand Showcase */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#166534] via-[#15803d] to-[#047857] text-white relative overflow-hidden">
          {/* Subtle decorative circles */}
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
              <span>Modern Farm ERP &amp; Smart POS</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
                Quality Products.
                <br />
                Trusted Service.
              </h2>
              <p className="text-sm text-emerald-100/90 leading-relaxed max-w-md">
                Streamlining poultry sheds, egg collections, aquaculture lakes, feed inventory, and customer ledgers in one seamless platform.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <ShieldCheck className="w-5 h-5 text-emerald-200 shrink-0" />
                <span className="text-xs font-semibold">Role-Based Access</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10">
                <ShoppingBag className="w-5 h-5 text-emerald-200 shrink-0" />
                <span className="text-xs font-semibold">Full-Screen POS</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer Credit */}
          <div className="relative z-10 pt-6 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100/80">
            <span>Enterprise Farm Edition</span>
            <span>Software By: CodeNext IT</span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center">
          {/* Mobile Logo View */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
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

          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
              Enter your credentials to access the POS &amp; Admin Dashboard
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Login successful! Redirecting to dashboard...
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Email / Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full h-[42px] pl-10 pr-3.5 rounded-xl bg-white dark:bg-slate-800/90 text-sm text-slate-800 dark:text-white border-[1.5px] border-[#cbd5e1] dark:border-[#334155] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[42px] pl-10 pr-10 rounded-xl bg-white dark:bg-slate-800/90 text-sm text-slate-800 dark:text-white border-[1.5px] border-[#cbd5e1] dark:border-[#334155] focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[42px] rounded-xl bg-gradient-to-r from-[#166534] to-[#15803d] hover:from-[#14532d] hover:to-[#166534] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials helper */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                  Quick Demo Access
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  admin@gmail.com / admin123
                </p>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#166534] to-[#15803d] hover:from-[#14532d] hover:to-[#166534] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Auto Fill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
