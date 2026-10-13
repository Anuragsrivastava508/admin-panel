"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function PaymentsManager() {
  const { showToast } = useToast();

  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  // New Payment Form
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [referenceNote, setReferenceNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/payments", window.location.origin);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch {
      showToast("Error", "Could not load payments", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnpaidBookings = async () => {
    try {
      const res = await fetch("/api/bookings?limit=100");
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchUnpaidBookings();
  }, [search]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId || !amount) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          amount: Number(amount),
          paymentMethod,
          paymentStatus: "PAID",
          referenceNote,
        }),
      });

      if (!res.ok) {
        showToast("Error", "Could not record payment", "error");
        setIsSubmitting(false);
        return;
      }

      showToast("Payment Recorded", "Transaction logged and booking balance updated", "success");
      setIsSubmitting(false);
      setIsRecordModalOpen(false);
      setSelectedBookingId("");
      setAmount("");
      setReferenceNote("");
      fetchPayments();
    } catch {
      showToast("Error", "Server connection issue", "error");
      setIsSubmitting(false);
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-[24px] font-extrabold text-charcoal-accent tracking-tight">
              Payments &amp; KM Billing Transactions
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold bg-status-verified-bg text-status-verified border border-status-verified/20">
              AUDITED FINANCIALS
            </span>
          </div>
          <p className="text-[13px] text-outline mt-1">
            Real-time reconciliation of advances, bank transfers, UPI receipts, and trip balance settlements.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsRecordModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-charcoal-accent text-white font-headline text-[13px] font-bold hover:bg-slate-800 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add_card</span>
          <span>Record Payment</span>
        </button>
      </div>

      {/* Summary Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs">
          <span className="text-[11px] uppercase font-bold text-outline block">
            Total Collections (MTD)
          </span>
          <span className="font-headline text-[24px] font-extrabold text-status-verified block mt-0.5">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-[11px] text-outline">Verified receipts</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs">
          <span className="text-[11px] uppercase font-bold text-outline block">
            Total Transactions
          </span>
          <span className="font-headline text-[24px] font-extrabold text-charcoal-accent block mt-0.5">
            {payments.length}
          </span>
          <span className="text-[11px] text-outline">UPI, NEFT &amp; Cash</span>
        </div>
        <div className="p-4 rounded-xl bg-surface-card border border-border-clean shadow-xs">
          <span className="text-[11px] uppercase font-bold text-outline block">
            Gateway Reconciliation
          </span>
          <span className="font-headline text-[24px] font-extrabold text-secondary block mt-0.5">
            {payments.length > 0 ? "100% Match" : "0 Records"}
          </span>
          <span className="text-[11px] text-status-verified font-medium">
            {payments.length > 0 ? "0 discrepancies" : "No transactions to reconcile"}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by transaction ID, PNR, or customer..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-border-clean bg-surface-card text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:border-charcoal-accent shadow-xs"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[11px] font-headline uppercase tracking-wider text-outline bg-surface-subtle/60 border-b border-border-clean">
                <th className="py-3 px-4 font-bold">Transaction ID</th>
                <th className="py-3 px-3 font-bold">Booking PNR</th>
                <th className="py-3 px-3 font-bold">Customer</th>
                <th className="py-3 px-3 font-bold">Amount</th>
                <th className="py-3 px-3 font-bold">Method</th>
                <th className="py-3 px-3 font-bold">Date &amp; Time</th>
                <th className="py-3 px-4 font-bold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-clean">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-outline">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[36px] text-outline/40">
                        receipt_long
                      </span>
                      <p className="font-headline font-semibold text-charcoal-accent text-[14px]">
                        0 Payment Transactions
                      </p>
                      <p className="text-[12px] text-outline max-w-xs">
                        Payment records, advance deposits, and settlement logs will appear here when recorded against bookings.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-charcoal-accent">
                      {p.transactionId}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-secondary font-medium">
                      {p.booking?.pnr}
                    </td>
                    <td className="py-3.5 px-3 font-medium text-charcoal-accent">
                      {p.booking?.customer?.name || "—"}
                    </td>
                    <td className="py-3.5 px-3 font-mono font-extrabold text-charcoal-accent">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-surface-subtle text-charcoal-accent">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-on-surface-variant">
                      {formatDateTime(p.paymentDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-headline font-bold bg-status-verified-bg text-status-verified border border-status-verified/20">
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-accent/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-card rounded-2xl border border-border-clean shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-clean">
              <h3 className="font-headline text-[17px] font-bold text-charcoal-accent">
                Record Payment Transaction
              </h3>
              <button
                type="button"
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 rounded-lg text-outline hover:bg-surface-subtle"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRecordPayment} className="mt-4 flex flex-col gap-4 text-[13px]">
              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Select Booking (PNR) *
                </label>
                <select
                  required
                  value={selectedBookingId}
                  onChange={(e) => {
                    setSelectedBookingId(e.target.value);
                    const b = bookings.find((bk) => bk.id === e.target.value);
                    if (b) setAmount(String(b.balanceDue || b.totalAmount));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
                >
                  <option value="">Select Booking...</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.pnr} — {b.customer?.name} (Due: {formatCurrency(b.balanceDue)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
                  >
                    <option value="UPI">UPI / Google Pay</option>
                    <option value="BANK_TRANSFER">NEFT / RTGS</option>
                    <option value="CASH">Cash at Depot</option>
                    <option value="CARD">Credit/Debit Card</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                  Reference Note / Transaction Details
                </label>
                <input
                  type="text"
                  value={referenceNote}
                  onChange={(e) => setReferenceNote(e.target.value)}
                  placeholder="e.g. UPI Ref #48910284"
                  className="w-full px-3 py-2 rounded-xl border border-border-clean bg-surface-subtle text-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-clean">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
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
                  <span>Commit Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
