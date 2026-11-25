"use client";

import { formatBdCurrency } from "@/lib/utils";
import Image from "next/image";
import { Printer, X, Truck, Phone, MapPin, Calendar, FileText } from "lucide-react";

interface ReceiptProps {
  receiptData: {
    id?: number;
    order_no: string;
    has_tiles?: boolean;
    challan_status?: string;
    invoice_date: string;
    customer: {
      customer_name: string;
      mobile: string;
      address_details?: string;
    };
    cashier?: string;
    sub_total: number;
    discount_amount: number;
    delivery_charge: number;
    return_adjustment_amount: number;
    paid_amount: number;
    due_amount: number;
    previous_due_amount: number;
    payment_method: string;
    transaction_id?: string | null;
    order_note?: string | null;
    details: Array<{
      product_name: string;
      quantity: number;
      price: number;
      total: number;
      tile_size?: string | null;
      sqft_per_box?: number | null;
      pcs_per_box?: number | null;
      grade?: string | null;
      category?: string | null;
      unit?: string | null;
    }>;
  };
  onClose: () => void;
  onOpenChallan?: (orderId: number) => void;
}

export function ThermalReceiptModal({ receiptData, onClose, onOpenChallan }: ReceiptProps) {
  function handlePrint() {
    window.print();
  }

  const grandTotal =
    receiptData.sub_total +
    receiptData.delivery_charge -
    (receiptData.discount_amount + receiptData.return_adjustment_amount);

  const totalDueWithPrevious = receiptData.due_amount + receiptData.previous_due_amount;

  // Strict check: Only show Challan action if invoice contains Tiles items
  const hasTiles =
    receiptData.has_tiles === true
      ? true
      : receiptData.has_tiles === false
      ? false
      : Boolean(
          (receiptData.challan_status && receiptData.challan_status !== "NOT_REQUIRED") ||
          receiptData.details?.some(
            (d) =>
              Boolean(d.tile_size) ||
              Boolean(d.sqft_per_box) ||
              (d.product_name && d.product_name.toLowerCase().includes("tile")) ||
              (d.category && d.category.toLowerCase().includes("tile"))
          )
        );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      {/* Modal Container: Wider modal (max-w-2xl) per user instruction */}
      <div className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col border border-slate-300 print:border-none print:shadow-none print:max-w-none print:m-0 print:p-0">
        {/* Modal Controls Header - Hidden on print */}
        <div className="print:hidden bg-gradient-to-r from-[#166534] to-[#15803d] px-5 py-3.5 flex items-center justify-between text-white shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold m-0 leading-tight">ক্যাশ বিক্রয় রসিদ</h3>
              <p className="text-[11px] text-emerald-100/80 leading-none mt-0.5">
                ইনভয়েস নং: {receiptData.order_no}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-red-700 hover:bg-red-800 text-white flex items-center justify-center cursor-pointer transition-colors shadow-2xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Cash Receipt Container (Full Width A4 with 10px margin on print) */}
        <div id="printable-invoice" className="flex-1 overflow-y-auto p-4 sm:p-5 pb-4 font-sans text-xs text-slate-800 thermal-sheet print:p-0 print-sheet-container flex flex-col justify-between">
          {/* Store Branding Header */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <div className="flex justify-center mb-2">
              <Image
                src="/logo1.png"
                alt="Arafat Poultry & Fisheries"
                width={220}
                height={75}
                className="h-16 w-auto object-contain"
                priority
              />
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              গুণগত মানসম্মত পণ্য ও বিশ্বস্ত সেবা
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              পোল্ট্রি ফিড, ডিম ও মাছ চাষ | পাইকারি ও খুচরা বিক্রেতা
            </p>
            <div className="mt-2.5 inline-block px-3.5 py-0.5 rounded-md bg-[#166534] text-white font-bold text-[11px] tracking-wider uppercase">
              ক্যাশ বিক্রয় রসিদ
            </div>
          </div>

          {/* Invoice & Customer Meta Grid */}
          <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-200 text-xs">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                কাস্টমার তথ্য
              </div>
              <p className="font-bold text-sm text-slate-900">{receiptData.customer.customer_name}</p>
              {receiptData.customer.mobile && (
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{receiptData.customer.mobile}</span>
                </div>
              )}
              {receiptData.customer.address_details && (
                <div className="flex items-start gap-1.5 text-slate-600">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                  <span>{receiptData.customer.address_details}</span>
                </div>
              )}
            </div>

            <div className="space-y-1 text-right sm:text-left sm:pl-6 sm:border-l border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                ইনভয়েস বিবরণ
              </div>
              <div className="flex sm:justify-between justify-end gap-2">
                <span className="text-slate-500">ইনভয়েস নং:</span>
                <strong className="font-mono font-bold text-rose-900">{receiptData.order_no}</strong>
              </div>
              <div className="flex sm:justify-between justify-end gap-2">
                <span className="text-slate-500">তারিখ:</span>
                <span className="font-medium">{receiptData.invoice_date}</span>
              </div>
              <div className="flex sm:justify-between justify-end gap-2">
                <span className="text-slate-500">পরিশোধ পদ্ধতি:</span>
                <span className="font-bold uppercase text-slate-800">{receiptData.payment_method}</span>
              </div>
              {receiptData.cashier && (
                <div className="flex sm:justify-between justify-end gap-2 text-slate-500 text-[11px]">
                  <span>ক্যাশিয়ার:</span>
                  <span>{receiptData.cashier}</span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-3">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">পণ্যের বিবরণ</th>
                    <th className="py-2.5 px-3 text-center">ক্যাটাগরি / একক</th>
                    <th className="py-2.5 px-3 text-center w-16">পরিমাণ</th>
                    <th className="py-2.5 px-3 text-right w-24">দর (৳)</th>
                    <th className="py-2.5 px-3 text-right w-28">মোট (৳)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {receiptData.details.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 text-center text-slate-500 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {item.product_name}
                      </td>
                      <td className="py-2 px-3 text-center text-slate-600 text-[11px]">
                        {item.category || item.unit || "একক"}
                      </td>
                      <td className="py-2 px-3 text-center font-bold font-mono whitespace-nowrap">
                        {item.quantity} {item.unit || ""}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {item.price.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-right font-bold font-mono text-slate-900">
                        {item.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Notes / Terms */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[11px]">
              <span className="font-bold text-slate-700">শর্তাবলী:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                <li>যেকোনো প্রশ্ন বা তথ্যের জন্য এই রসিদ সংরক্ষণ করুন।</li>
                <li>ডেলিভারির সময় ডিম বা মাছের পরিমাণ ও গুণমান যাচাই করে গ্রহণ করুন।</li>
                {receiptData.order_note && (
                  <li className="font-semibold text-slate-900">Note: {receiptData.order_note}</li>
                )}
                {receiptData.transaction_id && (
                  <li className="font-mono text-slate-900">Trx ID: {receiptData.transaction_id}</li>
                )}
              </ul>
            </div>

            {/* Calculations Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>মোট বিল:</span>
                <span className="font-mono font-bold text-slate-900">{formatBdCurrency(receiptData.sub_total)}</span>
              </div>
              {receiptData.delivery_charge > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>ডেলিভারি চার্জ:</span>
                  <span className="font-mono">+{formatBdCurrency(receiptData.delivery_charge)}</span>
                </div>
              )}
              {receiptData.discount_amount > 0 && (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>ছাড়:</span>
                  <span className="font-mono">-{formatBdCurrency(receiptData.discount_amount)}</span>
                </div>
              )}
              {receiptData.return_adjustment_amount > 0 && (
                <div className="flex justify-between text-amber-800 font-bold">
                  <span>পণ্য বিনিময় ও সমন্বয়:</span>
                  <span className="font-mono">-{formatBdCurrency(receiptData.return_adjustment_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-1.5 border-t border-slate-300 text-rose-950">
                <span>নীট প্রদেয়:</span>
                <span className="font-mono text-rose-900">{formatBdCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-800 font-bold">
                <span>পরিশোধিত:</span>
                <span className="font-mono">{formatBdCurrency(receiptData.paid_amount)}</span>
              </div>
              <div className="flex justify-between text-rose-800 font-bold">
                <span>বর্তমান বকেয়া:</span>
                <span className="font-mono">{formatBdCurrency(receiptData.due_amount)}</span>
              </div>
              {receiptData.previous_due_amount > 0 && (
                <div className="flex justify-between text-slate-500 pt-0.5 border-t border-dashed border-slate-200 text-[11px]">
                  <span>পূর্বের বকেয়া:</span>
                  <span className="font-mono font-medium">{formatBdCurrency(receiptData.previous_due_amount)}</span>
                </div>
              )}
              {totalDueWithPrevious > 0 && (
                <div className="flex justify-between text-xs font-black text-rose-900 pt-1 border-t-2 border-rose-300">
                  <span>সর্বমোট বকেয়া:</span>
                  <span className="font-mono">{formatBdCurrency(totalDueWithPrevious)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Signature Protocols */}
          <div className="pt-6 grid grid-cols-3 gap-4 text-center text-[10px] font-semibold text-slate-700 uppercase tracking-wider print-signatures-bottom mt-auto">
            <div>
              <div className="border-t border-slate-400 pt-1.5 w-full mx-auto font-bold text-slate-800">
                বিক্রয় সহকারী / ক্যাশিয়ার
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 w-full mx-auto font-bold text-slate-800">
                ক্রেতার স্বাক্ষর
              </div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 w-full mx-auto font-bold text-slate-800">
                অনুমোদনকারীর স্বাক্ষর
              </div>
            </div>
          </div>

          {/* Footer Branding & Copyright (Single Copyright Line) */}
          <div className="text-center pt-3 text-[10px] text-slate-500 border-t border-slate-200 mt-2">
            <div className="text-[9px] text-slate-500 font-medium">
              © {new Date().getFullYear()} ARAFAT POULTRY &amp; FISHERIES | Software By: CodeNext IT
            </div>
          </div>
        </div>
      </div>

      {/* Media Print Style - Full Width A4 with 16px bottom gap */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10px 10px 16px 10px !important;
          }
          footer {
            display: none !important;
            visibility: hidden !important;
          }
          /* If challan is being printed, hide invoice completely */
          body:has(#printable-challan) .thermal-sheet,
          body:has(#printable-challan) #printable-invoice {
            display: none !important;
            visibility: hidden !important;
          }
          body * {
            visibility: hidden;
          }
          .thermal-sheet,
          .thermal-sheet * {
            visibility: visible;
          }
          .thermal-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10px 10px 16px 10px !important;
            background: white !important;
            color: black !important;
            box-sizing: border-box !important;
            min-height: calc(297mm - 26mm) !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .print-signatures-bottom {
            margin-top: auto !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
