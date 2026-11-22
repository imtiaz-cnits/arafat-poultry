"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Phone,
  MapPin,
  Mail,
  Wallet,
  Edit2,
  Trash2,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { formatBdCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import { Pagination, DeleteConfirmModal, CustomSelect, TableSkeleton, CardSkeleton , PageSkeleton } from "@/components/ui";

interface Customer {
  id: number;
  customer_id: string;
  customer_name: string;
  mobile: string;
  address_details?: string | null;
  email?: string | null;
  nid?: string | null;
  previous_due_amount: number;
}

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    mobile: "",
    address_details: "",
    email: "",
    nid: "",
    previous_due_amount: "0",
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Due Collection Modal
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [collectCustomer, setCollectCustomer] = useState<Customer | null>(null);
  const [collectionData, setCollectionData] = useState({
    paid_amount: "",
    discount_amount: "0",
    payment_method: "Cash",
    transaction_id: "",
    due_collection_date: "",
    note: "",
  });
  const [collecting, setCollecting] = useState(false);
  const [collectError, setCollectError] = useState<string | null>(null);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/customers?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.status === "success") {
        setCustomers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const handleOpenEdit = (c: Customer) => {
    setSelectedCustomer(c);
    setFormData({
      customer_name: c.customer_name,
      mobile: c.mobile,
      address_details: c.address_details || "",
      email: c.email || "",
      nid: c.nid || "",
      previous_due_amount: String(c.previous_due_amount),
    });
    setIsModalOpen(true);
  };

  const handleOpenCollect = (c: Customer) => {
    setCollectCustomer(c);
    setCollectionData({
      paid_amount: c.previous_due_amount > 0 ? String(c.previous_due_amount) : "",
      discount_amount: "0",
      payment_method: "Cash",
      transaction_id: "",
      due_collection_date: new Date().toISOString().split("T")[0],
      note: `Due collection from ${c.customer_name}`,
    });
    setCollectError(null);
    setIsCollectModalOpen(true);
  };

  const handleSubmitCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectCustomer) return;

    const paidNum = parseFloat(collectionData.paid_amount || "0");
    if (!paidNum || paidNum <= 0) {
      setCollectError("অনুগ্রহ করে আদায়কৃত টাকার সঠিক পরিমাণ লিখুন!");
      return;
    }

    try {
      setCollecting(true);
      setCollectError(null);

      const res = await fetch("/api/customers/due-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: collectCustomer.id,
          paid_amount: collectionData.paid_amount,
          discount_amount: collectionData.discount_amount || "0",
          payment_method: collectionData.payment_method,
          transaction_id: collectionData.transaction_id,
          due_collection_date: collectionData.due_collection_date,
          note: collectionData.note,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        setIsCollectModalOpen(false);
        setCollectCustomer(null);
        toast.success("কাস্টমার বকেয়া সফলভাবে আদায় করা হয়েছে!");
        loadCustomers();
      } else {
        setCollectError(data.message || "Failed to collect due");
      }
    } catch (err: any) {
      setCollectError(err?.message || "Communication error");
    } finally {
      setCollecting(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_name.trim() || !formData.mobile.trim()) {
      setErrorMsg("Customer name and mobile are required!");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      const url = selectedCustomer
        ? `/api/customers/${selectedCustomer.id}`
        : "/api/customers";
      const method = selectedCustomer ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.status === "success") {
        setIsModalOpen(false);
        setSelectedCustomer(null);
        setFormData({
          customer_name: "",
          mobile: "",
          address_details: "",
          email: "",
          nid: "",
          previous_due_amount: "0",
        });
        toast.success(
          selectedCustomer
            ? "Customer updated successfully!"
            : "Customer created successfully!"
        );
        setCurrentPage(1);
        loadCustomers();
      } else {
        setErrorMsg(data.message || "Failed to save customer");
      }

    } catch (err: any) {
      setErrorMsg(err?.message || "Communication error");
    } finally {
      setSaving(false);
    }
  };

  async function confirmDeleteCustomer() {
    if (!customerToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/customers/${customerToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status === "success") {
        toast.success("Customer deleted successfully!");
        setCustomerToDelete(null);
        setCurrentPage(1);
        loadCustomers();
      } else {
        toast.error(data.message || "Failed to delete customer");
        throw new Error(data.message || "Failed to delete customer");
      }
    } finally {
      setDeleting(false);
    }
  }

  const startIndex = (currentPage - 1) * pageSize;
  const displayedCustomers = customers.slice(startIndex, startIndex + pageSize);
  const totalCustomerDue = customers.reduce((sum, c) => sum + c.previous_due_amount, 0);

  if (loading && customers.length === 0) {

    return <PageSkeleton />;

  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-4 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-slate-800 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white m-0 leading-tight">
              কাস্টমার ব্যবস্থাপনা (Customer Management)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 m-0">
              Manage retail customers, contact directories, and ledger balances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-[38px] px-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 flex items-center gap-2">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase">
              মোট বকেয়া পাওনা:
            </span>
            <span className="text-xs font-black text-rose-800 dark:text-rose-300">
              {formatBdCurrency(totalCustomerDue)}
            </span>
          </div>

          <button
            onClick={() => {
              setSelectedCustomer(null);
              setFormData({
                customer_name: "",
                mobile: "",
                address_details: "",
                email: "",
                nid: "",
                previous_due_amount: "0",
              });
              setIsModalOpen(true);
            }}
            className="h-[38px] px-3.5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন কাস্টমার<span className="hidden sm:inline"> (Add Customer)</span></span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-[#cbd5e1] dark:border-[#334155]">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="কাস্টমারের নাম, মোবাইল বা আইডি দিয়ে খুঁজুন..."
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
          মোট: {customers.length} জন কাস্টমার
        </span>
      </div>

      {/* Desktop Table (Strict Marss Corp Rule) */}
      <div className="hidden md:block bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="table-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] text-white font-bold whitespace-nowrap">
                <th className="text-center w-[50px] p-[10px]">ক্র: নং</th>
                <th className="p-[10px]">কাস্টমার ও আইডি</th>
                <th className="p-[10px]">মোবাইল নম্বর</th>
                <th className="p-[10px]">ঠিকানা</th>
                <th className="text-right p-[10px]">মোট বকেয়া</th>
                <th className="text-center w-36 p-[10px]">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr><td colSpan={6} className="p-0"><TableSkeleton rows={6} columns={6} /></td></tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-slate-400 font-bold p-[10px]">
                    কোনো কাস্টমার পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                displayedCustomers.map((c, idx) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="text-center font-bold text-slate-500 p-[10px]">
                      {startIndex + idx + 1}
                    </td>
                    <td className="p-[10px]">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                        <Link
                          href={`/customers/${c.id}`}
                          className="hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          {c.customer_name}
                        </Link>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        <Link
                          href={`/customers/${c.id}`}
                          className="text-rose-600 hover:underline font-mono font-bold cursor-pointer"
                        >
                          {c.customer_id}
                        </Link>
                      </div>
                    </td>
                    <td className="font-bold text-slate-800 dark:text-slate-200 p-[10px]">
                      {c.mobile}
                    </td>
                    <td className="text-slate-600 dark:text-slate-300 p-[10px]">
                      {c.address_details || "N/A"}
                    </td>
                    <td className="text-right p-[10px]">
                      <span
                        className={`font-black text-xs ${
                          c.previous_due_amount > 0 ? "text-rose-600" : "text-emerald-600"
                        }`}
                      >
                        {formatBdCurrency(c.previous_due_amount)}
                      </span>
                    </td>
                    <td className="text-center p-[10px]">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenCollect(c)}
                          className={`h-7 px-2.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs ${
                            c.previous_due_amount > 0
                              ? "bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white"
                              : "border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-emerald-700"
                          }`}
                          title="বকেয়া আদায় (Collect Due)"
                        >
                          <Wallet className="w-3.5 h-3.5" />
                          <span className="whitespace-nowrap">বকেয়া</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="w-7 h-7 rounded-lg border-[1.5px] border-[#cbd5e1] dark:border-[#334155] bg-white dark:bg-slate-800 text-purple-600 hover:bg-purple-50 flex items-center justify-center transition-colors cursor-pointer"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls Desktop */}
        <Pagination
          currentPage={currentPage}
          totalItems={customers.length}
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
          <CardSkeleton count={4} />
        ) : customers.length === 0 ? (
          <div className="p-6 text-center text-slate-400 font-bold bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155]">
            No customers found. Click "+ Add Customer" to create one.
          </div>
        ) : (
          displayedCustomers.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-[#0f172a] p-3.5 rounded-2xl border border-[#cbd5e1] dark:border-[#334155] shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    <Link
                      href={`/customers/${c.id}`}
                      className="hover:text-rose-600 transition-colors"
                    >
                      {c.customer_name}
                    </Link>
                  </h3>
                  <p className="text-[11px] text-slate-500">{c.mobile}</p>
                </div>
                <Link
                  href={`/customers/${c.id}`}
                  className="text-[10px] font-mono text-rose-600 font-bold hover:underline"
                >
                  {c.customer_id}
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-[#1e293b] p-2 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Phone:</span>
                  <span className="font-bold">{c.mobile}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Outstanding Due:</span>
                  <span
                    className={`font-black ${
                      c.previous_due_amount > 0 ? "text-rose-600" : "text-emerald-600"
                    }`}
                  >
                    {formatBdCurrency(c.previous_due_amount)}
                  </span>
                </div>
                {c.address_details && (
                  <div className="col-span-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Address:</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate block">
                      {c.address_details}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-1 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenCollect(c)}
                  className={`h-[32px] w-full text-center px-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                    c.previous_due_amount > 0
                      ? "bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white"
                      : "border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>বকেয়া আদায়</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(c)}
                  className="h-[32px] w-full text-center px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>সম্পাদনা</span>
                </button>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-[#cbd5e1] dark:border-[#334155] overflow-hidden">
          <Pagination
            currentPage={currentPage}
            totalItems={customers.length}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] max-h-[90vh] flex flex-col">
            <div className="modal-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  {selectedCustomer ? "কাস্টমার সম্পাদনা (Edit Customer)" : "নতুন কাস্টমার যোগ (Add New Customer)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-[28px] h-[28px] rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-5 space-y-3.5 flex-1 min-h-0 overflow-y-auto">
              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    কাস্টমারের নাম <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    মোবাইল নম্বর <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    পূর্বের বকেয়া (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={formData.previous_due_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, previous_due_amount: e.target.value })
                    }
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ঠিকানা / এলাকা
                  </label>
                  <input
                    type="text"
                    value={formData.address_details}
                    onChange={(e) => setFormData({ ...formData, address_details: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ইমেইল (ঐচ্ছিক)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    জাতীয় পরিচয়পত্র / এনআইডি (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={formData.nid}
                    onChange={(e) => setFormData({ ...formData, nid: e.target.value })}
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>
              </div>

              </div>

              {/* Sticky Flush Footer */}
              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>কাস্টমার সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* Due Collection Modal */}
      {isCollectModalOpen && collectCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-[16px] shadow-2xl overflow-hidden border border-[#cbd5e1] dark:border-[#334155] max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="modal-header-brand bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-white" />
                <h3 className="text-sm font-bold tracking-wide uppercase m-0 text-white">
                  কাস্টমার বকেয়া আদায়
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCollectModalOpen(false)}
                className="w-[28px] h-[28px] rounded-full bg-[#dc2626] hover:bg-red-700 text-white flex items-center justify-center cursor-pointer transition-colors shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCollection} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="p-5 space-y-3.5 flex-1 min-h-0 overflow-y-auto">
                {collectError && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                    {collectError}
                  </div>
                )}

                {/* Customer Info Card */}
                <div className="bg-slate-50 dark:bg-[#1e293b] p-3.5 rounded-xl border border-[#cbd5e1] dark:border-[#334155] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">কাস্টমার:</span>
                    <strong className="font-bold text-slate-800 dark:text-white">
                      {collectCustomer.customer_name} ({collectCustomer.customer_id})
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">মোবাইল:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {collectCustomer.mobile}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">বর্তমান বকেয়া:</span>
                    <strong className="font-black text-rose-600 dark:text-rose-400 text-sm">
                      {formatBdCurrency(collectCustomer.previous_due_amount)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">অবশিষ্ট বকেয়া:</span>
                    <strong className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatBdCurrency(
                        Math.max(
                          0,
                          collectCustomer.previous_due_amount -
                            ((parseFloat(collectionData.paid_amount) || 0) +
                              (parseFloat(collectionData.discount_amount) || 0))
                        )
                      )}
                    </strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    আদায়কৃত টাকা (৳) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="any"
                    value={collectionData.paid_amount}
                    onChange={(e) =>
                      setCollectionData({ ...collectionData, paid_amount: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-black text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ছাড় / সমন্বয় (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={collectionData.discount_amount}
                    onChange={(e) =>
                      setCollectionData({ ...collectionData, discount_amount: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    আদায়ের তারিখ
                  </label>
                  <input
                    type="date"
                    value={collectionData.due_collection_date}
                    onChange={(e) =>
                      setCollectionData({ ...collectionData, due_collection_date: e.target.value })
                    }
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    পেমেন্ট পদ্ধতি
                  </label>
                  <CustomSelect
                    value={collectionData.payment_method}
                    onChange={(val) =>
                      setCollectionData({ ...collectionData, payment_method: val })
                    }
                    options={[
                      { value: "Cash", label: "Cash (নগদ)" },
                      { value: "bKash", label: "bKash (বিকাশ)" },
                      { value: "Nagad", label: "Nagad (নগদ)" },
                      { value: "Rocket", label: "Rocket (রকেট)" },
                      { value: "Bank", label: "Bank Transfer (ব্যাংক)" },
                      { value: "Card", label: "Card (কার্ড)" },
                    ]}
                    placeholder="পরিশোধ মাধ্যম নির্বাচন করুন"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    ট্রানজেকশন আইডি / রেফারেন্স
                  </label>
                  <input
                    type="text"
                    placeholder="ঐচ্ছিক রেফারেন্স / ট্রানজেকশন নম্বর"
                    value={collectionData.transaction_id}
                    onChange={(e) =>
                      setCollectionData({ ...collectionData, transaction_id: e.target.value })
                    }
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    নোট / মন্তব্য
                  </label>
                  <input
                    type="text"
                    placeholder="ঐচ্ছিক মন্তব্য"
                    value={collectionData.note}
                    onChange={(e) =>
                      setCollectionData({ ...collectionData, note: e.target.value })
                    }
                    className="w-full h-[42px] px-3 text-xs bg-slate-50 dark:bg-[#1e293b] border border-[#cbd5e1] dark:border-[#334155] rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Sticky Flush Footer */}
              <div className="shrink-0 bg-slate-50 dark:bg-[#1e293b] px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5 z-10">
                <button
                  type="button"
                  onClick={() => setIsCollectModalOpen(false)}
                  disabled={collecting}
                  className="h-[38px] px-4 rounded-xl bg-[#dc2626] hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={collecting}
                  className="h-[38px] px-5 rounded-xl bg-gradient-to-r from-[#14532d] via-[#166534] to-[#15803d] hover:from-[#0f3d21] hover:to-[#14532d] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  {collecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>বকেয়া সংগ্রহ নিশ্চিত করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(customerToDelete)}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={confirmDeleteCustomer}
        title="Confirm Customer Deletion"
        recordIdentifier={
          customerToDelete
            ? `Customer: ${customerToDelete.customer_name} (${customerToDelete.mobile})`
            : null
        }
        warningMessage="Are you sure you want to delete this customer? This action cannot be undone."
        isLoading={deleting}
      />
    </div>
  );
}
