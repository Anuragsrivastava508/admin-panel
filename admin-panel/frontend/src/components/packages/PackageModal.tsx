"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

interface PackageModalProps {
  isOpen: boolean;
  packageItem: any | null; // null for add, object for edit
  onClose: () => void;
  onSuccess: () => void;
}

export function PackageModal({
  isOpen,
  packageItem,
  onClose,
  onSuccess,
}: PackageModalProps) {
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [priceType, setPriceType] = useState("PER_KM_METER");
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState("ACTIVE");
  const [overview, setOverview] = useState("");
  const [includedServices, setIncludedServices] = useState("");
  const [excludedServices, setExcludedServices] = useState("");
  const [images, setImages] = useState("");
  const [highlightBadge, setHighlightBadge] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (packageItem) {
      setTitle(packageItem.title || "");
      setDestination(packageItem.destination || "");
      setDuration(packageItem.duration || "");
      setDistanceKm(packageItem.distanceKm ? String(packageItem.distanceKm) : "");
      setBasePrice(packageItem.basePrice ? String(packageItem.basePrice) : "");
      setPriceType(packageItem.priceType || "PER_KM_METER");
      setFeatured(Boolean(packageItem.featured));
      setStatus(packageItem.status || "ACTIVE");
      setOverview(packageItem.overview || "");
      setIncludedServices(packageItem.includedServices || "");
      setExcludedServices(packageItem.excludedServices || "");
      setImages(packageItem.images || "");
      setHighlightBadge(packageItem.highlightBadge || "");
    } else {
      setTitle("");
      setDestination("");
      setDuration("");
      setDistanceKm("");
      setBasePrice("0");
      setPriceType("KM-Based Fare");
      setFeatured(false);
      setStatus("ACTIVE");
      setOverview("");
      setIncludedServices("");
      setExcludedServices("");
      setImages("");
      setHighlightBadge("");
    }
  }, [packageItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      title: title.trim(),
      destination: destination.trim(),
      duration: duration?.trim() || null,
      distanceKm: distanceKm !== "" && !isNaN(Number(distanceKm)) ? Number(distanceKm) : null,
      basePrice: basePrice !== "" && !isNaN(Number(basePrice)) ? Number(basePrice) : 0,
      priceType: priceType || "KM-Based Fare",
      featured,
      status,
      overview: overview?.trim() || null,
      includedServices: includedServices?.trim() || null,
      excludedServices: excludedServices?.trim() || null,
      images: images?.trim() || null,
      highlightBadge: highlightBadge?.trim() || null,
    };

    try {
      const url = packageItem ? `/api/packages/${packageItem.id}` : "/api/packages";
      const method = packageItem ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        showToast("Error", "Could not save package", "error");
        setIsLoading(false);
        return;
      }

      showToast("Success", packageItem ? "Circuit updated successfully" : "New circuit created", "success");
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
      <div className="bg-surface-card rounded-2xl border border-border-clean shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border-clean">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-subtle text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">alt_route</span>
            </div>
            <div>
              <h3 className="font-headline text-[18px] font-bold text-charcoal-accent">
                {packageItem ? "Edit Tour Circuit" : "Add New Tour Circuit"}
              </h3>
              <p className="text-[12px] text-outline">
                Configure package pricing, distance and inclusions for web publishing
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
              Package Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Delhi NCR → Manali & Atal Tunnel Expedition"
              className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Destination Circuit *
              </label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Manali, Solang, Sissu, Kasol"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Duration (Optional)
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 5 Days / 4 Nights or KM-Based"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Distance (KM) (Optional)
              </label>
              <input
                type="number"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="e.g. 1100"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Base Fare (₹)
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="0 for KM Meter"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DRAFT">DRAFT</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Highlight Badge (Optional)
              </label>
              <input
                type="text"
                value={highlightBadge}
                onChange={(e) => setHighlightBadge(e.target.value)}
                placeholder="e.g. Most Booked Himalayan Route"
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                value={images}
                onChange={(e) => setImages(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
              Overview Description
            </label>
            <textarea
              rows={3}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              placeholder="Describe the route highlights, road conditions, and panoramic stops..."
              className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Included Services
              </label>
              <textarea
                rows={2}
                value={includedServices}
                onChange={(e) => setIncludedServices(e.target.value)}
                placeholder="Pushback cruiser, driver allowance, fuel, state border permits..."
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              ></textarea>
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Excluded Services
              </label>
              <textarea
                rows={2}
                value={excludedServices}
                onChange={(e) => setExcludedServices(e.target.value)}
                placeholder="Hotel booking, personal meals, snow permits, entry fees..."
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
              ></textarea>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="rounded text-charcoal-accent"
            />
            <label htmlFor="featured" className="text-[13px] font-semibold text-charcoal-accent cursor-pointer">
              Mark as Featured Circuit on Homepage
            </label>
          </div>

          {/* Submit */}
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
              <span>{packageItem ? "Save Changes" : "Publish Circuit"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
