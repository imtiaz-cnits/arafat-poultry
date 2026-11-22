"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Search,
  Truck,
  Building2,
  Phone,
  CheckCircle,
  X,
  Loader2,
  DollarSign,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { CustomSelect, Pagination, TableSkeleton , PageSkeleton } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

interface Supplier {
  id: number;
  supplier_id: string;
  name: string;
  company: string;
  mobile: string;
  address: string;
  purchase_payable_amount: number;
}

export default function SupplierDuesPage() {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Pay Modal
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [paymentData, setPaymentData] = useState({
    paid_amount: "",
    discount_amount: "0",
    payment_method: "Cash",
    transaction_id: "",
  });
  const [saving, setSaving] = useState(false);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      if (data.status === "success") {
        const withDues = data.data.filter((s: Supplier) => s.purchase_payable_amount > 0);
        setSuppliers(withDues);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleOpenPay = (s: Supplier) => {
    setSelectedSupplier(s);
    setPaymentData({
      paid_amount: String(s.purchase_payable_amount),
      discount_amount: "0",
      payment_method: "Cash",
      transaction_id: "",
    });
    setIsPayModalOpen(true);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || !paymentData.paid_amount) return;

    try {
      setSaving(true);
      const res = await fetch("/api/suppliers/due-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: selectedSupplier.id,
          paid_amount: paymentData.paid_amount,
          discount_amount: paymentData.discount_amount,
          payment_method: paymentData.payment_method,
          transaction_id: paymentData.transaction_id,
        }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.status === "success") {
        setIsPayModalOpen(false);
        setSelectedSupplier(null);
        setCurrentPage(1);
        loadSuppliers();
      } else {
        toast.error(data?.message || "পরিশোধ ব্যর্থ হয়েছে");
      }
    } catch (err: any) {
      toast.error(err?.message || "সার্ভার যোগাযোগ ত্রুটি");
    } finally {
      setSaving(false);
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.company.toLowerCase().includes(search.toLowerCase()) ||
      s.mobile.includes(search)
  );

  const startIndex = (currentPage - 1) * pageSize;
  const displayedSuppliers = filteredSuppliers.slice(startIndex, startIndex + pageSize);

  const totalDueAmount = suppliers.reduce((sum, s) => sum + s.purchase_payable_amount, 0);

  if (loading && suppliers.length === 0) {

    return <PageSkeleton />;

  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white m-0 leading-tight">
              সরবরাহকারী প্রদেয় বকেয়া রেজিস্টার
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              সরবরাহকারীদের প্রদেয় বকেয়া এবং বিল পরিশোধের হিসাব
            </p>
          </div>
        </div>

        <div className="h-[42px] px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2.5">
          <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">
            মোট প্রদেয় বকেয়া:
          </span>
          <span className="text-sm font-black text-rose-800 dark:text-rose-300">
            {formatBdCurrency(totalDueAmount)}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-[#cbd5e1] dark:border-[#334155]">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="সাপ্লায়ার বা মোবাইল দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-[38px] pl-9 pr-3 rounded-xl bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs font-bold text-slate-500">
          {filteredSuppliers.length} Supplier(s) with Due
        </span>
      </div>

      {/* Desktop Table (Strict Marss Corp Rule) */}
      <div className="hidden md:block bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-bold whitespace-nowrap">
                <th className="text-center w-[50px] p-[10px]">SL</th>
                <th className="p-[10px]">Supplier / ID</th>
                <th className="p-[10px]">কোম্পানি</th>
                <th className="p-[10px]">মোবাইল</th>
                <th className="p-[10px]">ঠিকানা</th>
                <th className="text-right p-[10px]">বকেয়া দেনা</th>
                <th className="text-center w-28 p-[10px]">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 p-[10px]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
                    <span>Loading due records...</span>
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-slate-400 font-bold p-[10px]">
                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <span>All supplier dues are currently cleared!</span>
                  </td>
                </tr>
              ) : (
                displayedSuppliers.map((s, idx) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="text-center font-bold text-slate-500 p-[10px]">
                      {startIndex + idx + 1}
                    </td>
                    <td className="p-[10px]">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                        <Link
                          href={`/suppliers/${s.id}`}
                          className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          {s.name}
                        </Link>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        <Link
                          href={`/suppliers/${s.id}`}
                          className="text-rose-600 dark:text-rose-400 font-mono font-bold hover:underline cursor-pointer"
                        >
                          {s.supplier_id}
                        </Link>
                      </div>
                    </td>
                    <td className="font-semibold text-slate-700 dark:text-slate-200 p-[10px]">
                      {s.company}
                    </td>
                    <td className="font-bold text-slate-800 dark:text-slate-200 p-[10px]">
                      {s.mobile}
                    </td>
                    <td className="text-slate-600 dark:text-slate-300 p-[10px]">
                      {s.address || "N/A"}
                    </td>
                    <td className="text-right p-[10px]">
                      <span className="font-black text-rose-600 dark:text-rose-400 text-xs">
                        {formatBdCurrency(s.purchase_payable_amount)}
                      </span>
                    </td>
                    <td className="text-center p-[10px]">
                      <button
                        type="button"
                        onClick={() => handleOpenPay(s)}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs mx-auto"
                      >
                        <Wallet className="w-3.5 h-3.5" />
                        <span className="whitespace-nowrap">বকেয়া পরিশোধ</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredSuppliers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          pageSizeOptions={[20, 50, 100, 200, 500]}
        />
      </div>

      {/* Mobile Card / Box List (Strict Rule: block md:hidden) */}
      <div className="block md:hidden space-y-2.5">
        {loading ? (
          <div className="py-10 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
            <span>Loading due records...</span>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="p-6 text-center text-slate-400 font-bold bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155]">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <span>All supplier dues are currently cleared!</span>
          </div>
        ) : (
          displayedSuppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    <Link
                      href={`/suppliers/${s.id}`}
                      className="hover:text-rose-600 transition-colors"
                    >
                      {s.name}
                    </Link>
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-600">{s.company}</p>
                </div>
                <Link
                  href={`/suppliers/${s.id}`}
                  className="text-[10px] font-mono text-rose-600 font-bold hover:underline"
                >
                  {s.supplier_id}
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-[#1e293b] p-2 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">মোবাইল:</span>
                  <span className="font-bold">{s.mobile}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">প্রদেয় বকেয়া:</span>
                  <span className="font-black text-rose-600 dark:text-rose-400">
                    {formatBdCurrency(s.purchase_payable_amount)}
                  </span>
                </div>
                {s.address && (
                  <div className="col-span-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">ঠিকানা:</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate block">
                      {s.address}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenPay(s)}
                  className="h-[32px] w-full text-center px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>বকেয়া পরিশোধ</span>
                </button>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredSuppliers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[20, 50, 100, 200, 500]}
          />
        </div>
      </div>

      {/* Pay Modal */}
      {isPayModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] max-h-[90vh] flex flex-col">
            <div className="modal-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  সরবরাহকারীর বকেয়া পরিশোধ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="w-[28px] h-[28px] rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-5 space-y-3.5 flex-1 min-h-0 overflow-y-auto">
              <div className="bg-slate-50 dark:bg-[#1e293b] p-3 rounded-xl border border-[#cbd5e1] dark:border-[#334155] space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">সরবরাহকারী:</span>
                  <strong className="font-bold text-slate-800 dark:text-white">
                    {selectedSupplier.name} ({selectedSupplier.company})
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">বর্তমান প্রদেয় বকেয়া:</span>
                  <strong className="font-bold text-rose-600">
                    {formatBdCurrency(selectedSupplier.purchase_payable_amount)}
                  </strong>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  পরিশোধের পরিমাণ (৳) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={paymentData.paid_amount}
                  onChange={(e) => setPaymentData({ ...paymentData, paid_amount: e.target.value })}
                  className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-black text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  ছাড় / সমন্বয় (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={paymentData.discount_amount}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, discount_amount: e.target.value })
                  }
                  className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  পেমেন্ট পদ্ধতি
                </label>
                <CustomSelect
                  value={paymentData.payment_method}
                  onChange={(val) =>
                    setPaymentData({ ...paymentData, payment_method: val })
                  }
                  options={[
                    { value: "Cash", label: "নগদ (Cash)" },
                    { value: "Bank", label: "ব্যাংক (Bank Transfer)" },
                    { value: "bKash", label: "বিকাশ (bKash)" },
                    { value: "Nagad", label: "নগদ (Nagad)" },
                    { value: "Rocket", label: "রকেট (Rocket)" },
                    { value: "Card", label: "কার্ড (Card)" },
                  ]}
                  placeholder="পেমেন্ট পদ্ধতি নির্বাচন করুন"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  ট্রানজেকশন / চেক নং (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: CHQ-984214"
                  value={paymentData.transaction_id}
                  onChange={(e) =>
                    setPaymentData({ ...paymentData, transaction_id: e.target.value })
                  }
                  className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              </div>

              {/* Sticky Flush Footer */}
              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  disabled={saving}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>পরিশোধ সম্পন্ন করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
