"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

interface ModuleItem {
  id: number;
  name: string;
  active: boolean;
  order: number;
}

export function DynamicContentManager() {
  const { showToast } = useToast();

  const [modules, setModules] = useState<ModuleItem[]>([
    { id: 1, name: "Top Announcement Bar", active: true, order: 1 },
    { id: 2, name: "Main Navigation & Logo", active: true, order: 2 },
    { id: 3, name: "Hero Slider & KM CTA", active: true, order: 3 },
    { id: 4, name: "KM Distance Fare Calculator", active: true, order: 4 },
    { id: 5, name: "Budhram Trust Standards Bento", active: true, order: 5 },
    { id: 6, name: "Force Tempo Fleet Showcase (12S & 17S)", active: true, order: 6 },
    { id: 7, name: "Cabin Showcase & Cockpit Gallery", active: true, order: 7 },
    { id: 8, name: "Himalayan & All-India Circuits", active: true, order: 8 },
    { id: 9, name: "4-Step Booking Roadmap", active: true, order: 9 },
    { id: 10, name: "Mountain Chauffeur Safety Protocol", active: true, order: 10 },
    { id: 11, name: "Guest Reviews & Google Testimonials", active: true, order: 11 },
    { id: 12, name: "24/7 Dispatch Desk & Footer", active: true, order: 12 },
  ]);

  const [activeModuleId, setActiveModuleId] = useState<number>(3);
  const [showSplitPreview, setShowSplitPreview] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  // Editable Hero Content
  const [headline, setHeadline] = useState("");
  const [subheadline, setSubheadline] = useState("");
  const [tagline, setTagline] = useState("");
  const [badge, setBadge] = useState("");
  const [hotline, setHotline] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Fetch from database on mount
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("/api/content?key=homepage_config");
        if (res.ok) {
          const resData = await res.json();
          if (resData.data) {
            const d = resData.data;
            if (d.hero?.headline) setHeadline(d.hero.headline);
            if (d.hero?.subheadline) setSubheadline(d.hero.subheadline);
            if (d.hero?.tagline) setTagline(d.hero.tagline);
            if (d.hero?.badge) setBadge(d.hero.badge);
            if (d.contactInfo?.hotline) setHotline(d.contactInfo.hotline);
            if (d.contactInfo?.whatsappNumber) setWhatsapp(d.contactInfo.whatsappNumber);
            if (d.contactInfo?.email) setEmail(d.contactInfo.email);
            if (d.contactInfo?.address) setAddress(d.contactInfo.address);
            if (d.modules && Array.isArray(d.modules)) setModules(d.modules);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchContent();
  }, []);

  const handleToggleModule = (id: number) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, active: !m.active } : m))
    );
  };

  const handleMoveModule = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= modules.length) return;

    const copy = [...modules];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setModules(copy);
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const payload = {
        key: "homepage_config",
        data: {
          hero: {
            headline,
            subheadline,
            tagline,
            badge,
            primaryCtaText: "Instant KM Quotation",
            primaryCtaLink: hotline ? "tel:" + hotline : "",
            whatsappCtaText: "WhatsApp Dispatch",
            whatsappCtaLink: whatsapp ? `https://wa.me/${whatsapp}?text=Hello%20Budhram%20Tour%20And%20Travels` : "",
          },
          contactInfo: {
            hotline,
            email,
            whatsappNumber: whatsapp,
            address,
          },
          modules,
        },
      };

      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Also trigger CDN edge sync
      await fetch("/api/content/sync", { method: "POST" });

      if (res.ok) {
        showToast("Published to Edge", "Website CMS schema synced across 12 CDN edge nodes", "success");
      }
    } catch {
      showToast("Error", "Could not publish content", "error");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top CMS Controller Header (from Stitch design) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-border-clean">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-status-verified-bg text-status-verified font-headline text-[11px] font-bold flex items-center gap-1 border border-status-verified/20">
              <span className="w-1.5 h-1.5 rounded-full bg-status-verified animate-pulse"></span>
              <span>LIVE CMS SYNC: ACTIVE</span>
            </span>
            <span className="text-[12px] text-outline">
              Host: <strong className="text-charcoal-accent font-semibold">budhramtravels.com</strong>
            </span>
            <span className="w-1 h-1 rounded-full bg-border-strong"></span>
            <span className="text-[12px] text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-secondary">
                verified_user
              </span>
              <span>Published by Deepanshu Prajapati</span>
            </span>
          </div>
          <h1 className="font-headline text-[24px] text-charcoal-accent font-extrabold tracking-tight">
            Website CMS &amp; Live Dynamic Section Controller
          </h1>
          <p className="text-[13px] text-outline">
            Direct production schema editor for all 12 modules of Budhram Tour And Travels public portal.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setShowSplitPreview(!showSplitPreview)}
            className="px-3.5 py-2 rounded-xl bg-surface-card border border-border-clean text-charcoal-accent hover:bg-surface-subtle font-headline text-[13px] font-semibold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">
              {showSplitPreview ? "splitscreen_left" : "splitscreen"}
            </span>
            <span>{showSplitPreview ? "Hide Preview" : "Split Preview"}</span>
          </button>
          <a
            href="https://budhramtravels.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-surface-card border border-border-clean text-charcoal-accent hover:bg-surface-subtle font-headline text-[13px] font-semibold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            <span>Visit Live Site</span>
          </a>
          <button
            type="button"
            disabled={isPublishing}
            onClick={handlePublish}
            className="px-5 py-2 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold shadow-md hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <span
              className={`material-symbols-outlined text-[18px] text-gold-light ${
                isPublishing ? "animate-spin" : ""
              }`}
            >
              {isPublishing ? "sync" : "cloud_upload"}
            </span>
            <span>{isPublishing ? "Deploying..." : "Publish to Production"}</span>
          </button>
        </div>
      </div>

      {/* Operational Stat Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-headline uppercase text-outline font-bold">
              Configured Modules
            </span>
            <span className="font-headline text-[22px] font-extrabold text-charcoal-accent">
              {modules.filter((m) => m.active).length} / {modules.length} Active
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-status-verified-bg text-status-verified flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">toggle_on</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-headline uppercase text-outline font-bold">
              KM Rate Matrix
            </span>
            <span className="font-headline text-[20px] font-extrabold text-charcoal-accent">
              ₹24 - ₹34 <span className="text-[12px] text-outline font-normal">/ KM</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-subtle text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">speed</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-headline uppercase text-outline font-bold">
              24/7 Desk Sync
            </span>
            <span className="font-headline text-[15px] font-bold text-charcoal-accent truncate">
              {hotline}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-subtle text-charcoal-accent flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">headset_mic</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-headline uppercase text-outline font-bold">
              CDN Edge Nodes
            </span>
            <span className="font-headline text-[22px] font-extrabold text-status-verified">
              100% Synced
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-status-verified-bg text-status-verified flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">dns</span>
          </div>
        </div>
      </div>

      {/* Main Workspace: Left Module Hierarchy (4 cols) + Right Active Editor & Split Preview (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Module Schema Reordering */}
        <div className="lg:col-span-4 bg-surface-card rounded-2xl border border-border-clean shadow-xs p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-border-clean">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-charcoal-accent">
                reorder
              </span>
              <h3 className="font-headline text-[15px] font-bold text-charcoal-accent">
                Page Schema &amp; Modules
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-subtle text-outline">
              12 Modules
            </span>
          </div>
          <p className="text-[12px] text-outline">
            Click any module to configure its parameters. Toggle visibility to mount or unmount from public web.
          </p>

          <div className="flex flex-col gap-2">
            {modules.map((m, idx) => (
              <div
                key={m.id}
                onClick={() => setActiveModuleId(m.id)}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  activeModuleId === m.id
                    ? "bg-charcoal-accent text-white border-charcoal-accent shadow-xs"
                    : "bg-surface-subtle border-border-clean text-on-surface hover:bg-slate-200/50"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full text-[11px] font-headline font-bold flex items-center justify-center shrink-0 ${
                      activeModuleId === m.id
                        ? "bg-gold-light text-charcoal-accent"
                        : "bg-white text-charcoal-accent border border-border-clean"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="font-headline text-[12px] font-semibold truncate">
                    {m.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveModule(idx, "up")}
                    className="p-1 rounded hover:bg-black/10 disabled:opacity-30"
                    title="Move Up"
                  >
                    <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    disabled={idx === modules.length - 1}
                    onClick={() => handleMoveModule(idx, "down")}
                    className="p-1 rounded hover:bg-black/10 disabled:opacity-30"
                    title="Move Down"
                  >
                    <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleModule(m.id)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      m.active ? "bg-status-verified" : "bg-slate-400"
                    }`}
                    title={m.active ? "Enabled on Public Site" : "Hidden from Public Site"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Module Parameters Editor & Split Preview */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Active Module Editor Form */}
          <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-clean">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-secondary">
                  edit_note
                </span>
                <h3 className="font-headline text-[16px] font-bold text-charcoal-accent">
                  Module Configuration: {modules.find((m) => m.id === activeModuleId)?.name}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-status-verified">
                Changes Staged for Edge
              </span>
            </div>

            {/* Inputs for Hero / Headline / Hotlines */}
            <div className="flex flex-col gap-4 text-[13px]">
              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Hero Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-headline font-bold text-[15px] focus:outline-none focus:bg-surface-card"
                />
              </div>

              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Hero Subheadline
                </label>
                <input
                  type="text"
                  value={subheadline}
                  onChange={(e) => setSubheadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card"
                />
              </div>

              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Hero Brand Overview / Tagline
                </label>
                <textarea
                  rows={3}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface focus:outline-none focus:bg-surface-card leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                    24/7 Hotline Desk #
                  </label>
                  <input
                    type="text"
                    value={hotline}
                    onChange={(e) => setHotline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                    WhatsApp Dispatch #
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handlePublish}
                  className="px-5 py-2 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold shadow-md hover:bg-slate-800 transition-colors"
                >
                  Save &amp; Invalidate Edge Cache
                </button>
              </div>
            </div>
          </div>

          {/* Split Preview (Live View of Public Hero Section) */}
          {showSplitPreview && (
            <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-border-clean">
                <span className="font-headline font-bold text-[13px] text-charcoal-accent flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    visibility
                  </span>
                  <span>Live Render Preview: budhramtravels.com</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-status-verified-bg text-status-verified">
                  REAL-TIME PREVIEW
                </span>
              </div>

              {/* Public Hero Live Preview */}
              <div className="p-6 rounded-xl bg-charcoal-accent text-white flex flex-col gap-4 relative overflow-hidden">
                {badge && (
                  <div className="flex items-center gap-2 text-gold-light text-[11px] font-headline font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[15px]">explore</span>
                    <span>{badge}</span>
                  </div>
                )}
                <h2 className="font-headline text-[22px] font-extrabold text-white leading-tight">
                  {headline}
                </h2>
                <p className="text-[13px] font-medium text-gold-light">
                  {subheadline}
                </p>
                <p className="text-[12px] text-slate-300 leading-relaxed max-w-xl">
                  {tagline}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={`tel:${hotline}`}
                    className="px-4 py-2 rounded-xl bg-secondary text-white font-headline text-[12px] font-bold shadow-sm"
                  >
                    Instant KM Quotation
                  </a>
                  <a
                    href={`https://wa.me/${whatsapp}`}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-headline text-[12px] font-bold backdrop-blur-xs flex items-center gap-1.5 border border-white/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">chat</span>
                    <span>WhatsApp Dispatch</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
