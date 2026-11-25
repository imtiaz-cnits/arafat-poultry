"use client";
import { PageSkeleton } from "@/components/ui/table-skeleton";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { numberToBanglaWords } from "@/lib/utils";
import { formatBdCurrency } from "@/lib/utils";

interface InvoiceDetail {
  id: number;
  product_name: string;
  tile_size?: string | null;
  sqft_per_box?: string | null;
  pcs_per_box?: string | null;
  grade?: string | null;
  category?: string | null;
  unit?: string | null;
  quantity: number;
  selling_price: number;
  line_total: number;
}

interface InvoiceData {
  id: number;
  order_no: string;
  invoice_date: string | null;
  created_at: string;
  sub_total: number;
  delivery_charge: number;
  discount_amount: number;
  return_adjustment_amount: number;
  net_payable: number;
  paid_amount: number;
  due_amount: number;
  previous_due_amount: number;
  order_note?: string | null;
  cashier: string;
  customer?: {
    id: number;
    customer_id?: string;
    customer_name: string;
    mobile: string;
    address_details?: string | null;
  } | null;
  challan?: {
    id: number;
    challan_no: string;
    challan_date: string;
    status: string;
  } | null;
  details: InvoiceDetail[];
}

export default function InvoiceBillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInvoice() {
      try {
        setLoading(true);
        const res = await fetch(`/api/invoices/${id}`);
        const data = await res.json();
        if (res.ok && data.status === "success") {
          setInvoice(data.data);
        } else {
          setError(data.message || "Failed to load invoice bill");
        }
      } catch (err: any) {
        setError(err?.message || "Communication error loading invoice");
      } finally {
        setLoading(false);
      }
    }
    loadInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Convert number to Bangladeshi Taka words
  const numberToWords = (num: number): string => {
    const a = [
      "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ",
      "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ",
      "Seventeen ", "Eighteen ", "Nineteen "
    ];
    const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    const inWords = (n: number): string => {
      let str = "";
      if (n > 9999999) {
        str += inWords(Math.floor(n / 10000000)) + "Crore ";
        n %= 10000000;
      }
      if (n > 99999) {
        str += inWords(Math.floor(n / 100000)) + "Lakh ";
        n %= 100000;
      }
      if (n > 999) {
        str += inWords(Math.floor(n / 1000)) + "Thousand ";
        n %= 1000;
      }
      if (n > 99) {
        str += inWords(Math.floor(n / 100)) + "Hundred ";
        n %= 100;
      }
      if (n > 19) {
        str += b[Math.floor(n / 10)] + " " + a[n % 10];
      } else {
        str += a[n];
      }
      return str;
    };

    const whole = Math.floor(Math.abs(num));
    if (whole === 0) return "Zero";
    return inWords(whole).trim();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-rose-600 mb-2" />
        <p className="text-sm font-semibold">Loading invoice bill details...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-xl mx-auto my-12 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 text-center">
        <h2 className="text-lg font-bold text-rose-600 mb-2">Invoice Not Found</h2>
        <p className="text-xs text-slate-500 mb-4">{error || "Unable to display this invoice bill."}</p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const totalBill = invoice.sub_total;
  const netAmount = invoice.net_payable;
  const paidAmount = invoice.paid_amount;
  const todayDue = invoice.due_amount;
  const prevDue = invoice.previous_due_amount || 0;
  const grandTotalDue = todayDue + prevDue;

  if (loading && !invoice) {

    return <PageSkeleton />;

  }

  return (
    <div className="font-sans">
      {/* 1. TOP ACTION BAR (Hidden when printing) */}
      <div className="no-print mb-4 flex items-center justify-between gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[#475569] hover:bg-[#334155] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-sm transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ইনভয়েস তালিকায় ফিরুন</span>
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>বিল প্রিন্ট করুন</span>
        </button>
      </div>

      {/* 2. INVOICE SHEET PAPER (Full width) */}
      <div
        id="invoicePrintSheet"
        className="invoice-paper bg-white text-black p-4 sm:p-8 border border-slate-300 w-full min-h-[297mm] shadow-md relative flex flex-col justify-between overflow-hidden"
        style={{
          fontFamily: "'Valley Sans', Arial, sans-serif",
          boxSizing: "border-box",
        }}
      >
        <div className="sheet-top-content">
          {/* Header: Responsive on Mobile, Horizontal on Desktop & Print */}
          <div className="flex flex-col sm:flex-row print:flex-row justify-between items-center sm:items-start print:items-start gap-3 sm:gap-2 print:gap-0 pb-2 border-b border-slate-200">
            {/* Brand Logo (Enlarged, Official) */}
            <div className="flex items-center">
              <Image
                src="/logo1.png"
                alt="Arafat Poultry & Fisheries"
                width={200}
                height={65}
                className="h-14 sm:h-16 print:h-16 w-auto object-contain"
                priority
              />
            </div>

            {/* Middle "Bill" Badge */}
            <div className="self-center">
              <span className="px-4 sm:px-5 py-0.5 sm:py-1 print:py-1 rounded bg-[#166534] text-white font-bold text-xs sm:text-sm print:text-sm tracking-wider uppercase shadow-xs">
                বিক্রয় মেমো
              </span>
            </div>

            {/* Office Info */}
            <div className="text-center sm:text-right print:text-right text-[11px] text-slate-800 leading-tight max-w-[240px]">
              <div><strong>প্রতিষ্ঠান:</strong> আরাফাত পোল্ট্রি অ্যান্ড ফিশারিজ</div>
              <div>গুণগত মানসম্মত পণ্য ও বিশ্বস্ত সেবা</div>
              <div><strong>মোবাইল:</strong> 01975-703216, 01715-842083</div>
              <div><strong>ইমেইল:</strong> info@arafatpoultry.com</div>
            </div>
          </div>

          {/* Form Metadata Rows (Two-Column Dotted Grid matching MARSS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-2 gap-x-6 gap-y-1.5 sm:gap-y-1 print:gap-y-1 my-3 text-[12px] text-black">
            <div className="flex items-end">
              <span className="font-semibold whitespace-nowrap mr-1">বিল নং:</span>
              <span className="flex-1 border-b border-dotted border-black font-bold font-mono pl-1">
                #{invoice.order_no}
              </span>
            </div>

            <div className="flex items-end">
              <span className="font-semibold whitespace-nowrap mr-1">বিলের তারিখ:</span>
              <span className="flex-1 border-b border-dotted border-black font-semibold pl-1">
                {formatDate(invoice.invoice_date || invoice.created_at)}
              </span>
            </div>

            

            <div className="flex items-end">
              <span className="font-semibold whitespace-nowrap mr-1">ডেলিভারির তারিখ:</span>
              <span className="flex-1 border-b border-dotted border-black font-semibold pl-1">
                {formatDate(invoice.challan?.challan_date || invoice.invoice_date || invoice.created_at)}
              </span>
            </div>

            <div className="flex items-end">
              <span className="font-semibold whitespace-nowrap mr-1">কাস্টমারের নাম:</span>
              <span className="flex-1 border-b border-dotted border-black font-bold pl-1 truncate">
                {invoice.customer?.customer_name || "General Customer"}
              </span>
            </div>

            <div className="flex items-end">
              <span className="font-semibold whitespace-nowrap mr-1">মোবাইল:</span>
              <span className="flex-1 border-b border-dotted border-black font-bold font-mono pl-1">
                {invoice.customer?.mobile || "N/A"}
              </span>
            </div>

            <div className="col-span-1 sm:col-span-2 print:col-span-2 flex items-end">
              <span className="font-semibold whitespace-nowrap mr-1">ঠিকানা:</span>
              <span className="flex-1 border-b border-dotted border-black pl-1 truncate">
                {invoice.customer?.address_details || "N/A"}
              </span>
            </div>
          </div>

          {/* Items Table (Bordered 1px solid black matching screenshot 5) */}
          <div className="mt-2 mb-4 overflow-x-auto">
            <table className="w-full text-left border-collapse border border-black text-[12px] min-w-[500px] sm:min-w-0 print:min-w-0">
              <thead>
                <tr className="bg-slate-50 text-black font-bold text-center border-b border-black">
                  <th className="border border-black py-1 px-2 w-[50px]">ক্র: নং</th>
                  <th className="border border-black py-1 px-3 text-left">পণ্যের বিবরণ</th>
                  <th className="border border-black py-1 px-2 w-[110px] text-right">দর (৳)</th>
                  <th className="border border-black py-1 px-2 w-[70px] text-center">পরিমাণ</th>
                  <th className="border border-black py-1 px-3 w-[120px] text-right">মোট টাকা</th>
                </tr>
              </thead>
              <tbody>
                {invoice.details.map((item, idx) => (
                  <tr key={item.id || idx} className="border-b border-black">
                    <td className="border border-black py-1 px-2 text-center font-medium">
                      {idx + 1}
                    </td>
                    <td className="border border-black py-1 px-3 font-semibold">
                      {item.product_name}
                      {item.unit && (
                        <span className="text-[10px] text-slate-600 block">
                          একক: {item.unit}
                        </span>
                      )}
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono">
                      {item.selling_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="border border-black py-1 px-2 text-center font-bold whitespace-nowrap">
                      {item.quantity} {item.unit || "একক"}
                    </td>
                    <td className="border border-black py-1 px-3 text-right font-mono font-bold">
                      {item.line_total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Table directly beneath items table */}
          <div className="flex justify-end mt-1 mb-2">
            <div className="w-full sm:w-[42%] print:w-[42%]">
              <table className="w-full border-collapse border border-black text-[12px]">
                <tbody>
                  <tr className="border-b border-black">
                    <td className="border border-black py-1 px-2 font-bold bg-slate-50 w-1/2">
                      মোট বিল:
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold w-1/2">
                      {totalBill.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black py-1 px-2 font-bold bg-slate-50">
                      নীট প্রদেয়:
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {netAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black py-1 px-2 font-bold bg-slate-50">
                      পরিশোধিত টাকা:
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold text-emerald-800">
                      {paidAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black py-1 px-2 font-bold bg-slate-50">
                      আজকের বকেয়া:
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold text-rose-700">
                      {todayDue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr className="border-b border-black">
                    <td className="border border-black py-1 px-2 font-bold bg-slate-50">
                      পূর্বের বকেয়া:
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-bold">
                      {prevDue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-black py-1 px-2 font-black bg-slate-100">
                      সর্বমোট বকেয়া:
                    </td>
                    <td className="border border-black py-1 px-2 text-right font-mono font-black text-rose-800 text-[13px]">
                      {grandTotalDue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM SUMMARY SECTION */}
        <div className="sheet-bottom-content mt-auto pt-4 print:mt-auto break-inside-avoid">
          {/* In Words */}
          <div className="w-full text-[12px] mb-4">
            <div className="flex items-end">
              <span className="font-semibold whitespace-nowrap mr-1">কথায়:</span>
              <span className="flex-1 border-b border-dotted border-black font-bold pl-1 italic">
                {numberToBanglaWords(netAmount)} টাকা মাত্র
              </span>
            </div>
            {invoice.order_note && (
              <div className="mt-2 text-[11px] text-slate-700">
                <strong>বিশেষ নোট:</strong> {invoice.order_note}
              </div>
            )}
          </div>

          {/* Signatures (Strict Rule: 3 signature areas) */}
          <div className="flex justify-between items-end pt-8 pb-3 text-[11px] font-semibold text-black gap-4">
            <div className="w-32 sm:w-36 print:w-36 text-center border-t border-dotted border-black pt-1">
              প্রস্তুতকারীর স্বাক্ষর
            </div>
            <div className="w-32 sm:w-36 print:w-36 text-center border-t border-dotted border-black pt-1">
              গ্রাহকের স্বাক্ষর
            </div>
            <div className="w-32 sm:w-36 print:w-36 text-center border-t border-dotted border-black pt-1">
              অনুমোদনকারীর স্বাক্ষর
            </div>
          </div>

          {/* Bottom Dual Color Accent Bar */}
          <div className="flex h-2.5 w-[calc(100%+2rem)] sm:w-[calc(100%+4rem)] -mx-4 sm:-mx-8 -mb-4 sm:-mb-8 mt-3">
            <div className="w-1/2 bg-[#dc2626]"></div>
            <div className="w-1/2 bg-[#15803d]"></div>
          </div>

          {/* Copyright Footer */}
          <div className="text-center text-[9px] text-slate-500 pt-1 -mb-2 sm:-mb-6 print:mb-0">
            © 2026 ARAFAT POULTRY &amp; FISHERIES | Software By: CodeNext IT
          </div>
        </div>
      </div>

      {/* PRINT-SPECIFIC CSS */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          header,
          aside,
          nav,
          .no-print,
          footer,
          .dashboard-header,
          [data-sidebar] {
            display: none !important;
          }
          #invoicePrintSheet {
            border: none !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 0 16px 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: calc(297mm - 26mm) !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          #invoicePrintSheet table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          #invoicePrintSheet thead {
            display: table-header-group !important;
          }
          #invoicePrintSheet tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 10px 10px 16px 10px !important;
          }
        }
      `}</style>
    </div>
  );
}
