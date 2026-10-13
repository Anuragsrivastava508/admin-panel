"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  drivers: Array<{ id: string; name: string }>;
}

export function AddVehicleModal({
  isOpen,
  onClose,
  onSuccess,
  drivers,
}: AddVehicleModalProps) {
  const { showToast } = useToast();

  const [regNumber, setRegNumber] = useState("");
  const [name, setName] = useState("");
  const [tier, setTier] = useState("EXECUTIVE_12S");
  const [seatingCapacity, setSeatingCapacity] = useState("");
  const [color, setColor] = useState("");
  const [features, setFeatures] = useState("");
  const [ratePerKm, setRatePerKm] = useState("");
  const [driverAllowancePerDay, setDriverAllowancePerDay] = useState("");
  const [currentOdometer, setCurrentOdometer] = useState("");
  const [assignedDriverId, setAssignedDriverId] = useState("");
  const [status, setStatus] = useState("DISPATCH_QUEUED");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regNumber,
          name,
          tier,
          seatingCapacity: Number(seatingCapacity),
          color,
          features,
          ratePerKm: Number(ratePerKm),
          driverAllowancePerDay: Number(driverAllowancePerDay),
          currentOdometer: Number(currentOdometer),
          assignedDriverId: assignedDriverId || null,
          status,
          imageUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast("Error", data.error || "Could not register vehicle", "error");
        setIsLoading(false);
        return;
      }

      showToast("Cruiser Registered", `Vehicle ${data.vehicle.regNumber} enrolled into fleet`, "success");
      setIsLoading(false);
      onSuccess();
      onClose();
    } catch {
      showToast("Error", "Server connection issue", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-accent/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-card rounded-2xl border border-border-clean shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border-clean">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-charcoal-accent text-gold-light flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">directions_bus</span>
            </div>
            <div>
              <h3 className="font-headline text-[18px] font-bold text-charcoal-accent">
                Enroll Force Fleet Cruiser
              </h3>
              <p className="text-[12px] text-outline">
                Register vehicle for live GPS tracking &amp; honest KM odometer billing
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Registration Number *
              </label>
              <input
                type="text"
                required
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value.toUpperCase())}
                placeholder="e.g. DL-1VC-8821"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono font-bold focus:outline-none focus:bg-surface-card"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Vehicle Model / Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Luxury Force Executive Cruiser"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Fleet Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              >
                <option value="EXECUTIVE_12S">Executive 12S</option>
                <option value="GRAND_17S">Grand Coach 17S</option>
                <option value="MAHARAJA_FLAGSHIP">Maharaja Flagship Suite</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Exterior Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Dark Metallic Grey"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Rate / KM (₹) *
              </label>
              <input
                type="number"
                required
                value={ratePerKm}
                onChange={(e) => setRatePerKm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Current Odometer (KM)
              </label>
              <input
                type="number"
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
              >
                <option value="ACTIVE_ON_ROAD">Active On-Road</option>
                <option value="DISPATCH_QUEUED">Dispatch Queued</option>
                <option value="MAINTENANCE">Depot Maintenance</option>
                <option value="IDLE">Depot Idle</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
              Assign Dedicated Mountain Chauffeur
            </label>
            <select
              value={assignedDriverId}
              onChange={(e) => setAssignedDriverId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
            >
              <option value="">None / Floating Assignment</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
              Cabin Features &amp; Amenities
            </label>
            <input
              type="text"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
              placeholder="e.g. Pushback Recliners, Dual AC, Wood Trim, Fast USB, ABS"
              className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
            />
          </div>

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
              <span>Enroll Cruiser</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
