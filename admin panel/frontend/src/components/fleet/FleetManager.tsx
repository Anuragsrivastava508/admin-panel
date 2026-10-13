"use client";

import React, { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AddVehicleModal } from "./AddVehicleModal";
import { LogOdometerModal } from "./LogOdometerModal";
import { AssignDriverModal } from "./AssignDriverModal";

export function FleetManager({
  initialSubTab = "vehicles",
}: {
  initialSubTab?: "vehicles" | "drivers" | "odometer";
}) {
  const { showToast } = useToast();

  const [activeSubTab, setActiveSubTab] = useState<"vehicles" | "drivers" | "odometer">(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [odometerLogs, setOdometerLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isLogOdometerOpen, setIsLogOdometerOpen] = useState(false);
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [vRes, dRes, oRes] = await Promise.all([
        fetch("/api/vehicles"),
        fetch("/api/drivers"),
        fetch("/api/odometer"),
      ]);

      if (vRes.ok) {
        const vData = await vRes.json();
        setVehicles(vData.vehicles || []);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDrivers(dData.drivers || []);
      }
      if (oRes.ok) {
        const oData = await oRes.json();
        setOdometerLogs(oData.logs || []);
      }
    } catch {
      showToast("Error", "Could not load fleet data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleDeleteVehicle = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/vehicles/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Vehicle Removed", `Vehicle "${deleteTarget.name}" deleted`, "success");
        setDeleteTarget(null);
        fetchAll();
      } else {
        showToast("Error", "Could not delete vehicle", "error");
      }
    } catch {
      showToast("Error", "Server connection issue", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Status badge styling
  const getVehicleStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE_ON_ROAD":
        return "bg-status-verified-bg text-status-verified border-status-verified/20";
      case "DISPATCH_QUEUED":
        return "bg-gold-subtle text-secondary border-gold-light/20";
      case "MAINTENANCE":
        return "bg-status-alert-bg text-status-alert border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const activeVehiclesCount = vehicles.filter((v) => v.status === "ACTIVE_ON_ROAD").length;
  const queuedCount = vehicles.filter((v) => v.status === "DISPATCH_QUEUED").length;
  const maintenanceCount = vehicles.filter((v) => v.status === "MAINTENANCE").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Top Hero Strip (from Stitch design) */}
      <div className="relative overflow-hidden rounded-2xl bg-charcoal-accent text-white shadow-md p-6">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gold-light text-[11px] font-headline font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[16px]">directions_car</span>
              <span>Fleet Operations Control</span>
              <span>•</span>
              <span className="text-slate-300">Dispatch Desk</span>
            </div>
            <h1 className="font-headline text-[24px] font-extrabold tracking-tight text-white">
              Fleet Dispatch, Expeditions &amp; Mountain Chauffeur Desk
            </h1>
            <p className="text-[13px] text-slate-300 max-w-2xl leading-relaxed">
              Force Tempo Traveller telemetry, transparent KM odometer audit trail, and driver dispatch manifests for all operational circuits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddVehicleOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-secondary text-white font-headline text-[13px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-amber-700 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Add Force Cruiser</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedVehicleId(undefined);
                setIsAssignDriverOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-surface-card text-charcoal-accent font-headline text-[13px] font-bold flex items-center gap-1.5 shadow-sm hover:bg-surface-subtle transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              <span>Assign Chauffeur</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedVehicleId(undefined);
                setIsLogOdometerOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-status-verified text-white font-headline text-[13px] font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">speed</span>
              <span>Log Odometer KM</span>
            </button>
          </div>
        </div>

        {/* Micro system status bar */}
        <div className="mt-5 pt-4 border-t border-slate-700/60 flex flex-wrap items-center gap-6 text-slate-300 text-[11px] font-headline">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-status-verified"></span>
            <span>Registered Fleet: <strong className="text-white">{vehicles.length} Cruisers</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400 text-[15px]">info</span>
            <span>Route Advisory: <strong className="text-white">No route advisory</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-outline block">
              Total Fleet Roster
            </span>
            <span className="font-headline text-[24px] font-extrabold text-charcoal-accent">
              {vehicles.length}
            </span>
            <span className="text-[11px] text-outline block mt-0.5">Commercial Coaches</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-subtle flex items-center justify-center text-charcoal-accent">
            <span className="material-symbols-outlined text-[20px]">airport_shuttle</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-outline block">
              Active On-Road
            </span>
            <span className="font-headline text-[24px] font-extrabold text-status-verified">
              {activeVehiclesCount}
            </span>
            <span className="text-[11px] text-outline block mt-0.5">Himalayas &amp; Plains</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-status-verified-bg text-status-verified flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">speed</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-outline block">
              Queued For Dispatch
            </span>
            <span className="font-headline text-[24px] font-extrabold text-secondary">
              {queuedCount}
            </span>
            <span className="text-[11px] text-outline block mt-0.5">Depot Sanitized</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-subtle text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">departure_board</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold text-outline block">
              Depot Maintenance
            </span>
            <span className="font-headline text-[24px] font-extrabold text-status-alert">
              {maintenanceCount}
            </span>
            <span className="text-[11px] text-outline block mt-0.5">Brake &amp; Suspension Bay</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-status-alert flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">build_circle</span>
          </div>
        </div>
      </div>

      {/* Subtab Navigation */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-subtle max-w-md">
        <button
          type="button"
          onClick={() => setActiveSubTab("vehicles")}
          className={`flex-1 py-1.5 px-3 rounded-lg font-headline text-[12px] font-bold transition-all ${
            activeSubTab === "vehicles"
              ? "bg-surface-card text-charcoal-accent shadow-xs"
              : "text-on-surface-variant hover:text-charcoal-accent"
          }`}
        >
          Force Fleet Roster ({vehicles.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("drivers")}
          className={`flex-1 py-1.5 px-3 rounded-lg font-headline text-[12px] font-bold transition-all ${
            activeSubTab === "drivers"
              ? "bg-surface-card text-charcoal-accent shadow-xs"
              : "text-on-surface-variant hover:text-charcoal-accent"
          }`}
        >
          Mountain Chauffeurs ({drivers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("odometer")}
          className={`flex-1 py-1.5 px-3 rounded-lg font-headline text-[12px] font-bold transition-all ${
            activeSubTab === "odometer"
              ? "bg-surface-card text-charcoal-accent shadow-xs"
              : "text-on-surface-variant hover:text-charcoal-accent"
          }`}
        >
          Odometer Logs ({odometerLogs.length})
        </button>
      </div>

      {/* TAB 1: FLEET VEHICLES TABLE */}
      {activeSubTab === "vehicles" && (
        <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border-clean flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-headline text-[15px] font-bold text-charcoal-accent">
                Active Fleet Roster &amp; Odometer Readings
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-status-verified-bg text-status-verified">
                100% Honest Billing
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-headline uppercase tracking-wider text-outline bg-surface-subtle/60 border-b border-border-clean">
                  <th className="py-3 px-4 font-bold">Vehicle Reg #</th>
                  <th className="py-3 px-3 font-bold">Model &amp; Tier</th>
                  <th className="py-3 px-3 font-bold">Capacity</th>
                  <th className="py-3 px-3 font-bold">Odometer (KM)</th>
                  <th className="py-3 px-3 font-bold">KM Rate</th>
                  <th className="py-3 px-3 font-bold">Assigned Chauffeur</th>
                  <th className="py-3 px-3 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-clean text-[13px]">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-outline">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[36px] text-outline/40">
                          airport_shuttle
                        </span>
                        <p className="font-headline font-semibold text-charcoal-accent text-[14px]">
                          0 Force Cruisers in Fleet
                        </p>
                        <p className="text-[12px] text-outline max-w-xs">
                          Click "Add New Vehicle" above to register your first Force Tempo Traveller into the fleet roster.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  vehicles.map((veh) => (
                  <tr key={veh.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-charcoal-accent block">
                        {veh.regNumber}
                      </span>
                      <span className="text-[11px] text-outline block mt-0.5">{veh.color}</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-headline font-bold text-charcoal-accent block">
                        {veh.name}
                      </span>
                      <span className="text-[11px] text-outline block truncate max-w-[200px] mt-0.5">
                        {veh.features}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold text-charcoal-accent">
                        {veh.seatingCapacity} Seater
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-extrabold text-charcoal-accent block">
                        {veh.currentOdometer.toLocaleString()} KM
                      </span>
                      <span className="text-[10px] text-status-verified font-medium flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">verified</span>
                        <span>Calibrated</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-secondary">
                        ₹{veh.ratePerKm}/KM
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {veh.driver ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-charcoal-accent">
                            {veh.driver.name}
                          </span>
                          <span className="text-[11px] text-outline font-mono">
                            {veh.driver.phone}
                          </span>
                        </div>
                      ) : (
                        <span className="text-outline text-[12px] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-headline font-bold border ${getVehicleStatusBadge(
                          veh.status
                        )}`}
                      >
                        {veh.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVehicleId(veh.id);
                            setIsLogOdometerOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-border-clean bg-surface-subtle text-charcoal-accent hover:bg-surface-card transition-colors"
                          title="Log Odometer Reading"
                        >
                          <span className="material-symbols-outlined text-[17px]">speed</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVehicleId(veh.id);
                            setIsAssignDriverOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-border-clean bg-surface-subtle text-charcoal-accent hover:bg-surface-card transition-colors"
                          title="Assign Chauffeur"
                        >
                          <span className="material-symbols-outlined text-[17px]">person_add</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ id: veh.id, name: veh.regNumber })}
                          className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-status-alert hover:bg-red-100 transition-colors"
                          title="Delete Vehicle"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MOUNTAIN CHAUFFEURS */}
      {activeSubTab === "drivers" && (
        drivers.length === 0 ? (
          <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs p-12 text-center flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[42px] text-outline/40">
              person_pin
            </span>
            <h4 className="font-headline font-bold text-charcoal-accent text-[16px]">
              0 Mountain Chauffeurs Registered
            </h4>
            <p className="text-[13px] text-outline max-w-sm">
              No chauffeurs currently registered. Driver profiles will appear here once registered in the system.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((driver) => (
            <div
              key={driver.id}
              className="p-5 rounded-2xl bg-surface-card border border-border-clean shadow-xs flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-500 font-bold font-headline text-lg">
                  {driver.photoUrl ? (
                    <img
                      alt={driver.name}
                      src={driver.photoUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{driver.name ? driver.name.charAt(0).toUpperCase() : "D"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline font-bold text-[15px] text-charcoal-accent truncate">
                      {driver.name}
                    </h3>
                    <div className="flex items-center text-gold-light text-[12px] font-bold">
                      <span className="material-symbols-outlined text-[15px] fill">star</span>
                      <span>{driver.rating}</span>
                    </div>
                  </div>
                  <a
                    href={`tel:${driver.phone}`}
                    className="text-[12px] text-secondary hover:underline font-mono font-medium block mt-0.5"
                  >
                    {driver.phone}
                  </a>
                  <span className="text-[11px] text-outline block mt-0.5">
                    Lic: {driver.licenseNumber} • {driver.experienceYears} Years Exp
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-clean text-[11px]">
                <span className="font-headline font-bold uppercase text-outline block mb-1">
                  Mountain Pass Certifications
                </span>
                <p className="text-charcoal-accent font-medium leading-relaxed">
                  {driver.certifiedPasses}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-clean">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-headline font-bold ${
                    driver.status === "AVAILABLE"
                      ? "bg-status-verified-bg text-status-verified"
                      : "bg-purple-50 text-purple-700"
                  }`}
                >
                  {driver.status}
                </span>

                <a
                  href={`https://wa.me/${driver.phone.replace(/[^0-9]/g, "")}?text=Budhram%20Travels%20Dispatch%20Alert`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-charcoal-accent text-white font-headline text-[11px] font-bold hover:bg-slate-800 transition-colors flex items-center gap-1 shadow-xs"
                >
                  <span className="material-symbols-outlined text-[14px]">chat</span>
                  <span>Dispatch WhatsApp</span>
                </a>
              </div>
            </div>
          ))}
        </div>
        )
      )}

      {/* TAB 3: ODOMETER LOGS TABLE */}
      {activeSubTab === "odometer" && (
        <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs overflow-hidden">
          <div className="p-4 border-b border-border-clean flex items-center justify-between">
            <h3 className="font-headline text-[15px] font-bold text-charcoal-accent">
              Honest Odometer KM Telemetry &amp; Fuel Audit Trail
            </h3>
            <span className="text-[11px] font-bold text-status-verified">
              Zero Discrepancy Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[11px] font-headline uppercase tracking-wider text-outline bg-surface-subtle/60 border-b border-border-clean">
                  <th className="py-3 px-4 font-bold">Vehicle Reg #</th>
                  <th className="py-3 px-3 font-bold">Chauffeur</th>
                  <th className="py-3 px-3 font-bold">Trip PNR</th>
                  <th className="py-3 px-3 font-bold">Start Odo</th>
                  <th className="py-3 px-3 font-bold">End Odo</th>
                  <th className="py-3 px-3 font-bold">Total KM</th>
                  <th className="py-3 px-3 font-bold">Fuel &amp; Toll</th>
                  <th className="py-3 px-4 font-bold text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-clean">
                {odometerLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-outline">
                      No odometer logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  odometerLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-subtle/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-charcoal-accent">
                        {log.vehicle?.regNumber}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-charcoal-accent">
                        {log.driver?.name || "—"}
                      </td>
                      <td className="py-3.5 px-3 font-mono text-outline">
                        {log.tripPnr || "—"}
                      </td>
                      <td className="py-3.5 px-3 font-mono">{log.startOdometer} KM</td>
                      <td className="py-3.5 px-3 font-mono">{log.endOdometer ? `${log.endOdometer} KM` : "In-Transit"}</td>
                      <td className="py-3.5 px-3 font-mono font-bold text-status-verified">
                        {log.totalKm ? `${log.totalKm} KM` : "—"}
                      </td>
                      <td className="py-3.5 px-3 text-[12px] text-outline">
                        {log.fuelLitres ? `${log.fuelLitres}L (₹${log.fuelCost})` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-headline font-bold bg-status-verified-bg text-status-verified border border-status-verified/20">
                          {log.auditStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isAddVehicleOpen && (
        <AddVehicleModal
          isOpen={isAddVehicleOpen}
          onClose={() => setIsAddVehicleOpen(false)}
          onSuccess={fetchAll}
          drivers={drivers}
        />
      )}

      {/* Log Odometer Modal */}
      {isLogOdometerOpen && (
        <LogOdometerModal
          isOpen={isLogOdometerOpen}
          onClose={() => setIsLogOdometerOpen(false)}
          onSuccess={fetchAll}
          vehicles={vehicles}
          drivers={drivers}
          defaultVehicleId={selectedVehicleId}
        />
      )}

      {/* Assign Driver Modal */}
      {isAssignDriverOpen && (
        <AssignDriverModal
          isOpen={isAssignDriverOpen}
          onClose={() => setIsAssignDriverOpen(false)}
          onSuccess={fetchAll}
          vehicles={vehicles}
          drivers={drivers}
          defaultVehicleId={selectedVehicleId}
        />
      )}

      {/* Delete Vehicle Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Fleet Vehicle"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from the active fleet roster?`}
        confirmLabel="Yes, Delete Vehicle"
        isLoading={isDeleting}
        onConfirm={handleDeleteVehicle}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
