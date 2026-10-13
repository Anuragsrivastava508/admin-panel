"use client";

import React from "react";
import { formatDate } from "@/lib/utils";

interface EnquiryItem {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  destinationCircuit?: string | null;
  travelDate?: string | Date | null;
  vehicleChoice?: string | null;
  passengers?: string | null;
  estimatedFare?: number | null;
  status: string;
  createdAt: string | Date;
}

interface RecentEnquiriesTableProps {
  enquiries: EnquiryItem[];
  onViewAll: () => void;
  onSelectEnquiry: (enquiry: EnquiryItem) => void;
  onConvertToBooking: (enquiry: EnquiryItem) => void;
}

export function RecentEnquiriesTable({
  enquiries,
  onViewAll,
  onSelectEnquiry,
  onConvertToBooking,
}: RecentEnquiriesTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-gold-subtle text-secondary border-gold-light/30 font-bold";
      case "QUOTE_SENT":
        return "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
      case "CONTACTED":
        return "bg-purple-50 text-purple-700 border-purple-200 font-semibold";
      case "FOLLOW_UP":
        return "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
      case "CONVERTED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold";
      case "CLOSED":
      case "RESOLVED":
        return "bg-slate-100 text-slate-700 border-slate-200 font-semibold";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200 font-semibold";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs p-5 flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b border-border-clean mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-headline text-[16px] font-bold text-charcoal-accent">
            Live Trip Enquiries
          </h3>
          <span className="text-[11px] font-headline font-bold px-2 py-0.5 rounded bg-surface-subtle text-outline">
            Real-time
          </span>
        </div>
        <button
          type="button"
          onClick={onViewAll}
          className="font-headline text-[13px] font-semibold text-secondary hover:underline flex items-center gap-1"
        >
          <span>View All Leads</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] font-headline uppercase tracking-wider text-outline border-b border-border-clean pb-2">
              <th className="pb-2 font-bold">Customer</th>
              <th className="pb-2 font-bold">Circuit &amp; Route</th>
              <th className="pb-2 font-bold">Travel Date</th>
              <th className="pb-2 font-bold">Vehicle</th>
              <th className="pb-2 font-bold">Status</th>
              <th className="pb-2 font-bold text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-clean text-[13px]">
            {enquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-outline">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[36px] text-outline/40">
                      inbox
                    </span>
                    <p className="font-headline font-semibold text-charcoal-accent text-[14px]">
                      0 Customer Inquiries
                    </p>
                    <p className="text-[12px] text-outline max-w-xs">
                      Incoming travel inquiries from budhramtravels.com and WhatsApp will be listed here in real-time.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              enquiries.map((enq) => (
                <tr key={enq.id} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="py-3 pr-2">
                    <div className="flex flex-col">
                      <span className="font-headline font-bold text-charcoal-accent">
                        {enq.name}
                      </span>
                      <a
                        href={`tel:${enq.phone}`}
                        className="text-[12px] text-outline hover:text-charcoal-accent transition-colors"
                      >
                        {enq.phone}
                      </a>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-medium text-charcoal-accent truncate block max-w-xs">
                      {enq.destinationCircuit || "—"}
                    </span>
                    <span className="text-[11px] text-outline block">
                      {enq.passengers || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-on-surface-variant font-medium whitespace-nowrap">
                    {formatDate(enq.travelDate)}
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-surface-subtle text-charcoal-accent truncate max-w-[140px]">
                      {enq.vehicleChoice || "—"}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-headline font-bold border ${getStatusBadge(
                        enq.status
                      )}`}
                    >
                      {enq.status}
                    </span>
                  </td>
                  <td className="py-3 pl-2 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                          enq.name
                        )},%20Budhram%20Tour%20%26%20Travels%20here%20regarding%20your%20inquiry.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-green-50 text-status-verified hover:bg-green-100 transition-colors"
                        title="Chat on WhatsApp"
                      >
                        <span className="material-symbols-outlined text-[17px]">chat</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => onConvertToBooking(enq)}
                        className="px-2.5 py-1 rounded-lg bg-charcoal-accent text-white font-headline text-[11px] font-bold hover:bg-slate-800 transition-colors shadow-xs"
                      >
                        Book Trip
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
