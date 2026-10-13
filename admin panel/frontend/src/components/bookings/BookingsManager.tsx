"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ManualBookingModal } from "./ManualBookingModal";
import { BookingDetailsModal } from "./BookingDetailsModal";
import { WhatsAppKmFareSimulator } from "./WhatsAppKmFareSimulator";

export function BookingsManager() {
  const { showToast } = useToast();

  const [bookings, setBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [quoteForBooking, setQuoteForBooking] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; pnr: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Bookings
  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/bookings", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);
      url.searchParams.set("page", String(page));

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      showToast("Error", "Could not load bookings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Load Fleet & Drivers for assignment dropdowns
  const fetchFleetAndDrivers = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/drivers"),
      ]);
      if (vRes.ok) {
        const vData = await vRes.json();
        setVehicles(vData.vehicles || []);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDrivers(dData.drivers || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchFleetAndDrivers();
  }, [search, statusFilter, page]);

  // Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/bookings/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Booking Deleted", `PNR ${deleteTarget.pnr} deleted successfully`, "success");
        setDeleteTarget(null);
        fetchBookings();
      } else {
        showToast("Error", "Could not delete booking", "error");
      }
    } catch {
      showToast("Error", "Server connection issue", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = [
      "PNR",
      "Customer",
      "Phone",
      "Destination",
      "Travel Date",
      "Estimated KM",
      "Total Amount",
      "Advance Paid",
      "Balance Due",
      "Status",
    ];
    const rows = bookings.map((b) => [
      b.pnr,
      b.customer?.name || "",
      b.customer?.phone || "",
      `"${b.destination}"`,
      formatDate(b.travelDate),
      b.estimatedKm,
      b.totalAmount,
      b.advancePaid,
      b.balanceDue,
      b.bookingStatus,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Budhram_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Export Complete", "Bookings manifest downloaded as CSV", "success");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW_LEAD":
        return "bg-gold-subtle text-secondary border-gold-light/30";
      case "QUOTE_SENT":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "CONFIRMED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "EN_ROUTE":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "COMPLETED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Pipeline counts
  const totalCount = bookings.length;
  const newLeadsCount = bookings.filter((b) => b.bookingStatus === "NEW_LEAD").length;
  const confirmedCount = bookings.filter((b) => b.bookingStatus === "CONFIRMED").length;
  const enRouteCount = bookings.filter((b) => b.bookingStatus === "EN_ROUTE").length;
  const completedCount = bookings.filter((b) => b.bookingStatus === "COMPLETED").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner and Quick Launch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-[24px] font-extrabold text-charcoal-accent tracking-tight">
              All Bookings &amp; Trip Manifests
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold bg-status-verified-bg text-status-verified border border-status-verified/20">
              100% ODOMETER BILLING
            </span>
          </div>
          <p className="text-[13px] text-outline mt-1">
            Real-time management for commercial tours, mountain manifests, and client settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setQuoteForBooking(null);
              setIsManualBookingOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold hover:bg-slate-800 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Manual Booking</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl border border-border-clean bg-surface-card text-charcoal-accent font-headline text-[13px] font-semibold hover:bg-surface-subtle transition-colors flex items-center gap-1 shadow-xs"
            title="Download CSV"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Workspace Grid: Left Table (8 cols) + Right WhatsApp Simulator (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Table Section */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {/* Pipeline Status Ribbon (from Stitch design) */}
          <div className="bg-surface-card p-3 rounded-2xl border border-border-clean shadow-xs flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-xl font-headline text-[12px] font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                statusFilter === "ALL"
                  ? "bg-charcoal-accent text-white shadow-xs"
                  : "bg-surface-subtle text-on-surface-variant hover:text-charcoal-accent"
              }`}
            >
              <span>All Bookings</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-charcoal-accent font-mono">
                {totalCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("CONFIRMED")}
              className={`px-3 py-1.5 rounded-xl font-headline text-[12px] font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                statusFilter === "CONFIRMED"
                  ? "bg-charcoal-accent text-white shadow-xs"
                  : "bg-surface-subtle text-on-surface-variant hover:text-charcoal-accent"
              }`}
            >
              <span>Confirmed</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                {confirmedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("EN_ROUTE")}
              className={`px-3 py-1.5 rounded-xl font-headline text-[12px] font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                statusFilter === "EN_ROUTE"
                  ? "bg-charcoal-accent text-white shadow-xs"
                  : "bg-surface-subtle text-on-surface-variant hover:text-charcoal-accent"
              }`}
            >
              <span>En-Route Fleet</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-100 text-purple-800 font-mono">
                {enRouteCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("NEW_LEAD")}
              className={`px-3 py-1.5 rounded-xl font-headline text-[12px] font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                statusFilter === "NEW_LEAD"
                  ? "bg-charcoal-accent text-white shadow-xs"
                  : "bg-surface-subtle text-on-surface-variant hover:text-charcoal-accent"
              }`}
            >
              <span>New Leads</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono">
                {newLeadsCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("COMPLETED")}
              className={`px-3 py-1.5 rounded-xl font-headline text-[12px] font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                statusFilter === "COMPLETED"
                  ? "bg-charcoal-accent text-white shadow-xs"
                  : "bg-surface-subtle text-on-surface-variant hover:text-charcoal-accent"
              }`}
            >
              <span>Audited &amp; Closed</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                {completedCount}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by PNR, customer name, phone, or destination..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border-clean bg-surface-card text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:border-charcoal-accent shadow-xs"
            />
          </div>

          {/* Master Bookings Table */}
          <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs overflow-hidden">
            {isLoading ? (
              <TableSkeleton rows={6} cols={6} />
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
                <span className="material-symbols-outlined text-outline text-[40px]">
                  book_online
                </span>
                <span className="font-headline font-bold text-charcoal-accent text-[15px]">
                  No bookings found
                </span>
                <p className="text-[13px] text-outline">
                  Try clearing your search query or create a new booking using the button above.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] font-headline uppercase tracking-wider text-outline bg-surface-subtle/60 border-b border-border-clean">
                      <th className="py-3 px-4 font-bold">PNR &amp; Created</th>
                      <th className="py-3 px-3 font-bold">Customer Details</th>
                      <th className="py-3 px-3 font-bold">Route &amp; Date</th>
                      <th className="py-3 px-3 font-bold">Fleet &amp; Driver</th>
                      <th className="py-3 px-3 font-bold">KM Fare &amp; Advance</th>
                      <th className="py-3 px-3 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-clean text-[13px]">
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-surface-subtle/50 transition-colors"
                      >
                        {/* PNR & Created */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-charcoal-accent block">
                            {booking.pnr}
                          </span>
                          <span className="text-[11px] text-outline block mt-0.5">
                            {formatDate(booking.createdAt)}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-3">
                          <span className="font-headline font-bold text-charcoal-accent block">
                            {booking.customer?.name}
                          </span>
                          <a
                            href={`tel:${booking.customer?.phone}`}
                            className="text-[12px] text-outline hover:text-charcoal-accent font-mono block mt-0.5"
                          >
                            {booking.customer?.phone}
                          </a>
                        </td>

                        {/* Route & Date */}
                        <td className="py-3.5 px-3">
                          <span className="font-medium text-charcoal-accent block truncate max-w-[170px]">
                            {booking.destination}
                          </span>
                          <span className="text-[11px] text-outline block mt-0.5">
                            {formatDate(booking.travelDate)} • {booking.passengerCount} Pax
                          </span>
                        </td>

                        {/* Vehicle & Driver */}
                        <td className="py-3.5 px-3">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-surface-subtle text-charcoal-accent truncate max-w-[140px]">
                            {booking.vehicle?.name || "Unassigned"}
                          </span>
                          <span className="text-[11px] text-outline block mt-0.5 truncate max-w-[140px]">
                            {booking.driver?.name || "Unassigned"}
                          </span>
                        </td>

                        {/* Financials */}
                        <td className="py-3.5 px-3">
                          <span className="font-mono font-bold text-charcoal-accent block">
                            {formatCurrency(booking.totalAmount)}
                          </span>
                          <span className="text-[11px] text-secondary font-mono block mt-0.5">
                            Due: {formatCurrency(booking.balanceDue)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-headline font-bold border ${getStatusBadge(
                              booking.bookingStatus
                            )}`}
                          >
                            {booking.bookingStatus}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedBooking(booking)}
                              className="px-2.5 py-1 rounded-lg bg-charcoal-accent text-white font-headline text-[11px] font-bold hover:bg-slate-800 transition-colors shadow-xs"
                            >
                              Inspect
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({ id: booking.id, pnr: booking.pnr })
                              }
                              className="p-1 rounded-lg text-outline hover:text-status-alert hover:bg-red-50 transition-colors"
                              title="Delete Booking"
                            >
                              <span className="material-symbols-outlined text-[17px]">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: WhatsApp KM Fare Simulator Desk */}
        <div className="xl:col-span-4">
          <WhatsAppKmFareSimulator
            onBookNow={(quoteDetails) => {
              setQuoteForBooking(quoteDetails);
              setIsManualBookingOpen(true);
            }}
          />
        </div>
      </div>

      {/* Manual Booking Modal */}
      {isManualBookingOpen && (
        <ManualBookingModal
          isOpen={isManualBookingOpen}
          onClose={() => setIsManualBookingOpen(false)}
          onSuccess={fetchBookings}
          vehicles={vehicles}
          drivers={drivers}
          initialData={quoteForBooking}
        />
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={!!selectedBooking}
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdate={fetchBookings}
          onDeleteRequest={(id, pnr) => {
            setSelectedBooking(null);
            setDeleteTarget({ id, pnr });
          }}
          vehicles={vehicles}
          drivers={drivers}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Trip Booking"
        message={`Are you sure you want to delete PNR "${deleteTarget?.pnr}"? This action cannot be undone and will purge the linked reservation and payment history.`}
        confirmLabel="Yes, Delete Booking"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
