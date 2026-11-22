import React from "react";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({
  rows = 6,
  columns = 6,
  className = "",
}: TableSkeletonProps) {
  const widths = ["w-3/4", "w-1/2", "w-2/3", "w-4/5", "w-1/3", "w-1/4"];

  return (
    <div className={`w-full overflow-hidden animate-pulse ${className}`}>
      {/* Table Header Placeholder */}
      <div className="h-10 bg-slate-100 dark:bg-slate-800/80 rounded-t-xl mb-1 flex items-center px-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded-md"
            style={{ width: `${Math.max(40, 100 / columns)}%` }}
          />
        ))}
      </div>

      {/* Rows Placeholder */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="h-12 bg-white dark:bg-[#0f172a] px-4 flex items-center gap-4"
          >
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className={`h-3 bg-slate-100 dark:bg-slate-800 rounded-md ${
                  widths[(r + c) % widths.length]
                }`}
                style={{ width: `${Math.max(40, 100 / columns)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton({
  count = 4,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/5" />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2 ml-auto" />
          </div>
          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
        </div>
      ))}
    </div>
  );
}

export function PosGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-2.5"
        >
          <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
          <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="flex justify-between items-center pt-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Full POS screen skeleton (Categories, Filter, Grid + Right Cart)
 */
export function PosFullSkeleton() {
  return (
    <div className="space-y-3 animate-pulse w-full">
      {/* Top Categories Scroll Placeholder */}
      <div className="flex items-center gap-2 overflow-hidden py-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-28 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
        ))}
      </div>

      {/* Search & Actions Bar Placeholder */}
      <div className="h-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 w-full" />

      {/* Main Split: Left Catalog + Right Cart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left: Product Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-3 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>

        {/* Right: Cart Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-12 bg-slate-50 dark:bg-slate-800/60 rounded-xl w-full" />
            ))}
          </div>
          <div className="h-28 bg-slate-100 dark:bg-slate-800 rounded-xl w-full pt-2" />
          <div className="h-11 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard full screen skeleton (Header, KPIs, Charts, Tables)
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 animate-pulse w-full">
      {/* Top Banner Card Skeleton */}
      <div className="h-20 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between">
        <div className="space-y-2 w-1/3">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
        </div>
        <div className="h-9 w-60 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      </div>

      {/* 4 Primary KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
              <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
          </div>
        ))}
      </div>

      {/* 4 Secondary Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>

      {/* 2 Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
          <div className="h-56 bg-slate-50 dark:bg-slate-800/50 rounded-xl w-full" />
        </div>
        <div className="lg:col-span-1 h-80 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          <div className="w-48 h-48 mx-auto rounded-full bg-slate-100 dark:bg-slate-800" />
        </div>
      </div>

      {/* Recent Orders Table Skeleton */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
        <TableSkeleton rows={5} columns={5} />
      </div>
    </div>
  );
}

/**
 * Universal Page Skeleton (Banner + Search Bar + Table)
 */
export function PageSkeleton({ title = "তথ্য লোড হচ্ছে..." }: { title?: string }) {
  return (
    <div className="space-y-4 sm:space-y-5 animate-pulse w-full">
      <div className="h-20 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 flex items-center justify-between">
        <div className="space-y-2 w-1/3">
          <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
        </div>
        <div className="h-9.5 w-32 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl" />
      </div>
      <div className="h-11 bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800" />
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <TableSkeleton rows={6} columns={6} />
      </div>
    </div>
  );
}
