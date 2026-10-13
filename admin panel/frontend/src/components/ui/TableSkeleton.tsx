import React from "react";

export function StatSkeleton() {
  return (
    <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs animate-pulse flex flex-col justify-between h-32">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-slate-200 rounded"></div>
        <div className="w-8 h-8 rounded-lg bg-slate-200"></div>
      </div>
      <div>
        <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
        <div className="h-3 w-32 bg-slate-200 rounded"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  cols = 6,
  columns,
}: {
  rows?: number;
  cols?: number;
  columns?: number;
}) {
  const columnCount = columns || cols;
  return (
    <div className="w-full bg-surface-card rounded-xl border border-border-clean overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-100 border-b border-border-clean flex items-center px-4 gap-4">
        {Array.from({ length: columnCount }).map((_, i) => (
          <div key={i} className="h-3.5 bg-slate-200 rounded flex-1"></div>
        ))}
      </div>
      <div className="divide-y divide-border-clean">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 flex items-center px-4 gap-4">
            {Array.from({ length: columnCount }).map((_, j) => (
              <div key={j} className="h-3 bg-slate-200 rounded flex-1"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
