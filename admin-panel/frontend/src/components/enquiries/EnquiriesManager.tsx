"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { ManualBookingModal } from "@/components/bookings/ManualBookingModal";

export function EnquiriesManager() {
  const { showToast } = useToast();

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals & Active Lead Details
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [activeNotes, setActiveNotes] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isRetryingWhatsApp, setIsRetryingWhatsApp] = useState(false);

  // Convert to Booking Modal
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [conversionLead, setConversionLead] = useState<any | null>(null);

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // References for live auto-polling & notification triggers
  const knownIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialLoadRef = React.useRef(true);

  const fetchEnquiries = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const url = new URL("/api/inquiries", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (statusFilter !== "ALL") url.searchParams.set("status", statusFilter);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        const incoming: any[] = data.inquiries || data.enquiries || data.leads || [];

        // Check for new inquiries arriving during auto-polling
        if (!isInitialLoadRef.current && incoming.length > 0) {
          const freshInquiries = incoming.filter(
            (item) => !knownIdsRef.current.has(item.id)
          );
          if (freshInquiries.length > 0) {
            const newest = freshInquiries[0];
            showToast(
              "🔔 New Website Inquiry",
              `Customer: ${newest.name}\nPhone: ${newest.phone}\nRoute: ${newest.pickupLocation || "Delhi NCR"} → ${newest.destinationCircuit || newest.subject || "Destination"}\nTravel Date: ${newest.travelDate ? formatDate(newest.travelDate) : "Flexible"}\nNew inquiry received.`,
              "info"
            );
          }
        }

        // Update known IDs
        knownIdsRef.current = new Set(incoming.map((item) => item.id));
        isInitialLoadRef.current = false;
        setEnquiries(incoming);
      }
    } catch {
      if (!silent) {
        showToast("Error", "Could not load enquiries list", "error");
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchFleetAndDrivers = async () => {
    try {
      const [vRes, dRes] = await Promise.all([fetch("/api/vehicles"), fetch("/api/drivers")]);
      if (vRes.ok) {
        const vData = await vRes.json();
        setVehicles(vData.vehicles || []);
      }
      if (dRes.ok) {
        const dData = await dRes.json();
        setDrivers(dData.drivers || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    fetchFleetAndDrivers();

    // Auto-polling every 12 seconds for real-time CRM updates
    const interval = setInterval(() => {
      fetchEnquiries(true);
    }, 12000);

    return () => clearInterval(interval);
  }, [search, statusFilter]);

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast("Status Updated", `Lead status changed to ${newStatus}`, "success");
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
        }
        fetchEnquiries();
      } else {
        showToast("Error", "Failed to update lead status", "error");
      }
    } catch {
      showToast("Error", "Server connection issue", "error");
    }
  };

  // Retry WhatsApp Alert
  const handleRetryWhatsApp = async (id: string) => {
    setIsRetryingWhatsApp(true);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retryWhatsApp: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const status = data.inquiry?.whatsappStatus || "SENT";
        if (status === "SENT") {
          showToast("WhatsApp Alert Sent", "Admin notified via WhatsApp", "success");
        } else {
          showToast("WhatsApp Attempted", "Meta credentials unconfigured - check .env", "info");
        }
        if (selectedEnquiry && selectedEnquiry.id === id) {
          setSelectedEnquiry(data.inquiry);
        }
        fetchEnquiries();
      } else {
        showToast("Error", data.error || "Failed to trigger WhatsApp", "error");
      }
    } catch {
      showToast("Error", "Server connection error", "error");
    } finally {
      setIsRetryingWhatsApp(false);
    }
  };

  // Save Internal Notes
  const handleSaveNotes = async () => {
    if (!selectedEnquiry) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/inquiries/${selectedEnquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internalNotes: activeNotes }),
      });
      if (res.ok) {
        showToast("Notes Saved", "Internal dispatch note saved to database", "success");
        setIsNotesModalOpen(false);
        if (selectedEnquiry) {
          setSelectedEnquiry({ ...selectedEnquiry, internalNotes: activeNotes });
        }
        fetchEnquiries();
      } else {
        showToast("Error", "Failed to save internal notes", "error");
      }
    } catch {
      showToast("Error", "Server connection issue", "error");
    } finally {
      setIsSavingNotes(false);
    }
  };

  // Delete Enquiry
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/inquiries/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Lead Deleted", `Enquiry for ${deleteTarget.name} removed`, "success");
        setDeleteTarget(null);
        if (selectedEnquiry && selectedEnquiry.id === deleteTarget.id) {
          setIsDetailModalOpen(false);
          setSelectedEnquiry(null);
        }
        fetchEnquiries();
      } else {
        showToast("Error", "Failed to delete lead", "error");
      }
    } catch {
      showToast("Error", "Server connection issue", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Launch WhatsApp Chat with Customer
  const handleLaunchWhatsApp = (enquiry: any) => {
    const cleanPhone = (enquiry.phone || "").replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const destination = enquiry.destinationCircuit || enquiry.subject || "Tour Package";
    const text = encodeURIComponent(
      `*Namaste ${enquiry.name || "Guest"} ji!* 🙏\n\nGreetings from *Budhram Tour & Travels*.\n\nThank you for reaching out regarding *${destination}*.\n\n*Your Inquiry Summary:*\n• Reference: ${enquiry.id}\n• Destination: ${destination}\n• Travel Date: ${enquiry.travelDate ? formatDate(enquiry.travelDate) : "Flexible"}\n• Passengers: ${enquiry.passengers || "Group"}\n• Estimated Rate: ${enquiry.estimatedFare ? `₹${Number(enquiry.estimatedFare).toLocaleString("en-IN")}` : "As per kilometre basis"}\n\nOur travel specialist is ready to assist you. When is a convenient time to discuss your route?\n\n*Budhram Tour & Travels*\nHotline: +91 9310847853`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${text}`, "_blank");
    if (enquiry.status === "NEW") {
      handleUpdateStatus(enquiry.id, "CONTACTED");
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (enquiries.length === 0) return;
    const headers = [
      "Inquiry ID",
      "Name",
      "Phone",
      "Email",
      "Subject / Service",
      "Pickup",
      "Destination",
      "Travel Date",
      "Vehicle Choice",
      "Passengers",
      "Estimated Fare",
      "Source",
      "CRM Status",
      "WhatsApp Status",
      "Pipeline Status",
      "Notes",
      "Created At",
    ];
    const rows = enquiries.map((e) => [
      `"${e.id || ""}"`,
      `"${e.name || ""}"`,
      `"${e.phone || ""}"`,
      `"${e.email || ""}"`,
      `"${(e.subject || "").replace(/"/g, '""')}"`,
      `"${e.pickupLocation || ""}"`,
      `"${e.destinationCircuit || ""}"`,
      e.travelDate ? formatDate(e.travelDate) : "",
      `"${e.vehicleChoice || ""}"`,
      `"${e.passengers || ""}"`,
      e.estimatedFare || "",
      `"${e.source || "website"}"`,
      `"${e.crmStatus || "SUCCESS"}"`,
      `"${e.whatsappStatus || "PENDING"}"`,
      e.status,
      `"${(e.internalNotes || e.message || "").replace(/"/g, '""')}"`,
      formatDate(e.createdAt),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Budhram_Inquiries_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Export Complete", "Inquiries roster downloaded as CSV", "success");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-gold-subtle text-secondary border-gold-light/40 font-bold";
      case "CONTACTED":
        return "bg-purple-50 text-purple-700 border-purple-200 font-semibold";
      case "FOLLOW_UP":
        return "bg-amber-50 text-amber-700 border-amber-200 font-semibold";
      case "CONVERTED":
        return "bg-emerald-50 text-emerald-800 border-emerald-200 font-bold";
      case "CLOSED":
      case "RESOLVED":
        return "bg-slate-100 text-slate-700 border-slate-200 font-semibold";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200 font-semibold";
      case "QUOTE_SENT":
        return "bg-blue-50 text-blue-700 border-blue-200 font-semibold";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  // Pipeline Counts
  const totalLeads = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === "NEW").length;
  const contactedCount = enquiries.filter((e) => e.status === "CONTACTED").length;
  const followUpCount = enquiries.filter((e) => e.status === "FOLLOW_UP").length;
  const convertedCount = enquiries.filter((e) => e.status === "CONVERTED").length;
  const closedCount = enquiries.filter(
    (e) => e.status === "CLOSED" || e.status === "CANCELLED" || e.status === "RESOLVED"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Pipeline Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-[24px] font-extrabold text-charcoal-accent tracking-tight">
              Website Inquiries &amp; Customer CRM
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold bg-gold-subtle text-secondary border border-gold-light/30">
              {newCount} NEW INQUIRIES
            </span>
          </div>
          <p className="text-[13px] text-outline mt-1">
            Incoming inquiries from budhramtravels.com are saved here instantly with automated WhatsApp admin alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={enquiries.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-card border border-border-clean text-[13px] font-headline font-semibold text-charcoal-accent hover:bg-surface-subtle transition-all disabled:opacity-50 shadow-xs"
          >
            <span className="material-symbols-outlined text-[17px]">download</span>
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => fetchEnquiries()}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-surface-subtle border border-border-clean text-[13px] font-headline font-semibold text-charcoal-accent hover:bg-white transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[17px]">refresh</span>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Pipeline Status Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            statusFilter === "ALL"
              ? "bg-charcoal-accent text-white border-charcoal-accent shadow-xs"
              : "bg-surface-card text-charcoal-accent border-border-clean hover:bg-surface-subtle"
          }`}
        >
          <div className="text-[11px] font-headline font-bold uppercase tracking-wider opacity-75">
            Total Inquiries
          </div>
          <div className="font-headline text-[22px] font-extrabold mt-1">{totalLeads}</div>
        </div>

        <div
          onClick={() => setStatusFilter("NEW")}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            statusFilter === "NEW"
              ? "bg-secondary text-white border-secondary shadow-xs"
              : "bg-surface-card text-charcoal-accent border-border-clean hover:bg-surface-subtle"
          }`}
        >
          <div className="text-[11px] font-headline font-bold uppercase tracking-wider text-secondary flex items-center justify-between">
            <span>New (Unread)</span>
            {newCount > 0 && <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>}
          </div>
          <div className="font-headline text-[22px] font-extrabold mt-1">{newCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter("CONTACTED")}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            statusFilter === "CONTACTED"
              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
              : "bg-surface-card text-charcoal-accent border-border-clean hover:bg-surface-subtle"
          }`}
        >
          <div className="text-[11px] font-headline font-bold uppercase tracking-wider text-purple-600">
            Contacted
          </div>
          <div className="font-headline text-[22px] font-extrabold mt-1">{contactedCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter("FOLLOW_UP")}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            statusFilter === "FOLLOW_UP"
              ? "bg-amber-600 text-white border-amber-600 shadow-xs"
              : "bg-surface-card text-charcoal-accent border-border-clean hover:bg-surface-subtle"
          }`}
        >
          <div className="text-[11px] font-headline font-bold uppercase tracking-wider text-amber-600">
            Follow Up
          </div>
          <div className="font-headline text-[22px] font-extrabold mt-1">{followUpCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter("CONVERTED")}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            statusFilter === "CONVERTED"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
              : "bg-surface-card text-charcoal-accent border-border-clean hover:bg-surface-subtle"
          }`}
        >
          <div className="text-[11px] font-headline font-bold uppercase tracking-wider text-emerald-600">
            Converted PNRs
          </div>
          <div className="font-headline text-[22px] font-extrabold mt-1">{convertedCount}</div>
        </div>

        <div
          onClick={() => setStatusFilter("CLOSED")}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
            statusFilter === "CLOSED"
              ? "bg-slate-700 text-white border-slate-700 shadow-xs"
              : "bg-surface-card text-charcoal-accent border-border-clean hover:bg-surface-subtle"
          }`}
        >
          <div className="text-[11px] font-headline font-bold uppercase tracking-wider text-slate-600">
            Closed / Cancelled
          </div>
          <div className="font-headline text-[22px] font-extrabold mt-1">{closedCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-card rounded-2xl border border-border-clean p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search by customer, phone, email, subject, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-[13px] rounded-xl border border-border-clean bg-surface-subtle focus:bg-white focus:outline-none focus:ring-1 focus:ring-charcoal-accent text-charcoal-accent transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-charcoal-accent text-[16px]"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-[12px] font-headline font-bold text-outline whitespace-nowrap">
            Pipeline Stage:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-[13px] border border-border-clean bg-surface-card text-charcoal-accent font-medium focus:outline-none focus:ring-1 focus:ring-charcoal-accent"
          >
            <option value="ALL">All Inquiries</option>
            <option value="NEW">New (Unread)</option>
            <option value="CONTACTED">Contacted</option>
            <option value="FOLLOW_UP">Follow Up</option>
            <option value="CONVERTED">Converted to Booking</option>
            <option value="CLOSED">Closed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="QUOTE_SENT">Quote Sent</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : enquiries.length === 0 ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[48px] text-outline/50 mb-2">
              inbox
            </span>
            <h4 className="font-headline text-[16px] font-bold text-charcoal-accent">
              No inquiries found
            </h4>
            <p className="text-[13px] text-outline mt-1 max-w-sm mx-auto">
              {search || statusFilter !== "ALL"
                ? "No inquiries match your current filter criteria."
                : "New incoming customer inquiries from the website will appear here in real-time."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1300px]">
              <thead>
                <tr className="border-b border-border-clean bg-surface-subtle/50 text-[11px] font-headline font-bold uppercase tracking-wider text-outline whitespace-nowrap">
                  <th className="py-3 px-3">Inquiry ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-3">Pickup</th>
                  <th className="py-3 px-3">Destination</th>
                  <th className="py-3 px-3">Travel Date</th>
                  <th className="py-3 px-3">Passengers</th>
                  <th className="py-3 px-3">Vehicle</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">WhatsApp Status</th>
                  <th className="py-3 px-3">Created At</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-clean text-[13px]">
                {enquiries.map((enquiry) => {
                  const cleanPhone = (enquiry.phone || "").replace(/\D/g, "");
                  const formattedPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
                  const isNew = enquiry.status === "NEW";

                  return (
                    <tr
                      key={enquiry.id}
                      className={`hover:bg-surface-subtle/60 transition-colors ${
                        isNew ? "bg-amber-50/20" : ""
                      }`}
                    >
                      {/* 1. Inquiry ID */}
                      <td className="py-3 px-3 font-mono text-[11px] font-semibold text-charcoal-accent whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-surface-subtle border border-border-clean">
                          {enquiry.id}
                        </span>
                      </td>

                      {/* 2. Customer */}
                      <td className="py-3 px-3 font-headline font-bold text-charcoal-accent whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => {
                              setSelectedEnquiry(enquiry);
                              setIsDetailModalOpen(true);
                            }}
                            className="hover:underline cursor-pointer hover:text-secondary"
                          >
                            {enquiry.name}
                          </span>
                          {isNew && (
                            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-extrabold uppercase bg-amber-500 text-white tracking-wider animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Phone */}
                      <td className="py-3 px-3 font-mono text-[12px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${enquiry.phone}`}
                            className="text-blue-600 hover:underline"
                          >
                            {enquiry.phone}
                          </a>
                          <a
                            href={`https://wa.me/${formattedPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Direct WhatsApp chat"
                          >
                            <span className="material-symbols-outlined text-[13px]">chat</span>
                          </a>
                        </div>
                      </td>

                      {/* 4. Email */}
                      <td className="py-3 px-3 text-[12px] text-outline font-mono max-w-[150px] truncate" title={enquiry.email || ""}>
                        {enquiry.email || "—"}
                      </td>

                      {/* 5. Subject */}
                      <td className="py-3 px-3 text-[12px] font-medium text-charcoal-accent max-w-[160px] truncate" title={enquiry.subject || ""}>
                        {enquiry.subject || enquiry.destinationCircuit || "Tour Package"}
                      </td>

                      {/* 6. Pickup */}
                      <td className="py-3 px-3 text-[12px] text-slate-600 max-w-[130px] truncate" title={enquiry.pickupLocation || ""}>
                        {enquiry.pickupLocation || "Delhi NCR"}
                      </td>

                      {/* 7. Destination */}
                      <td className="py-3 px-3 text-[12px] font-semibold text-charcoal-accent max-w-[170px] truncate" title={enquiry.destinationCircuit || ""}>
                        {enquiry.destinationCircuit || enquiry.subject || "Custom Route"}
                      </td>

                      {/* 8. Travel Date */}
                      <td className="py-3 px-3 font-mono text-[12px] text-charcoal-accent whitespace-nowrap">
                        {enquiry.travelDate ? formatDate(enquiry.travelDate) : "Flexible"}
                      </td>

                      {/* 9. Passengers */}
                      <td className="py-3 px-3 text-[12px] text-slate-700 whitespace-nowrap">
                        {enquiry.passengers ? `${enquiry.passengers}` : "1"}
                      </td>

                      {/* 10. Vehicle */}
                      <td className="py-3 px-3 text-[11.5px] text-outline max-w-[140px] truncate" title={enquiry.vehicleChoice || ""}>
                        {enquiry.vehicleChoice || "Tempo Traveller"}
                      </td>

                      {/* 11. Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <select
                          value={enquiry.status}
                          onChange={(e) => handleUpdateStatus(enquiry.id, e.target.value)}
                          className={`text-[11px] font-headline font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer ${getStatusBadge(
                            enquiry.status
                          )}`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="FOLLOW_UP">FOLLOW UP</option>
                          <option value="CONVERTED">CONVERTED</option>
                          <option value="CLOSED">CLOSED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      {/* 12. Source */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                          <span>🌐</span>
                          <span>{enquiry.source ? String(enquiry.source).toUpperCase() : "WEBSITE"}</span>
                        </span>
                      </td>

                      {/* 13. WhatsApp Status */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {enquiry.whatsappStatus === "SENT" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="material-symbols-outlined text-[12px]">done_all</span>
                            <span>SENT</span>
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="material-symbols-outlined text-[12px]">schedule</span>
                              <span>{enquiry.whatsappStatus || "FAILED"}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRetryWhatsApp(enquiry.id)}
                              disabled={isRetryingWhatsApp}
                              title="Retry WhatsApp Alert to Admin"
                              className="p-1 rounded hover:bg-amber-100 text-amber-800 transition-colors"
                            >
                              <span className="material-symbols-outlined text-[13px]">refresh</span>
                            </button>
                          </div>
                        )}
                      </td>

                      {/* 14. Created At */}
                      <td className="py-3 px-3 text-[11px] font-mono text-outline whitespace-nowrap">
                        {formatDate(enquiry.createdAt)}
                      </td>

                      {/* 14. Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Full Details */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEnquiry(enquiry);
                              setIsDetailModalOpen(true);
                            }}
                            title="View inquiry details"
                            className="p-1.5 rounded-lg border border-border-clean hover:bg-surface-subtle text-outline hover:text-charcoal-accent transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>

                          {/* WhatsApp Customer */}
                          <button
                            type="button"
                            onClick={() => handleLaunchWhatsApp(enquiry)}
                            title="Chat on WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-xs"
                          >
                            <span className="material-symbols-outlined text-[15px]">chat</span>
                          </button>

                          {/* Convert to Booking */}
                          <button
                            type="button"
                            onClick={() => {
                              setConversionLead(enquiry);
                              setIsConvertModalOpen(true);
                            }}
                            title="Convert to Booking"
                            className="p-1.5 rounded-lg border border-border-clean hover:bg-gold-subtle text-secondary transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              confirmation_number
                            </span>
                          </button>

                          {/* Dispatch Notes */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedEnquiry(enquiry);
                              setActiveNotes(enquiry.internalNotes || "");
                              setIsNotesModalOpen(true);
                            }}
                            title="Add dispatch notes"
                            className="p-1.5 rounded-lg border border-border-clean hover:bg-surface-subtle text-outline hover:text-charcoal-accent transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">note_alt</span>
                          </button>

                          {/* Retry WhatsApp Alert if FAILED */}
                          {enquiry.whatsappStatus === "FAILED" && (
                            <button
                              type="button"
                              onClick={() => handleRetryWhatsApp(enquiry.id)}
                              title="Retry WhatsApp Alert to Admin"
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">refresh</span>
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({ id: enquiry.id, name: enquiry.name || "Customer" })
                            }
                            title="Delete inquiry"
                            className="p-1.5 rounded-lg border border-border-clean hover:bg-red-50 text-outline hover:text-red-600 transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehensive Inquiry Details Modal */}
      {isDetailModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-accent/60 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl border border-border-clean shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-border-clean">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-gold-subtle text-secondary">
                  <span className="material-symbols-outlined text-[22px]">contact_support</span>
                </span>
                <div>
                  <h3 className="font-headline text-[18px] font-extrabold text-charcoal-accent">
                    Inquiry Details: {selectedEnquiry.id}
                  </h3>
                  <p className="text-[12px] text-outline">
                    Received: {formatDate(selectedEnquiry.createdAt)} • Source: {selectedEnquiry.source || "Website"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1.5 rounded-lg text-outline hover:bg-surface-subtle transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* Customer Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-surface-subtle/60 p-4 rounded-xl border border-border-clean">
                <div>
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">Customer Name</label>
                  <p className="text-[14px] font-headline font-bold text-charcoal-accent mt-0.5">{selectedEnquiry.name}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">Phone / WhatsApp</label>
                  <div className="flex items-center gap-2 mt-0.5">
                    <a href={`tel:${selectedEnquiry.phone}`} className="text-[13px] font-mono font-semibold text-blue-600 hover:underline">
                      {selectedEnquiry.phone}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleLaunchWhatsApp(selectedEnquiry)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] font-bold"
                    >
                      <span className="material-symbols-outlined text-[12px]">chat</span>
                      Chat
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">Email Address</label>
                  <p className="text-[13px] text-charcoal-accent mt-0.5 font-mono">{selectedEnquiry.email || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-outline uppercase tracking-wider block">Subject / Service</label>
                  <p className="text-[13px] font-semibold text-secondary mt-0.5">
                    {selectedEnquiry.subject || selectedEnquiry.destinationCircuit || "Tour Package"}
                  </p>
                </div>
              </div>

              {/* Trip & Requirements Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-surface-card rounded-xl border border-border-clean">
                  <span className="text-[11px] font-bold text-outline uppercase block">Pickup Location</span>
                  <span className="text-[13px] font-semibold text-charcoal-accent mt-0.5 block">
                    {selectedEnquiry.pickupLocation || "Delhi NCR"}
                  </span>
                </div>
                <div className="p-3 bg-surface-card rounded-xl border border-border-clean">
                  <span className="text-[11px] font-bold text-outline uppercase block">Destination Circuit</span>
                  <span className="text-[13px] font-semibold text-charcoal-accent mt-0.5 block">
                    {selectedEnquiry.destinationCircuit || "Custom Pan-India Route"}
                  </span>
                </div>
                <div className="p-3 bg-surface-card rounded-xl border border-border-clean">
                  <span className="text-[11px] font-bold text-outline uppercase block">Travel Date</span>
                  <span className="text-[13px] font-mono font-semibold text-charcoal-accent mt-0.5 block">
                    {selectedEnquiry.travelDate ? formatDate(selectedEnquiry.travelDate) : "Flexible Dates"}
                  </span>
                </div>
                <div className="p-3 bg-surface-card rounded-xl border border-border-clean">
                  <span className="text-[11px] font-bold text-outline uppercase block">Passengers / Pax</span>
                  <span className="text-[13px] font-semibold text-charcoal-accent mt-0.5 block">
                    {selectedEnquiry.passengers || "1"} Persons
                  </span>
                </div>
                <div className="p-3 bg-surface-card rounded-xl border border-border-clean">
                  <span className="text-[11px] font-bold text-outline uppercase block">Vehicle Preference</span>
                  <span className="text-[13px] font-semibold text-charcoal-accent mt-0.5 block">
                    {selectedEnquiry.vehicleChoice || "Force Tempo Traveller"}
                  </span>
                </div>
                <div className="p-3 bg-surface-card rounded-xl border border-border-clean">
                  <span className="text-[11px] font-bold text-outline uppercase block">Est. Fare</span>
                  <span className="text-[13px] font-headline font-extrabold text-charcoal-accent mt-0.5 block">
                    {selectedEnquiry.estimatedFare ? formatCurrency(selectedEnquiry.estimatedFare) : "Per-KM Billing"}
                  </span>
                </div>
              </div>

              {/* Message */}
              {selectedEnquiry.message && (
                <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-[13px] text-slate-800">
                  <span className="font-bold text-charcoal-accent flex items-center gap-1.5 mb-1 text-[12px] uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[15px] text-amber-600">mail</span>
                    Customer Message
                  </span>
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedEnquiry.message}</p>
                </div>
              )}

              {/* System Integration Status */}
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-clean flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
                  <div>
                    <span className="text-[11px] font-bold text-outline uppercase block">CRM Status</span>
                    <span className="text-[12px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      {selectedEnquiry.crmStatus || "SUCCESS"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-outline uppercase block">WhatsApp Alert</span>
                    <span className={`text-[12px] font-bold flex items-center gap-1 mt-0.5 ${selectedEnquiry.whatsappStatus === "SENT" ? "text-emerald-600" : "text-amber-700"}`}>
                      <span className="material-symbols-outlined text-[15px]">
                        {selectedEnquiry.whatsappStatus === "SENT" ? "done_all" : "info"}
                      </span>
                      {selectedEnquiry.whatsappStatus || "PENDING"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-outline uppercase block">Source</span>
                    <span className="text-[12px] font-bold text-blue-700 flex items-center gap-1 mt-0.5">
                      <span>🌐</span>
                      {selectedEnquiry.source === "website" ? "Website" : selectedEnquiry.source || "Website"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-outline uppercase block">Updated At</span>
                    <span className="text-[11.5px] font-mono text-charcoal-accent mt-0.5 block">
                      {selectedEnquiry.updatedAt ? formatDate(selectedEnquiry.updatedAt) : formatDate(selectedEnquiry.createdAt)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRetryWhatsApp(selectedEnquiry.id)}
                  disabled={isRetryingWhatsApp}
                  className="px-3 py-1.5 rounded-xl bg-surface-card border border-border-clean text-[12px] font-bold text-charcoal-accent hover:bg-white flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined text-[15px] ${isRetryingWhatsApp ? "animate-spin" : ""}`}>
                    refresh
                  </span>
                  <span>{isRetryingWhatsApp ? "Retrying..." : "Retry WhatsApp Alert"}</span>
                </button>
              </div>

              {/* Pipeline Status Selector */}
              <div>
                <label className="text-[12px] font-headline font-bold text-charcoal-accent block mb-1.5">
                  Update Lead Pipeline Status:
                </label>
                <div className="flex flex-wrap gap-2">
                  {["NEW", "CONTACTED", "FOLLOW_UP", "CONVERTED", "CLOSED", "CANCELLED"].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedEnquiry.id, st)}
                      className={`px-3 py-1.5 rounded-xl text-[12px] font-headline font-bold border transition-all ${
                        selectedEnquiry.status === st
                          ? "bg-charcoal-accent text-white border-charcoal-accent shadow-xs"
                          : "bg-surface-card text-charcoal-accent border-border-clean hover:bg-surface-subtle"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border-clean flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setConversionLead(selectedEnquiry);
                  setIsConvertModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gold-subtle text-secondary font-headline font-bold text-[13px] border border-gold-light/40 hover:bg-gold-light/20 flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-[17px]">confirmation_number</span>
                <span>Convert to Booking Manifest</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDetailModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-headline font-semibold text-outline hover:bg-surface-subtle transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Internal Notes Modal */}
      {isNotesModalOpen && selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-accent/50 backdrop-blur-xs">
          <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border-clean">
              <div>
                <h3 className="font-headline text-[16px] font-extrabold text-charcoal-accent">
                  Dispatch Notes
                </h3>
                <p className="text-[12px] text-outline mt-0.5">
                  Lead: {selectedEnquiry.name} • {selectedEnquiry.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsNotesModalOpen(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-subtle"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {selectedEnquiry.message && (
                <div className="p-3 rounded-xl bg-surface-subtle border border-border-clean text-[12px] text-slate-700">
                  <span className="font-bold text-charcoal-accent block mb-1">
                    Customer Message:
                  </span>
                  "{selectedEnquiry.message}"
                </div>
              )}

              <div>
                <label className="text-[12px] font-headline font-bold text-charcoal-accent block mb-1">
                  Internal Ops &amp; Dispatcher Notes:
                </label>
                <textarea
                  rows={4}
                  value={activeNotes}
                  onChange={(e) => setActiveNotes(e.target.value)}
                  placeholder="e.g., Requested 17-Seater Maharaja with roof luggage carrier. Chauffeur assigned: Balwinder Singh. Advance promised by evening."
                  className="w-full p-3 rounded-xl border border-border-clean text-[13px] text-charcoal-accent focus:outline-none focus:ring-1 focus:ring-charcoal-accent"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNotesModalOpen(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-headline font-semibold text-outline hover:bg-surface-subtle transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSavingNotes}
                className="px-4 py-2 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold hover:bg-slate-800 transition-all shadow-xs"
              >
                {isSavingNotes ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Booking Modal */}
      {isConvertModalOpen && conversionLead && (
        <ManualBookingModal
          isOpen={isConvertModalOpen}
          onClose={() => {
            setIsConvertModalOpen(false);
            setConversionLead(null);
          }}
          onSuccess={() => {
            setIsConvertModalOpen(false);
            if (conversionLead) {
              handleUpdateStatus(conversionLead.id, "CONVERTED");
            }
            setConversionLead(null);
            fetchEnquiries();
          }}
          vehicles={vehicles}
          drivers={drivers}
          initialData={{
            customerName: conversionLead.name,
            customerPhone: conversionLead.phone,
            customerEmail: conversionLead.email,
            pickupLocation: conversionLead.pickupLocation || "",
            destination: conversionLead.destinationCircuit || conversionLead.subject || "",
            travelDate: conversionLead.travelDate,
            message: `Lead conversion from Inquiry #${conversionLead.id.slice(-6)}. Notes: ${conversionLead.internalNotes || conversionLead.message || "None"}`,
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Customer Lead?"
        message={`Are you sure you want to permanently remove the inquiry for ${deleteTarget?.name}? This record will be erased from the dispatch roster.`}
        confirmText={isDeleting ? "Deleting..." : "Delete Lead"}
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
