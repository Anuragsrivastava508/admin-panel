"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

export function MediaGallery() {
  const { showToast } = useToast();

  const [media, setMedia] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<any | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Media Form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("EXTERIOR");
  const [url, setUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const u = new URL("/api/media", window.location.origin);
      if (selectedCategory !== "ALL") u.searchParams.set("category", selectedCategory);

      const res = await fetch(u.toString());
      if (res.ok) {
        const data = await res.json();
        setMedia(data.media || []);
      }
    } catch {
      showToast("Error", "Could not load media", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [selectedCategory]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    setIsUploading(true);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          url,
          alt: title,
          size: "1.4 MB",
          isFeatured: true,
        }),
      });

      if (!res.ok) {
        showToast("Error", "Could not save image", "error");
        setIsUploading(false);
        return;
      }

      showToast("Photo Enrolled", "Image saved to fleet showcase gallery", "success");
      setIsUploading(false);
      setIsUploadOpen(false);
      setTitle("");
      setUrl("");
      fetchMedia();
    } catch {
      showToast("Error", "Server connection issue", "error");
      setIsUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/media/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Image Deleted", `"${deleteTarget.title}" deleted`, "success");
        setDeleteTarget(null);
        fetchMedia();
      } else {
        showToast("Error", "Could not delete image", "error");
      }
    } catch {
      showToast("Error", "Server connection issue", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyUrl = (imgUrl: string) => {
    navigator.clipboard.writeText(imgUrl);
    showToast("URL Copied", "Image URL copied to clipboard", "success");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-[24px] font-extrabold text-charcoal-accent tracking-tight">
              Fleet Media &amp; Cabin Showcase Gallery
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold bg-gold-subtle text-secondary border border-gold-light/20">
              {media.length} ENROLLED ASSETS
            </span>
          </div>
          <p className="text-[13px] text-outline mt-1">
            Manage high-resolution photography of Force cruisers, mahogany cockpits, and mountain expeditions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="http://localhost:3000/#gallery"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 font-headline text-[13px] font-bold hover:bg-amber-100 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            <span>View Live Gallery</span>
          </a>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold hover:bg-slate-800 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_photo_alternate</span>
            <span>Upload Image</span>
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {["ALL", "EXTERIOR", "CABIN", "COCKPIT", "EXPEDITION"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-headline text-[12px] font-bold transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-charcoal-accent text-white shadow-xs"
                : "bg-surface-card border border-border-clean text-on-surface-variant hover:text-charcoal-accent"
            }`}
          >
            {cat === "ALL" ? "All Photos" : cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      {media.length === 0 ? (
        <div className="bg-surface-card rounded-2xl border border-border-clean p-12 text-center flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-outline text-[40px]">photo_library</span>
          <h3 className="font-headline font-bold text-charcoal-accent text-[15px]">
            No photos found in this category
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="bg-surface-card rounded-2xl border border-border-clean shadow-xs overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
            >
              <div
                className="relative h-48 w-full bg-slate-100 cursor-pointer overflow-hidden"
                onClick={() => setLightboxImage(item)}
              >
                <img
                  alt={item.title}
                  src={item.url}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-headline font-bold bg-black/60 text-white backdrop-blur-xs">
                  {item.category}
                </span>
                <span className="absolute bottom-2.5 right-2.5 p-1 rounded-lg bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                </span>
              </div>

              <div className="p-3 flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <h4 className="font-headline font-bold text-[13px] text-charcoal-accent truncate">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-outline font-mono">{item.size || "—"}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item.url)}
                    className="p-1 rounded-lg hover:bg-surface-subtle text-outline hover:text-charcoal-accent transition-colors"
                    title="Copy URL"
                  >
                    <span className="material-symbols-outlined text-[17px]">link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-1 rounded-lg hover:bg-red-50 text-outline hover:text-status-alert transition-colors"
                    title="Delete Image"
                  >
                    <span className="material-symbols-outlined text-[17px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="max-w-4xl max-h-[90vh] flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              alt={lightboxImage.title}
              src={lightboxImage.url}
              className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
            />
            <div className="text-center text-white">
              <h3 className="font-headline text-[18px] font-bold">{lightboxImage.title}</h3>
              <p className="text-[12px] text-slate-300 font-mono mt-0.5">{lightboxImage.category}</p>
            </div>
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-headline text-[12px] font-semibold"
            >
              Close Lightbox
            </button>
          </div>
        </div>
      )}

      {/* Upload Image Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-accent/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-card rounded-2xl border border-border-clean shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-clean">
              <h3 className="font-headline text-[17px] font-bold text-charcoal-accent">
                Upload Image to Showcase
              </h3>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-subtle"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 flex flex-col gap-4 text-[13px]">
              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Image Title / Caption *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cream Leatherette Pushback Suite"
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Showcase Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
                >
                  <option value="EXTERIOR">EXTERIOR (Force Fleet Cruiser)</option>
                  <option value="CABIN">CABIN (Pushback Leatherette Suite)</option>
                  <option value="COCKPIT">COCKPIT (Mahogany Dash &amp; GPS)</option>
                  <option value="EXPEDITION">EXPEDITION (Mountain Circuits)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-clean">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border-clean text-outline hover:text-charcoal-accent font-headline text-[13px] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading && (
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      progress_activity
                    </span>
                  )}
                  <span>Save Image</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Image"
        message={`Are you sure you want to remove "${deleteTarget?.title}" from the media gallery?`}
        confirmLabel="Yes, Delete Photo"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
