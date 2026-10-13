"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicles: Array<{ id: string; name: string; regNumber: string; ratePerKm: number }>;
  drivers: Array<{ id: string; name: string; phone: string }>;
  initialData?: any;
}

export function ManualBookingModal({
  isOpen,
  onClose,
  onSuccess,
  vehicles,
  drivers,
  initialData,
}: ManualBookingModalProps) {
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState(initialData?.customerName || "");
  const [customerPhone, setCustomerPhone] = useState(initialData?.customerPhone || "");
  const [customerEmail, setCustomerEmail] = useState(initialData?.customerEmail || "");
  const [pickupLocation, setPickupLocation] = useState(initialData?.pickupLocation || "");
  const [destination, setDestination] = useState(initialData?.destination || "");
  const [travelDate, setTravelDate] = useState(
    initialData?.travelDate ? new Date(initialData.travelDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [returnDate, setReturnDate] = useState("");
  const [passengerCount, setPassengerCount] = useState("");
  const [estimatedKm, setEstimatedKm] = useState(initialData?.distanceKm ? String(initialData.distanceKm) : "");
  const [ratePerKm, setRatePerKm] = useState(initialData?.ratePerKm ? String(initialData.ratePerKm) : "");
  const [advancePaid, setAdvancePaid] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [specialNotes, setSpecialNotes] = useState(initialData?.message || "");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const calculatedTotal = (Number(estimatedKm) || 0) * (Number(ratePerKm) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          pickupLocation,
          destination,
          travelDate,
          returnDate: returnDate || null,
          passengerCount: Number(passengerCount),
          estimatedKm: Number(estimatedKm),
          ratePerKm: Number(ratePerKm),
          advancePaid: Number(advancePaid),
          vehicleId: vehicleId || null,
          driverId: driverId || null,
          source: "ADMIN_DESK (Dispatcher)",
          specialNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast("Booking Creation Failed", data.error || "Please check inputs", "error");
        setIsLoading(false);
        return;
      }

      const confirmedPnr = data.booking?.pnr || data.data?.pnr || data.pnr || "CONFIRMED";
      showToast("Booking Confirmed", `PNR: ${confirmedPnr} created successfully!`, "success");
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch {
      showToast("Error", "Could not connect to booking server", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-accent/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-card rounded-2xl border border-border-clean shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border-clean">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal-accent text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">book_online</span>
            </div>
            <div>
              <h3 className="font-headline text-[18px] font-bold text-charcoal-accent">
                Create New Booking / PNR
              </h3>
              <p className="text-[12px] text-outline">
                Enter trip parameters for honest KM meter dispatch
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

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4 text-[13px]">
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Phone / WhatsApp *
              </label>
              <input
                type="text"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 9811..."
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              />
            </div>
          </div>

          {/* Route info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Pickup Location *
              </label>
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Delhi NCR, Airport, Noida, etc."
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Destination Circuit *
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Manali - Atal Tunnel - Kasol"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              />
            </div>
          </div>

          {/* Dates & Passengers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Travel Date *
              </label>
              <input
                type="date"
                required
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Return Date (Optional)
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Passengers
              </label>
              <input
                type="number"
                min="1"
                max="26"
                value={passengerCount}
                onChange={(e) => setPassengerCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card font-mono"
              />
            </div>
          </div>

          {/* Vehicle and Driver assignment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Assign Force Cruiser
              </label>
              <select
                value={vehicleId}
                onChange={(e) => {
                  setVehicleId(e.target.value);
                  const found = vehicles.find((v) => v.id === e.target.value);
                  if (found) setRatePerKm(String(found.ratePerKm));
                }}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              >
                <option value="">Select Later / Auto-Dispatch</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.regNumber}) - ₹{v.ratePerKm}/KM
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Assign Mountain Chauffeur
              </label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              >
                <option value="">Select Later / Available Driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.phone})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Financials & Odometer Calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-surface-subtle rounded-xl border border-border-clean">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Estimated Distance (KM)
              </label>
              <input
                type="number"
                value={estimatedKm}
                onChange={(e) => setEstimatedKm(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border-clean bg-surface-card text-on-surface font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Rate per KM (₹)
              </label>
              <input
                type="number"
                value={ratePerKm}
                onChange={(e) => setRatePerKm(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border-clean bg-surface-card text-on-surface font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Advance Paid (₹)
              </label>
              <input
                type="number"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border-clean bg-surface-card text-on-surface font-mono text-secondary font-bold"
              />
            </div>
          </div>

          {/* Total & Balance preview */}
          <div className="flex items-center justify-between text-[13px] px-1">
            <span className="text-on-surface-variant font-medium">
              Calculated Total:{" "}
              <strong className="text-charcoal-accent font-mono text-[15px]">
                ₹{calculatedTotal.toLocaleString()}
              </strong>
            </span>
            <span className="text-on-surface-variant font-medium">
              Balance Due:{" "}
              <strong className="text-secondary font-mono text-[15px]">
                ₹{Math.max(0, calculatedTotal - (Number(advancePaid) || 0)).toLocaleString()}
              </strong>
            </span>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
              Trip Notes &amp; Dispatch Instructions
            </label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g. Extra luggage carrier, pickup from terminal 3, senior citizen traveler..."
              className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-clean">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border-clean text-outline hover:text-charcoal-accent font-headline text-[13px] font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading && (
                <span className="material-symbols-outlined text-[16px] animate-spin">
                  progress_activity
                </span>
              )}
              <span>Confirm &amp; Generate PNR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
