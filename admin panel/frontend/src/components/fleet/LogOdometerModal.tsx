"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface LogOdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicles: Array<{ id: string; name: string; regNumber: string; currentOdometer: number }>;
  drivers: Array<{ id: string; name: string }>;
  defaultVehicleId?: string;
}

export function LogOdometerModal({
  isOpen,
  onClose,
  onSuccess,
  vehicles,
  drivers,
  defaultVehicleId,
}: LogOdometerModalProps) {
  const { showToast } = useToast();

  const selectedVeh = vehicles.find((v) => v.id === defaultVehicleId) || vehicles[0];

  const [vehicleId, setVehicleId] = useState(defaultVehicleId || vehicles[0]?.id || "");
  const [driverId, setDriverId] = useState(drivers[0]?.id || "");
  const [tripPnr, setTripPnr] = useState("BTT-2026-");
  const [startOdometer, setStartOdometer] = useState(
    selectedVeh ? String(selectedVeh.currentOdometer) : "45000"
  );
  const [endOdometer, setEndOdometer] = useState("");
  const [fuelLitres, setFuelLitres] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [tollTaxes, setTollTaxes] = useState("");
  const [auditStatus, setAuditStatus] = useState("VERIFIED_HONEST_KM");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const totalKmRun =
    endOdometer && Number(endOdometer) > Number(startOdometer)
      ? Number(endOdometer) - Number(startOdometer)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/odometer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          driverId: driverId || null,
          tripPnr: tripPnr || null,
          startOdometer: Number(startOdometer),
          endOdometer: endOdometer ? Number(endOdometer) : null,
          fuelLitres: fuelLitres ? Number(fuelLitres) : null,
          fuelCost: fuelCost ? Number(fuelCost) : null,
          tollTaxes: tollTaxes ? Number(tollTaxes) : 0,
          auditStatus,
          notes,
        }),
      });

      if (!res.ok) {
        showToast("Error", "Could not log odometer audit", "error");
        setIsLoading(false);
        return;
      }

      showToast("Odometer Verified", "100% Honest KM audit trail recorded", "success");
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
      <div className="bg-surface-card rounded-2xl border border-border-clean shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border-clean">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-status-verified-bg text-status-verified flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">speed</span>
            </div>
            <div>
              <h3 className="font-headline text-[18px] font-bold text-charcoal-accent">
                Log Trip Odometer &amp; KM Audit
              </h3>
              <p className="text-[12px] text-outline">
                Record trip start/end meter readings for honest billing certification
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
          <div>
            <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
              Select Fleet Vehicle *
            </label>
            <select
              value={vehicleId}
              onChange={(e) => {
                setVehicleId(e.target.value);
                const veh = vehicles.find((v) => v.id === e.target.value);
                if (veh) setStartOdometer(String(veh.currentOdometer));
              }}
              className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.regNumber}) • {v.currentOdometer} KM
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Mountain Pilot / Driver
              </label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
              >
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Trip PNR (Optional)
              </label>
              <input
                type="text"
                value={tripPnr}
                onChange={(e) => setTripPnr(e.target.value)}
                placeholder="BTT-2026-XXXX"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-surface-subtle border border-border-clean">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Start Odometer Reading *
              </label>
              <input
                type="number"
                required
                value={startOdometer}
                onChange={(e) => setStartOdometer(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border-clean bg-surface-card text-on-surface font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                End Odometer Reading
              </label>
              <input
                type="number"
                value={endOdometer}
                onChange={(e) => setEndOdometer(e.target.value)}
                placeholder="Trip end reading"
                className="w-full px-3 py-1.5 rounded-lg border border-border-clean bg-surface-card text-on-surface font-mono font-bold text-status-verified"
              />
            </div>
            {totalKmRun > 0 && (
              <div className="sm:col-span-2 pt-2 border-t border-border-clean flex justify-between items-center text-[12px]">
                <span className="font-headline font-bold text-charcoal-accent">
                  Calculated Billable Distance:
                </span>
                <span className="font-mono font-extrabold text-[15px] text-status-verified">
                  {totalKmRun} KM
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Fuel Litres
              </label>
              <input
                type="number"
                value={fuelLitres}
                onChange={(e) => setFuelLitres(e.target.value)}
                placeholder="Litres"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Fuel Cost (₹)
              </label>
              <input
                type="number"
                value={fuelCost}
                onChange={(e) => setFuelCost(e.target.value)}
                placeholder="₹ Amount"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Toll Taxes (₹)
              </label>
              <input
                type="number"
                value={tollTaxes}
                onChange={(e) => setTollTaxes(e.target.value)}
                placeholder="₹ Tolls"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
              Audit Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. GPS telemetry matched physical odometer readout perfectly"
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
              <span>Commit Odometer Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
