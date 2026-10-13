"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export function CustomerCrm() {
  const { showToast } = useToast();

  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const url = new URL("/api/customers", window.location.origin);
      if (search) url.searchParams.set("search", search);

      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch {
      showToast("Error", "Could not load customers", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-headline text-[24px] font-extrabold text-charcoal-accent tracking-tight">
              Customer CRM &amp; Traveler Profiles
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-headline font-bold bg-gold-subtle text-secondary border border-gold-light/20">
              {customers.length} REGISTERED TRAVELERS
            </span>
          </div>
          <p className="text-[13px] text-outline mt-1">
            Track booking history, lifetime mileage, and repeat traveler relationships.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
          search
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer name, phone #, email, or city..."
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-border-clean bg-surface-card text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:border-charcoal-accent shadow-xs"
        />
      </div>

      {/* Customer Table */}
      <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="text-[11px] font-headline uppercase tracking-wider text-outline bg-surface-subtle/60 border-b border-border-clean">
                <th className="py-3 px-4 font-bold">Traveler Name</th>
                <th className="py-3 px-3 font-bold">Contact Details</th>
                <th className="py-3 px-3 font-bold">City / Location</th>
                <th className="py-3 px-3 font-bold">Bookings</th>
                <th className="py-3 px-3 font-bold">Lifetime Spent</th>
                <th className="py-3 px-3 font-bold">Last Trip</th>
                <th className="py-3 px-4 font-bold text-right">Quick Connect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-clean">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-outline">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[36px] text-outline/40">
                        group
                      </span>
                      <p className="font-headline font-semibold text-charcoal-accent text-[14px]">
                        0 Customers Registered
                      </p>
                      <p className="text-[12px] text-outline max-w-xs">
                        Customer profiles are automatically registered when bookings are created or imported into the dispatch system.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-subtle/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-headline font-bold text-charcoal-accent block">
                        {c.name}
                      </span>
                      {c.notes && (
                        <span className="text-[11px] text-outline block truncate max-w-[180px]">
                          {c.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <a
                        href={`tel:${c.phone}`}
                        className="text-secondary hover:underline font-mono font-medium block"
                      >
                        {c.phone}
                      </a>
                      <span className="text-[11px] text-outline block mt-0.5">
                        {c.email || "No email"}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-on-surface-variant font-medium">
                      {c.city || "—"}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-surface-subtle text-charcoal-accent">
                        {c.totalBookings} trips
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-extrabold text-charcoal-accent">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="py-3.5 px-3 text-on-surface-variant whitespace-nowrap">
                      {formatDate(c.lastBookingDate)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                            c.name
                          )},%20Budhram%20Tour%20%26%20Travels%20greetings.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-green-50 text-status-verified hover:bg-green-100 transition-colors"
                          title="WhatsApp"
                        >
                          <span className="material-symbols-outlined text-[17px]">chat</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(c)}
                          className="px-2.5 py-1 rounded-lg bg-charcoal-accent text-white font-headline text-[11px] font-bold hover:bg-slate-800 transition-colors shadow-xs"
                        >
                          History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Booking History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-accent/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface-card rounded-2xl border border-border-clean shadow-2xl max-w-lg w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border-clean">
              <div>
                <h3 className="font-headline text-[17px] font-bold text-charcoal-accent">
                  {selectedCustomer.name}'s Trip History
                </h3>
                <p className="text-[12px] text-outline font-mono">{selectedCustomer.phone}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-outline hover:bg-surface-subtle"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="mt-4 divide-y divide-border-clean max-h-72 overflow-y-auto">
              {selectedCustomer.bookings?.length === 0 ? (
                <p className="text-center py-6 text-outline text-[13px]">
                  No past bookings recorded for this customer.
                </p>
              ) : (
                selectedCustomer.bookings?.map((b: any) => (
                  <div key={b.id} className="py-2.5 flex items-center justify-between text-[13px]">
                    <div>
                      <span className="font-mono font-bold text-charcoal-accent block">
                        {b.pnr}
                      </span>
                      <span className="text-[12px] text-on-surface-variant block">
                        {b.destination}
                      </span>
                      <span className="text-[11px] text-outline block mt-0.5">
                        {formatDate(b.travelDate)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-charcoal-accent block">
                        {formatCurrency(b.totalAmount)}
                      </span>
                      <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-status-verified-bg text-status-verified">
                        {b.bookingStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-border-clean flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 rounded-xl bg-charcoal-accent text-white font-headline text-[12px] font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
