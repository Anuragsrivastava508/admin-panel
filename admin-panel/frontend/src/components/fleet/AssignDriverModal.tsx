"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface AssignDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehicles: Array<{ id: string; name: string; regNumber: string; assignedDriverId?: string | null }>;
  drivers: Array<{ id: string; name: string; phone: string; certifiedPasses: string }>;
  defaultVehicleId?: string;
}

export function AssignDriverModal({
  isOpen,
  onClose,
  onSuccess,
  vehicles,
  drivers,
  defaultVehicleId,
}: AssignDriverModalProps) {
  const { showToast } = useToast();

  const [vehicleId, setVehicleId] = useState(defaultVehicleId || vehicles[0]?.id || "");
  const [driverId, setDriverId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedDriverId: driverId || null,
        }),
      });

      if (!res.ok) {
        showToast("Error", "Could not assign chauffeur", "error");
        setIsLoading(false);
        return;
      }

      showToast("Chauffeur Assigned", "Dispatch roster updated", "success");
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
      <div className="bg-surface-card rounded-2xl border border-border-clean shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border-clean">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">person_pin</span>
            </div>
            <div>
              <h3 className="font-headline text-[18px] font-bold text-charcoal-accent">
                Assign Mountain Chauffeur
              </h3>
              <p className="text-[12px] text-outline">Link driver to active Force cruiser</p>
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
              Select Cruiser *
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
            >
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.regNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
              Select Mountain Chauffeur
            </label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
            >
              <option value="">Unassign / No Driver</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.phone}) • {d.certifiedPasses.slice(0, 30)}...
                </option>
              ))}
            </select>
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
              <span>Commit Assignment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
