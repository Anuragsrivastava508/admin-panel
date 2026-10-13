"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";

export function ContactInfoEditor() {
  const { showToast } = useToast();

  const [companyName, setCompanyName] = useState("");
  const [hotline, setHotline] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [address, setAddress] = useState("");
  const [operatingHours, setOperatingHours] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await fetch("/api/content?key=contact_info");
        if (res.ok) {
          const resData = await res.json();
          if (resData.data) {
            const d = resData.data;
            if (d.companyName) setCompanyName(d.companyName);
            if (d.hotline) setHotline(d.hotline);
            if (d.alternatePhone) setAlternatePhone(d.alternatePhone);
            if (d.email) setEmail(d.email);
            if (d.whatsappNumber) setWhatsappNumber(d.whatsappNumber);
            if (d.address) setAddress(d.address);
            if (d.operatingHours) setOperatingHours(d.operatingHours);
            if (d.googleMapsUrl) setGoogleMapsUrl(d.googleMapsUrl);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchInfo();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        key: "contact_info",
        data: {
          companyName,
          hotline,
          alternatePhone,
          email,
          whatsappNumber,
          address,
          operatingHours,
          googleMapsUrl,
        },
      };

      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("Contact Info Synced", "Live headers, telephone links and WhatsApp desk updated", "success");
      } else {
        showToast("Error", "Could not save contact details", "error");
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
              Contact &amp; Business Governance
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold bg-status-verified-bg text-status-verified border border-status-verified/20">
              PUBLIC SITE SYNC
            </span>
          </div>
          <p className="text-[13px] text-outline mt-1">
            Update telephone links, WhatsApp dispatch numbers, and depot addresses displayed on budhramtravels.com.
          </p>
        </div>
      </div>

      <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs p-6 max-w-3xl">
        <form onSubmit={handleSave} className="flex flex-col gap-4 text-[13px]">
          <div>
            <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
              Registered Commercial Entity Name
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-headline font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                24/7 Desk Primary Hotline *
              </label>
              <input
                type="text"
                required
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                WhatsApp Dispatch Number *
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Official Support Email *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Alternate Fleet Desk Phone
              </label>
              <input
                type="text"
                value={alternatePhone}
                onChange={(e) => setAlternatePhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
              Fleet Hub &amp; Depot Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Operating Hours
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
              />
            </div>
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Google Maps Embed URL
              </label>
              <input
                type="url"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border-clean flex justify-end">
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
              <span>Commit &amp; Sync to Web</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
