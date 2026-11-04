"use client";

import { useState } from "react";
import { Truck, X, Loader2 } from "lucide-react";

export interface SupplierData {
  id: number;
  supplier_id: string;
  name: string;
  company: string;
  mobile: string;
  address?: string;
  purchase_payable_amount?: number;
}

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSupplierCreated: (supplier: SupplierData) => void;
}

export function SupplierModal({
  isOpen,
  onClose,
  onSupplierCreated,
}: SupplierModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    mobile: "",
    address: "",
    email: "",
    purchase_payable_amount: "0",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.company.trim() || !formData.mobile.trim()) {
      setError("সরবরাহকারীর নাম, কোম্পানির নাম ও মোবাইল নম্বর আবশ্যক!");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        onSupplierCreated({
          id: data.data.id,
          supplier_id: data.data.supplier_id,
          name: data.data.name,
          company: data.data.company,
          mobile: data.data.mobile,
          address: data.data.address,
          purchase_payable_amount: data.data.purchase_payable_amount || 0,
        });
        setFormData({
          name: "",
          company: "",
          mobile: "",
          address: "",
          email: "",
          purchase_payable_amount: "0",
        });
        onClose();
      } else {
        setError(data.message || "সরবরাহকারী সংরক্ষণ ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      setError(err?.message || "সার্ভার যোগাযোগে ত্রুটি ঘটেছে");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-white" />
            <h3 className="text-sm font-bold tracking-wide m-0 text-white">
              নতুন সরবরাহকারী যোগ করুন (Add Supplier)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#dc2626] hover:bg-red-700 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-3.5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              সরবরাহকারীর নাম (Supplier Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. মোঃ রফিকুল ইসলাম"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              কোম্পানির নাম / ফার্ম (Company / Farm Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. নারিশ পোল্ট্রি অ্যান্ড হ্যাচারি"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                মোবাইল নম্বর (Mobile Number) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="017XXXXXXXX"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                পূর্বের বকেয়া / পাওনা (Previous Due / Payable ৳)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.purchase_payable_amount}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_payable_amount: e.target.value })
                }
                className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              ঠিকানা (Address / Location)
            </label>
            <input
              type="text"
              placeholder="e.g. গাজীপুর, ঢাকা"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              ইমেইল (Email - ঐচ্ছিক)
            </label>
            <input
              type="email"
              placeholder="supplier@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading}
              className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>সংরক্ষণ করুন (Save)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

