"use client";

import React, { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export function TestimonialsManager() {
  const { showToast } = useToast();

  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Testimonial Form
  const [customerName, setCustomerName] = useState("");
  const [location, setLocation] = useState("");
  const [circuit, setCircuit] = useState("");
  const [rating, setRating] = useState("5");
  const [vehicleUsed, setVehicleUsed] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || []);
      }
    } catch {
      showToast("Error", "Could not load testimonials", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleToggleStatus = async (item: any) => {
    const nextStatus = item.status === "APPROVED" ? "HIDDEN" : "APPROVED";
    try {
      const res = await fetch(`/api/testimonials/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        showToast("Status Updated", `Review marked as ${nextStatus}`, "success");
        fetchTestimonials();
      }
    } catch {
      showToast("Error", "Could not update status", "error");
    }
  };

  const handleToggleFeatured = async (item: any) => {
    try {
      const res = await fetch(`/api/testimonials/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !item.featured }),
      });
      if (res.ok) {
        showToast("Featured Updated", `Review featured status toggled`, "success");
        fetchTestimonials();
      }
    } catch {
      showToast("Error", "Could not update featured status", "error");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !content) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          location,
          circuit,
          rating: Number(rating),
          vehicleUsed,
          content,
          featured: true,
          status: "APPROVED",
        }),
      });

      if (!res.ok) {
        showToast("Error", "Could not save review", "error");
        setIsSubmitting(false);
        return;
      }

      showToast("Review Added", "Testimonial published to public website", "success");
      setIsSubmitting(false);
      setIsAddOpen(false);
      setCustomerName("");
      setContent("");
      fetchTestimonials();
    } catch {
      showToast("Error", "Server connection issue", "error");
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/testimonials/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Review Deleted", "Testimonial removed", "success");
        setDeleteTarget(null);
        fetchTestimonials();
      } else {
        showToast("Error", "Could not delete review", "error");
      }
    } catch {
      showToast("Error", "Server connection issue", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const avgRating =
    testimonials.length > 0
      ? (
          testimonials.reduce((sum, t) => sum + (t.rating || 0), 0) / testimonials.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-[24px] font-extrabold text-charcoal-accent tracking-tight">
              Guest Reviews &amp; Testimonials
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold bg-gold-subtle text-secondary border border-gold-light/20">
              {testimonials.length > 0 ? `${avgRating}★ RATING • ` : ""}
              {testimonials.length} REVIEWS
            </span>
          </div>
          <p className="text-[13px] text-outline mt-1">
            Approve, manage and highlight customer testimonials displayed on budhramtravels.com.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://localhost:3000/#reviews"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-headline text-[13px] font-bold hover:bg-amber-100 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            <span>View Live Reviews</span>
          </a>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold hover:bg-slate-800 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_comment</span>
            <span>Add Review</span>
          </button>
        </div>
      </div>

      {/* Testimonials List or Empty State */}
      {testimonials.length === 0 ? (
        <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs p-12 text-center flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[42px] text-outline/40">
            rate_review
          </span>
          <h4 className="font-headline font-bold text-charcoal-accent text-[16px]">
            No reviews available
          </h4>
          <p className="text-[13px] text-outline max-w-sm">
            Customer reviews submitted on budhramtravels.com will appear here, or you can record testimonials manually using "Add Review".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="p-5 rounded-2xl bg-surface-card border border-border-clean shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-headline font-bold text-[15px] text-charcoal-accent">
                    {t.customerName}
                  </h3>
                  <span className="text-[11px] text-outline block mt-0.5">
                    {t.location} • {formatDate(t.reviewDate)}
                  </span>
                </div>
                <div className="flex text-gold-light shrink-0">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[16px] fill">
                      star
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-2 text-[11px] text-secondary font-medium">
                Circuit: {t.circuit}
              </div>

              <p className="mt-2 text-[13px] text-on-surface-variant leading-relaxed">
                "{t.content}"
              </p>

              {t.vehicleUsed && (
                <div className="mt-2 text-[11px] text-outline flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">airport_shuttle</span>
                  <span>{t.vehicleUsed}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border-clean flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(t)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-headline font-bold border ${
                    t.status === "APPROVED"
                      ? "bg-status-verified-bg text-status-verified border-status-verified/20"
                      : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {t.status}
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(t)}
                  className={`p-1 rounded hover:bg-surface-subtle transition-colors ${
                    t.featured ? "text-gold-light" : "text-slate-300"
                  }`}
                  title={t.featured ? "Featured on Homepage" : "Click to Feature"}
                >
                  <span className="material-symbols-outlined text-[18px] fill">star</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setDeleteTarget(t)}
                className="p-1 rounded-lg text-outline hover:text-status-alert hover:bg-red-50 transition-colors"
                title="Delete Testimonial"
              >
                <span className="material-symbols-outlined text-[17px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Add Review Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-accent/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-card rounded-2xl border border-border-clean shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-clean">
              <h3 className="font-headline text-[17px] font-bold text-charcoal-accent">
                Add Customer Review
              </h3>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-subtle"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 flex flex-col gap-4 text-[13px]">
              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Kunal Malhotra"
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                    Rating (Stars)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-bold text-gold-light"
                  >
                    <option value="5">★★★★★ 5 Stars</option>
                    <option value="4">★★★★☆ 4 Stars</option>
                    <option value="3">★★★☆☆ 3 Stars</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Travel Circuit
                </label>
                <input
                  type="text"
                  value={circuit}
                  onChange={(e) => setCircuit(e.target.value)}
                  placeholder="e.g. Delhi to Manali - Atal Tunnel"
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Review Text *
                </label>
                <textarea
                  rows={3}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Share feedback on pushback comfort, mountain driver skill, and honest KM billing..."
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-clean">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border-clean text-outline hover:text-charcoal-accent font-headline text-[13px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && (
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                  )}
                  <span>Publish Review</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Testimonial"
        message={`Are you sure you want to remove the review from "${deleteTarget?.customerName}"?`}
        confirmLabel="Yes, Delete Review"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
