"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

interface WhatsAppKmFareSimulatorProps {
  initialCustomerName?: string;
  initialCustomerPhone?: string;
  baseRatePerKm?: number;
  driverAllowancePerDay?: number;
  deskPhone?: string;
  onBookNow?: (quoteDetails: any) => void;
}

export function WhatsAppKmFareSimulator({
  initialCustomerName = "",
  initialCustomerPhone = "",
  baseRatePerKm = 0,
  driverAllowancePerDay = 0,
  deskPhone = "",
  onBookNow,
}: WhatsAppKmFareSimulatorProps) {
  const { showToast } = useToast();

  const [customerName, setCustomerName] = useState(initialCustomerName || "");
  const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone || "");
  const [destinationCircuit, setDestinationCircuit] = useState("");
  const [distanceKm, setDistanceKm] = useState<number | "">("");
  const [tripDays, setTripDays] = useState<number | "">("");
  const [tollTaxes, setTollTaxes] = useState<number | "">("");

  const hasRates = baseRatePerKm > 0;

  // Calculations only when rates exist
  const dist = typeof distanceKm === "number" ? distanceKm : 0;
  const days = typeof tripDays === "number" ? tripDays : 0;
  const kmBaseFare = hasRates ? dist * baseRatePerKm : 0;
  const driverAllowance = hasRates ? days * driverAllowancePerDay : 0;
  const estimatedTolls = typeof tollTaxes === "number" ? tollTaxes : 0;
  const grandTotal = kmBaseFare + driverAllowance + estimatedTolls;

  const generateWhatsAppMessage = () => {
    if (!hasRates) return "";
    return `*BUDHRAM TOUR AND TRAVELS*
_All-India Force Tempo Charter & Transparent KM Odometer Billing_
${deskPhone ? `Desk: ${deskPhone}\n` : ""}
Namaste ${customerName || "Guest"}! Here is your KM-based quotation:

📍 *Route:* ${destinationCircuit || "Custom Circuit"}
⏱ *Duration:* ${days} Days
🛣 *Estimated Distance:* ${dist} KM

💰 *Estimated Fare Breakdown:*
• Base KM Fare (${dist} km @ ₹${baseRatePerKm}/km): ${formatCurrency(kmBaseFare)}
• Chauffeur Allowance (${days} days @ ₹${driverAllowancePerDay}/day): ${formatCurrency(driverAllowance)}
${estimatedTolls > 0 ? `• State Border & Toll Taxes: ${formatCurrency(estimatedTolls)}\n` : ""}⭐ *Total Estimated Fare:* ${formatCurrency(grandTotal)}

To confirm this reservation, please reply to this message.`;
  };

  const handleCopyQuote = () => {
    if (!hasRates) {
      showToast("Cannot Copy", "Set your rates in Settings first", "error");
      return;
    }
    navigator.clipboard.writeText(generateWhatsAppMessage());
    showToast("Quotation Copied", "Ready to paste into WhatsApp or SMS", "success");
  };

  const handleOpenWhatsApp = () => {
    if (!hasRates) {
      showToast("Cannot Send", "Set your rates in Settings first", "error");
      return;
    }
    const cleanPhone = customerPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone) {
      showToast("Missing Phone", "Enter a valid customer WhatsApp number", "error");
      return;
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generateWhatsAppMessage())}`;
    window.open(url, "_blank");
  };

  const handleTriggerBooking = () => {
    if (onBookNow && hasRates) {
      onBookNow({
        customerName,
        customerPhone,
        destination: destinationCircuit,
        distanceKm: dist,
        ratePerKm: baseRatePerKm,
        totalAmount: grandTotal,
      });
    }
  };

  return (
    <div className="bg-surface-card rounded-2xl border border-border-clean shadow-xs p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-clean">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-50 text-status-verified flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">calculate</span>
          </div>
          <div>
            <h3 className="font-headline text-[15px] font-bold text-charcoal-accent">
              WhatsApp KM Fare Simulator
            </h3>
            <p className="text-[11px] text-outline">
              Calculate distance quotes &amp; dispatch to customer
            </p>
          </div>
        </div>
      </div>

      {!hasRates ? (
        <div className="p-8 text-center rounded-xl bg-surface-subtle border border-border-clean flex flex-col items-center justify-center gap-2">
          <span className="material-symbols-outlined text-[32px] text-outline/50">tune</span>
          <p className="font-headline font-bold text-charcoal-accent text-[14px]">
            Set your rates in Settings
          </p>
          <p className="text-[12px] text-outline max-w-sm">
            Fare rates, night allowance and hill supplement must be configured in Settings before calculating quotes.
          </p>
        </div>
      ) : (
        <>
          {/* Simulator Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter name"
                className="w-full px-3 py-1.5 rounded-xl border border-border-clean bg-surface-subtle text-on-surface text-[13px] focus:outline-none focus:bg-surface-card"
              />
            </div>

            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                WhatsApp Phone #
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Enter phone #"
                className="w-full px-3 py-1.5 rounded-xl border border-border-clean bg-surface-subtle text-on-surface text-[13px] focus:outline-none focus:bg-surface-card"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Destination Circuit
              </label>
              <input
                type="text"
                value={destinationCircuit}
                onChange={(e) => setDestinationCircuit(e.target.value)}
                placeholder="e.g. Delhi to Manali"
                className="w-full px-3 py-1.5 rounded-xl border border-border-clean bg-surface-subtle text-on-surface text-[13px] focus:outline-none focus:bg-surface-card"
              />
            </div>

            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Distance (KM)
              </label>
              <input
                type="number"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value ? Number(e.target.value) : "")}
                placeholder="0"
                className="w-full px-3 py-1.5 rounded-xl border border-border-clean bg-surface-subtle text-on-surface text-[13px] focus:outline-none focus:bg-surface-card font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-headline font-bold uppercase text-outline mb-1">
                Trip Days
              </label>
              <input
                type="number"
                value={tripDays}
                onChange={(e) => setTripDays(e.target.value ? Number(e.target.value) : "")}
                placeholder="0"
                className="w-full px-3 py-1.5 rounded-xl border border-border-clean bg-surface-subtle text-on-surface text-[13px] focus:outline-none focus:bg-surface-card font-mono"
              />
            </div>
          </div>

          {/* Calculated Fare Breakdown */}
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-border-clean space-y-1.5 text-[12px]">
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Base Distance ({dist} KM × ₹{baseRatePerKm}):</span>
              <span className="font-mono font-bold text-charcoal-accent">{formatCurrency(kmBaseFare)}</span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>Driver Allowance ({days} Days × ₹{driverAllowancePerDay}):</span>
              <span className="font-mono font-bold text-charcoal-accent">{formatCurrency(driverAllowance)}</span>
            </div>
            <div className="flex justify-between items-center text-on-surface-variant">
              <span>State Taxes &amp; Fastag Tolls:</span>
              <input
                type="number"
                min="0"
                value={tollTaxes}
                onChange={(e) => setTollTaxes(e.target.value ? Number(e.target.value) : "")}
                placeholder="₹0"
                className="w-24 px-2 py-1 text-right rounded-lg border border-border-clean bg-surface-card text-on-surface text-[12px] font-mono focus:outline-none"
              />
            </div>
            <div className="pt-2 border-t border-border-clean flex justify-between items-center text-[14px]">
              <span className="font-headline font-extrabold text-charcoal-accent">
                Total Quotation:
              </span>
              <span className="font-headline font-extrabold text-secondary text-[16px]">
                {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="flex-1 py-2 rounded-xl bg-status-verified text-white font-headline text-[12px] font-bold shadow-sm hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[17px]">chat</span>
              <span>Send on WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={handleCopyQuote}
              className="px-3 py-2 rounded-xl border border-border-clean bg-surface-card text-charcoal-accent hover:bg-surface-subtle font-headline text-[12px] font-semibold transition-colors"
              title="Copy Text"
            >
              <span className="material-symbols-outlined text-[17px]">content_copy</span>
            </button>
            {onBookNow && (
              <button
                type="button"
                onClick={handleTriggerBooking}
                className="px-3.5 py-2 rounded-xl bg-charcoal-accent text-white font-headline text-[12px] font-bold hover:bg-slate-800 transition-colors shadow-xs"
              >
                Create PNR
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
