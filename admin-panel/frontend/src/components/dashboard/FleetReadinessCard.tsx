"use client";

import React from "react";

interface FleetReadinessProps {
  activeCount: number;
  totalCount: number;
  onOpenFleet: () => void;
}

export function FleetReadinessCard({
  activeCount,
  totalCount,
  onOpenFleet,
}: FleetReadinessProps) {
  const percentage = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;

  return (
    <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs p-5 flex flex-col gap-4">
      {/* Route Advisory Strip */}
      <div className="rounded-xl bg-surface-subtle border border-border-clean p-4 flex items-center justify-between text-[12px] text-outline">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">info</span>
          <span className="font-headline font-semibold text-charcoal-accent">No route advisory</span>
        </div>
        <span className="text-[11px]">All clear</span>
      </div>

      {/* Fleet Deployment Gauge */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="font-headline text-[14px] font-bold text-charcoal-accent">
            Fleet Deployment Ratio
          </span>
          <span className="font-headline text-[13px] font-bold text-secondary">
            {activeCount} / {totalCount} ({percentage}%)
          </span>
        </div>
        <div className="w-full bg-surface-subtle h-2.5 rounded-full overflow-hidden mb-3">
          <div
            className="bg-secondary h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>

        <div className="space-y-2 text-[12px]">
          <div className="flex items-center justify-between py-1 border-b border-border-clean">
            <span className="text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-secondary">
                airport_shuttle
              </span>
              <span>Total Registered Fleet:</span>
            </span>
            <strong className="font-headline text-charcoal-accent">{totalCount} Cruisers</strong>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-border-clean">
            <span className="text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-status-verified">
                directions_bus
              </span>
              <span>Active On-Road:</span>
            </span>
            <strong className="font-headline text-status-verified">{activeCount} Deployed</strong>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-outline">
                garage
              </span>
              <span>In Hub / Ready for Dispatch:</span>
            </span>
            <strong className="font-headline text-charcoal-accent">
              {Math.max(0, totalCount - activeCount)} Standby
            </strong>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenFleet}
          className="w-full mt-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-charcoal-accent font-headline text-[12px] font-bold hover:bg-surface-card hover:border-charcoal-accent transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Manage Live Fleet &amp; Odometer</span>
          <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
