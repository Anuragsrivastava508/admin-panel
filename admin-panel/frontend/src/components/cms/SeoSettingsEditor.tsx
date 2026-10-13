"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

export function SeoSettingsEditor() {
  const { showToast } = useToast();

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSeo = async () => {
      try {
        const res = await fetch("/api/content?key=seo_config");
        if (res.ok) {
          const resData = await res.json();
          if (resData.data) {
            const d = resData.data;
            if (d.metaTitle) setMetaTitle(d.metaTitle);
            if (d.metaDescription) setMetaDescription(d.metaDescription);
            if (d.keywords) setKeywords(d.keywords);
            if (d.canonicalUrl) setCanonicalUrl(d.canonicalUrl);
            if (d.ogImageUrl) setOgImageUrl(d.ogImageUrl);
            if (d.googleAnalyticsId) setGoogleAnalyticsId(d.googleAnalyticsId);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSeo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        key: "seo_config",
        data: {
          metaTitle,
          metaDescription,
          keywords,
          canonicalUrl,
          ogImageUrl,
          googleAnalyticsId,
        },
      };

      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("SEO Metadata Saved", "Meta tags, schema and OG graphs staged for production", "success");
      }
    } catch {
      showToast("Error", "Server connection issue", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-[24px] font-extrabold text-charcoal-accent tracking-tight">
              Marketing &amp; Search Engine Optimization (SEO)
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold bg-gold-subtle text-secondary border border-gold-light/20">
              SEARCH ENGINE SYNC
            </span>
          </div>
          <p className="text-[13px] text-outline mt-1">
            Configure Google SERP titles, rich snippets, schema breadcrumbs, and social graph cards.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-surface-card rounded-2xl border border-border-clean shadow-xs p-6">
          <form onSubmit={handleSave} className="flex flex-col gap-4 text-[13px]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-headline font-bold uppercase text-outline">
                  Page Meta Title *
                </label>
                <span className="text-[10px] text-outline">{metaTitle.length} / 70 chars</span>
              </div>
              <input
                type="text"
                required
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-medium focus:outline-none focus:bg-surface-card"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-headline font-bold uppercase text-outline">
                  Meta Description *
                </label>
                <span className="text-[10px] text-outline">{metaDescription.length} / 160 chars</span>
              </div>
              <textarea
                rows={3}
                required
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card leading-relaxed"
              ></textarea>
            </div>

            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Target SEO Keywords (Comma Separated)
              </label>
              <textarea
                rows={2}
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono text-[12px]"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={googleAnalyticsId}
                  onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                OpenGraph Share Image URL
              </label>
              <input
                type="url"
                value={ogImageUrl}
                onChange={(e) => setOgImageUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold shadow-md hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving && (
                  <span className="material-symbols-outlined text-[16px] animate-spin">
                    progress_activity
                  </span>
                )}
                <span>Save SEO Config</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live Google Search Preview (from Stitch design) */}
        <div className="lg:col-span-5 bg-surface-card rounded-2xl border border-border-clean shadow-xs p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-clean">
            <span className="font-headline font-bold text-[13px] text-charcoal-accent flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-secondary">
                preview
              </span>
              <span>Google SERP Rich Snippet Preview</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-subtle text-outline">
              GOOGLE BOT
            </span>
          </div>

          {/* Google SERP Card */}
          <div className="p-4 rounded-xl border border-border-clean bg-white flex flex-col gap-1.5 font-sans">
            <div className="flex items-center gap-2 text-[12px] text-slate-700">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                BT
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-semibold text-slate-800">Budhram Tour And Travels</span>
                <span className="text-[11px] text-slate-500 font-mono">https://budhramtravels.com</span>
              </div>
            </div>

            <h3 className="text-[#1a0dab] font-medium text-[16px] hover:underline cursor-pointer leading-snug mt-1">
              {metaTitle}
            </h3>

            <p className="text-[#4d5156] text-[13px] leading-relaxed line-clamp-3">
              {metaDescription}
            </p>

            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#006621]">
              <span>Verified Customer Reviews</span>
              <span>•</span>
              <span>Force Tempo Fleet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
