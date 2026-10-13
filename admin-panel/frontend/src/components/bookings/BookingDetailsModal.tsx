"use client";

import React, { useState } from "react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface BookingDetailsModalProps {
  isOpen: boolean;
  booking: any;
  onClose: () => void;
  onUpdate: () => void;
  onDeleteRequest: (bookingId: string, pnr: string) => void;
  vehicles: Array<{ id: string; name: string; regNumber: string }>;
  drivers: Array<{ id: string; name: string; phone: string }>;
}

export function BookingDetailsModal({
  isOpen,
  booking,
  onClose,
  onUpdate,
  onDeleteRequest,
  vehicles,
  drivers,
}: BookingDetailsModalProps) {
  const { showToast } = useToast();

  const [bookingStatus, setBookingStatus] = useState(booking?.bookingStatus || "CONFIRMED");
  const [paymentStatus, setPaymentStatus] = useState(booking?.paymentStatus || "PENDING");
  const [vehicleId, setVehicleId] = useState(booking?.vehicleId || "");
  const [driverId, setDriverId] = useState(booking?.driverId || "");
  const [actualKm, setActualKm] = useState(booking?.actualKm ? String(booking.actualKm) : "");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !booking) return null;

  const handleSaveStatus = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingStatus,
          paymentStatus,
          vehicleId: vehicleId || null,
          driverId: driverId || null,
          actualKm: actualKm ? Number(actualKm) : null,
        }),
      });

      if (!res.ok) {
        showToast("Update Failed", "Could not update booking", "error");
        setIsUpdating(false);
        return;
      }

      showToast("Booking Updated", `PNR: ${booking.pnr} status refreshed`, "success");
      setIsUpdating(false);
      onUpdate();
      onClose();
    } catch {
      showToast("Error", "Server connection issue", "error");
      setIsUpdating(false);
    }
  };

  const handlePrintTripSheet = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-accent/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-card rounded-2xl border border-border-clean shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-clean">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-verified-bg text-status-verified flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline text-[18px] font-bold text-charcoal-accent">
                  Trip Manifest: {booking.pnr}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-headline font-bold bg-gold-subtle text-secondary">
                  {booking.bookingStatus}
                </span>
              </div>
              <p className="text-[12px] text-outline mt-0.5">
                Created: {formatDateTime(booking.createdAt)} • Source: {booking.source}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-outline hover:bg-surface-subtle"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Manifest Content */}
        <div className="mt-4 flex flex-col gap-5 text-[13px]">
          {/* Customer & Route Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="p-4 rounded-xl bg-surface-subtle border border-border-clean space-y-2">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-outline block">
                Passenger / Customer Details
              </span>
              <div className="font-headline font-bold text-[15px] text-charcoal-accent">
                {booking.customer?.name}
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  phone
                </span>
                <a
                  href={`tel:${booking.customer?.phone}`}
                  className="hover:underline font-mono"
                >
                  {booking.customer?.phone}
                </a>
              </div>
              {booking.customer?.email && (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-outline">
                    mail
                  </span>
                  <span>{booking.customer?.email}</span>
                </div>
              )}
              {booking.customer?.address && (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-outline">
                    home
                  </span>
                  <span>{booking.customer?.address}</span>
                </div>
              )}
            </div>

            {/* Circuit & Travel Dates Box */}
            <div className="p-4 rounded-xl bg-surface-subtle border border-border-clean space-y-2">
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-outline block">
                Trip Route &amp; Travel Manifest
              </span>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-status-verified">
                  trip_origin
                </span>
                <span className="font-bold text-charcoal-accent">
                  {booking.pickupLocation}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-secondary">
                  pin_drop
                </span>
                <span className="font-bold text-charcoal-accent">
                  {booking.destination}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 text-[12px] text-outline border-t border-border-clean">
                <span>Travel Date: <strong>{formatDate(booking.travelDate)}</strong></span>
                <span>Passengers: <strong>{booking.passengerCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Odometer & Financial Settlement */}
          <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-border-clean pb-2">
              <span className="font-headline font-bold text-[14px] text-charcoal-accent">
                Transparent KM Meter Billing Breakdown
              </span>
              <span className="text-[11px] font-bold text-status-verified flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">speed</span>
                <span>100% Honest Odometer</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-lg bg-surface-subtle">
                <span className="text-[10px] uppercase font-bold text-outline block">
                  Est. Distance
                </span>
                <span className="font-headline font-extrabold text-[16px] text-charcoal-accent">
                  {booking.estimatedKm} KM
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-subtle">
                <span className="text-[10px] uppercase font-bold text-outline block">
                  Rate / KM
                </span>
                <span className="font-headline font-extrabold text-[16px] text-charcoal-accent">
                  ₹{booking.ratePerKm}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface-subtle">
                <span className="text-[10px] uppercase font-bold text-outline block">
                  Total Fare
                </span>
                <span className="font-headline font-extrabold text-[16px] text-charcoal-accent">
                  {formatCurrency(booking.totalAmount)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-gold-subtle">
                <span className="text-[10px] uppercase font-bold text-secondary block">
                  Balance Due
                </span>
                <span className="font-headline font-extrabold text-[16px] text-secondary">
                  {formatCurrency(booking.balanceDue)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[12px] pt-1 text-on-surface-variant">
              <span>Advance Collected: <strong>{formatCurrency(booking.advancePaid)}</strong></span>
              <span>Payment Status: <strong className="uppercase">{booking.paymentStatus}</strong></span>
            </div>
          </div>

          {/* Dispatch Assignment & Actual Odometer Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-surface-subtle rounded-xl border border-border-clean">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Assigned Vehicle
              </label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border-clean bg-surface-card text-on-surface text-[12px]"
              >
                <option value="">No Vehicle Assigned</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.regNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Mountain Chauffeur
              </label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border-clean bg-surface-card text-on-surface text-[12px]"
              >
                <option value="">No Driver Assigned</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Actual Odometer KM (Final)
              </label>
              <input
                type="number"
                value={actualKm}
                onChange={(e) => setActualKm(e.target.value)}
                placeholder="e.g. 1152"
                className="w-full px-2.5 py-1.5 rounded-lg border border-border-clean bg-surface-card text-on-surface text-[12px] font-mono"
              />
            </div>
          </div>

          {/* Status Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Dispatch Lifecycle Status
              </label>
              <select
                value={bookingStatus}
                onChange={(e) => setBookingStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-semibold text-[13px]"
              >
                <option value="NEW_LEAD">NEW LEAD</option>
                <option value="QUOTE_SENT">QUOTE SENT</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="EN_ROUTE">EN ROUTE (ON ROAD)</option>
                <option value="COMPLETED">COMPLETED &amp; AUDITED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-semibold text-[13px]"
              >
                <option value="PENDING">PENDING</option>
                <option value="PARTIAL">PARTIAL (ADVANCE RECEIVED)</option>
                <option value="PAID">PAID (SETTLED IN FULL)</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          {booking.specialNotes && (
            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 text-[12px] text-amber-900">
              <strong>Notes:</strong> {booking.specialNotes}
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border-clean">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintTripSheet}
                className="px-3 py-2 rounded-xl border border-border-clean bg-surface-card hover:bg-surface-subtle text-charcoal-accent font-headline text-[12px] font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Trip Sheet</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteRequest(booking.id, booking.pnr)}
                className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-status-alert font-headline text-[12px] font-semibold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                <span>Delete</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border-clean text-outline hover:text-charcoal-accent font-headline text-[12px] font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={handleSaveStatus}
                className="px-5 py-2 rounded-xl bg-charcoal-accent text-white font-headline text-[12px] font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {isUpdating && (
                  <span className="material-symbols-outlined text-[15px] animate-spin">
                    progress_activity
                  </span>
                )}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
