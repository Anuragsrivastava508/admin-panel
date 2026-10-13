"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PackageModal } from "./PackageModal";

export function PackagesManager() {
  const { showToast } = useToast();

  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/packages");
      if (res.ok) {
        const data = await res.json();
        setPackages(data.packages || []);
      }
    } catch {
      showToast("Error", "Could not load packages", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/packages/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Circuit Deleted", `"${deleteTarget.title}" removed`, "success");
        setDeleteTarget(null);
        fetchPackages();
      } else {
        showToast("Error", "Could not delete circuit", "error");
      }
    } catch {
      showToast("Error", "Server connection issue", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-[24px] font-extrabold text-charcoal-accent tracking-tight">
              Tour Packages &amp; Himalayan Circuits
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold bg-gold-subtle text-secondary border border-gold-light/20">
              {packages.length} ACTIVE ROUTES
            </span>
          </div>
          <p className="text-[13px] text-outline mt-1">
            Manage public website packages, distance specifications, and KM billing rates.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingPackage(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold hover:bg-slate-800 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
          <span>Add New Circuit</span>
        </button>
      </div>

      {/* Grid of Packages */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 bg-surface-card rounded-2xl border border-border-clean animate-pulse"></div>
          ))}
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-surface-card rounded-2xl border border-border-clean p-12 text-center flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-outline text-[40px]">alt_route</span>
          <h3 className="font-headline font-bold text-charcoal-accent text-[15px]">
            No tour packages found
          </h3>
          <p className="text-[13px] text-outline">
            Click "Add New Circuit" to create your first travel package.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-surface-card rounded-2xl border border-border-clean shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
            >
              <div>
                {/* Image Cover */}
                <div className="relative h-44 w-full bg-slate-100 flex items-center justify-center overflow-hidden">
                  {pkg.images ? (
                    <img
                      alt={pkg.title}
                      src={pkg.images}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                      <span className="material-symbols-outlined text-[32px]">landscape</span>
                      <span className="text-[11px] font-medium">No image uploaded</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-accent/80 via-transparent to-transparent"></div>

                  {/* Badges on cover */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {pkg.highlightBadge && (
                      <span className="px-2 py-0.5 rounded-md bg-gold-light text-charcoal-accent font-headline font-bold text-[10px] shadow-sm">
                        {pkg.highlightBadge}
                      </span>
                    )}
                    {pkg.featured && (
                      <span className="px-2 py-0.5 rounded-md bg-secondary text-white font-headline font-bold text-[10px] shadow-sm flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px] fill">star</span>
                        <span>FEATURED</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[12px]">
                    <span className="font-headline font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px]">schedule</span>
                      <span>{pkg.duration || "KM-Based Tour"}</span>
                    </span>
                    <span className="font-headline font-bold bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-status-verified">
                        speed
                      </span>
                      <span>{pkg.distanceKm ? `${pkg.distanceKm} KM` : "Odometer Metered"}</span>
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-headline text-[15px] font-bold text-charcoal-accent leading-snug">
                    {pkg.title}
                  </h3>
                  <p className="text-[12px] text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-secondary">
                      pin_drop
                    </span>
                    <span className="truncate">{pkg.destination}</span>
                  </p>
                  <p className="text-[12px] text-on-surface-variant line-clamp-2 mt-1 leading-relaxed">
                    {pkg.overview}
                  </p>
                </div>
              </div>

              {/* Footer with Pricing & Controls */}
              <div className="p-4 pt-2 border-t border-border-clean flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-outline block">
                    {pkg.basePrice > 0 ? "Starting From" : "Tariff Type"}
                  </span>
                  <span className="font-headline font-extrabold text-[16px] text-charcoal-accent">
                    {pkg.basePrice > 0 ? formatCurrency(pkg.basePrice) : (pkg.priceType || "KM-Based Fare")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPackage(pkg);
                      setIsModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-border-clean bg-surface-subtle text-charcoal-accent hover:bg-surface-card transition-colors"
                    title="Edit Circuit"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: pkg.id, title: pkg.title })}
                    className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-status-alert hover:bg-red-100 transition-colors"
                    title="Delete Circuit"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Package Modal */}
      {isModalOpen && (
        <PackageModal
          isOpen={isModalOpen}
          packageItem={editingPackage}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchPackages}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Tour Package"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? It will no longer be visible on the public website or booking desk.`}
        confirmLabel="Yes, Delete Package"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
