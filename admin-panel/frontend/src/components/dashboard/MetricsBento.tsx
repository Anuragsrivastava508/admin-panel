"use client";

import React from "react";
import { formatCurrency } from "@/lib/utils";

interface MetricsBentoProps {
  stats: {
    totalBookings: number;
    confirmedBookings: number;
    enRouteBookings: number;
    completedBookings: number;
    totalCustomers: number;
    totalVehicles: number;
    activeVehicles: number;
    totalDrivers: number;
    totalEnquiries: number;
    newEnquiries: number;
    quotesSentCount: number;
    averageRating: number;
    reviewCount: number;
    totalRevenue: number;
    totalCollected: number;
    totalPending: number;
  };
  onQuickAction: (action: "add-booking" | "add-package" | "add-vehicle" | "sync") => void;
  isSyncing: boolean;
  syncPercent: number;
}

export function MetricsBento({
  stats,
  onQuickAction,
  isSyncing,
  syncPercent,
}: MetricsBentoProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header Context & Quick Actions Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-[26px] font-extrabold text-charcoal-accent tracking-tight">
              Operations Dispatch Hub
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold bg-gold-subtle text-secondary border border-gold-light/20">
              LIVE FLEET
            </span>
          </div>
          <p className="text-[13px] text-outline mt-1">
            Real-time CMS sync for Luxury Force Travellers, Himalayan Circuits, and Pan-India Inquiries.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onQuickAction("add-booking")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold hover:bg-slate-800 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Manual Booking</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickAction("add-package")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-card text-charcoal-accent font-headline text-[13px] font-bold border border-border-clean shadow-xs hover:bg-surface-subtle transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">
              add_location_alt
            </span>
            <span>Add Circuit</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickAction("add-vehicle")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-card text-charcoal-accent font-headline text-[13px] font-bold border border-border-clean shadow-xs hover:bg-surface-subtle transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-gold-light">
              airport_shuttle
            </span>
            <span>Add Cruiser</span>
          </button>
          <button
            type="button"
            disabled={isSyncing}
            onClick={() => onQuickAction("sync")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-white font-headline text-[13px] font-bold shadow-sm hover:bg-amber-700 transition-all disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isSyncing ? "animate-spin" : ""
              }`}
            >
              cloud_sync
            </span>
            <span>{isSyncing ? "Syncing Edge..." : "Sync Public Web"}</span>
          </button>
        </div>
      </div>

      {/* Live Sync Progress Bar (Active when syncing) */}
      {isSyncing && (
        <div className="rounded-xl bg-surface-card border border-border-clean p-4 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-[12px] font-headline mb-2 text-charcoal-accent">
            <span className="flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-[16px] text-secondary animate-spin">
                sync
              </span>
              <span>Regenerating Static Cache &amp; Edge Assets...</span>
            </span>
            <span className="font-bold text-secondary">{syncPercent}%</span>
          </div>
          <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden">
            <div
              className="bg-secondary h-full transition-all duration-300 rounded-full"
              style={{ width: `${syncPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 5 Core Metrics Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: Inquiries */}
        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-outline mb-2">
            <span className="text-[11px] font-headline uppercase tracking-wider font-bold">
              Total Inquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-charcoal-accent">
              <span className="material-symbols-outlined text-[18px]">inbox</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-[26px] font-extrabold text-charcoal-accent">
                {stats.totalEnquiries}
              </span>
              {stats.newEnquiries > 0 && (
                <span className="text-[10px] font-headline font-bold text-secondary bg-gold-subtle px-1.5 py-0.5 rounded">
                  {stats.newEnquiries} new
                </span>
              )}
            </div>
            <p className="text-[11px] text-outline mt-1 truncate">
              {stats.confirmedBookings} confirmed bookings
            </p>
          </div>
        </div>

        {/* Metric 2: Force Fleet Active */}
        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-outline mb-2">
            <span className="text-[11px] font-headline uppercase tracking-wider font-bold">
              Force Fleet On-Road
            </span>
            <div className="w-8 h-8 rounded-lg bg-status-verified-bg flex items-center justify-center text-status-verified">
              <span className="material-symbols-outlined text-[18px]">directions_bus</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-[26px] font-extrabold text-status-verified">
                {stats.activeVehicles}
              </span>
              <span className="text-[13px] text-on-surface-variant font-medium">
                / {stats.totalVehicles} Cruisers
              </span>
            </div>
            <p className="text-[11px] text-outline mt-1 truncate">
              12S &amp; 17S High-Roof Pushback
            </p>
          </div>
        </div>

        {/* Metric 3: WhatsApp Leads Desk */}
        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-outline mb-2">
            <span className="text-[11px] font-headline uppercase tracking-wider font-bold">
              WhatsApp Quotes
            </span>
            <div className="w-8 h-8 rounded-lg bg-gold-subtle flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">chat</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-headline text-[26px] font-extrabold text-secondary">
                {stats.quotesSentCount}
              </span>
              <span className="text-[10px] font-headline font-bold text-status-verified bg-status-verified-bg px-1.5 py-0.5 rounded">
                Active Desk
              </span>
            </div>
            <p className="text-[11px] text-outline mt-1 truncate">Direct KM Quotes Dispatched</p>
          </div>
        </div>

        {/* Metric 4: Revenue & KM Metered */}
        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-outline mb-2">
            <span className="text-[11px] font-headline uppercase tracking-wider font-bold">
              KM Metered Revenue
            </span>
            <div className="w-8 h-8 rounded-lg bg-surface-subtle flex items-center justify-center text-charcoal-accent">
              <span className="material-symbols-outlined text-[18px]">
                account_balance_wallet
              </span>
            </div>
          </div>
          <div>
            <div className="font-headline text-[22px] font-extrabold text-charcoal-accent truncate">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-[11px] text-status-verified font-medium mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              <span>100% Odometer Verified</span>
            </p>
          </div>
        </div>

        {/* Metric 5: Guest Rating */}
        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-outline mb-2">
            <span className="text-[11px] font-headline uppercase tracking-wider font-bold">
              Guest Trip Rating
            </span>
            <div className="w-8 h-8 rounded-lg bg-gold-subtle flex items-center justify-center text-gold-light">
              <span className="material-symbols-outlined text-[18px] fill">star</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-[20px] font-extrabold text-charcoal-accent">
                {stats.reviewCount > 0 ? stats.averageRating : "No reviews yet"}
              </span>
              {stats.reviewCount > 0 && (
                <div className="flex text-gold-light">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`material-symbols-outlined text-[14px] ${
                        star <= Math.round(stats.averageRating)
                          ? "fill"
                          : "text-slate-200"
                      }`}
                    >
                      star
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-[11px] text-outline mt-1 truncate">
              {stats.reviewCount > 0
                ? `${stats.reviewCount} Verified Reviews`
                : "No reviews yet"}
            </p>
          </div>
        </div>

        {/* Metric 6: 24/7 Desk */}
        <div className="p-4 rounded-xl bg-charcoal-accent text-white shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-300 mb-2">
            <span className="text-[11px] font-headline uppercase tracking-wider font-bold text-gold-light">
              24/7 Dispatch Desk
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-status-verified animate-ping"></span>
          </div>
          <div>
            <span className="font-headline text-[13px] font-extrabold text-white block truncate">
              +91 9310847853
            </span>
            <p className="text-[10px] text-slate-300 truncate mt-0.5">
              Delhi NCR &amp; Pan-India Dispatch Hub
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-gold-light font-medium">
            <span>Permits Status</span>
            <span className="material-symbols-outlined text-[14px]">pin_drop</span>
          </div>
        </div>
      </div>
    </div>
  );
}
