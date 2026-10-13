"use client";

import React from "react";

export type TabKey =
  | "dashboard"
  | "force-tempo-fleet"
  | "mountain-chauffeurs"
  | "packages-and-circuits"
  | "transparent-km-calculator"
  | "all-bookings"
  | "enquiries-and-bookings"
  | "customer-crm"
  | "payments"
  | "homepage-cms"
  | "media-gallery"
  | "testimonials"
  | "contact-and-business-info"
  | "seo-settings"
  | "admin-settings";

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingEnquiriesCount?: number;
}

export function Sidebar({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  pendingEnquiriesCount = 0,
}: SidebarProps) {
  const handleNavClick = (tab: TabKey) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const navItemClass = (tab: TabKey) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
      currentTab === tab
        ? "bg-charcoal-accent text-white font-bold shadow-xs"
        : "text-on-surface-variant hover:bg-surface-subtle hover:text-charcoal-accent"
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-charcoal-accent/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-surface-card border-r border-border-clean z-50 flex flex-col justify-between select-none shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] transition-transform duration-300 ease-in-out ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Brand Header with Official Logo */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-border-clean bg-surface-card flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-border-clean flex items-center justify-center p-1 overflow-hidden shadow-xs ring-1 ring-border-strong/10">
                <img
                  alt="Budhram Tour and Travels Official Logo"
                  className="w-full h-full object-contain"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WFLS27Jgil9OT1dtyBMdjMr5eRstz9UXlBMSLVBeSlN2pZsP22Eoi7ZCzd1oe-wVN4OW2zgckS2ZjJmVi_B972WlWH5nuqjDng7OMR549tXe45e4xrZAGO4IoEDrc_tiE96tCM0VQm5p8n-suEGU8L9HL-Sa-LF3gim-Rd1ruu7YK_YzbTPIo4W5xH1jLYo61q8VUO7Fi4ls0GkUOzOacm9wkxhTC6rv8a0pa-UyHfF88ieZHXA8chxsA"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline text-[15px] font-extrabold text-charcoal-accent tracking-tight leading-none truncate">
                  BUDHRAM
                </span>
                <span className="text-[10px] text-outline uppercase tracking-wider font-semibold leading-tight mt-1 truncate">
                  Tour &amp; Travels CMS
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-outline hover:bg-surface-subtle"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Operational Grid Badge */}
          <div className="px-3 pt-3 pb-1">
            <div className="px-3 py-1.5 rounded-lg bg-surface-subtle border border-border-clean flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-status-verified animate-pulse"></span>
                <span className="font-headline text-[11px] font-semibold text-charcoal-accent">
                  Fleet Grid Active
                </span>
              </div>
              <span className="font-headline text-[10px] font-bold text-secondary uppercase">
                DELHI NCR
              </span>
            </div>
          </div>

          {/* Navigation Hierarchy */}
          <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
            {/* Overview */}
            <div>
              <button
                type="button"
                onClick={() => handleNavClick("dashboard")}
                className={`w-full ${navItemClass("dashboard")}`}
              >
                <span className="material-symbols-outlined text-[19px]">dashboard</span>
                <span>Dashboard</span>
              </button>
            </div>

            {/* Travel & Fleet Ops */}
            <div>
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-outline">
                Travel &amp; Fleet Ops
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleNavClick("force-tempo-fleet")}
                  className={`w-full ${navItemClass("force-tempo-fleet")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">airport_shuttle</span>
                  <span>Force Tempo Fleet</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick("mountain-chauffeurs")}
                  className={`w-full ${navItemClass("mountain-chauffeurs")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">person_pin</span>
                  <span>Mountain Chauffeurs</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick("packages-and-circuits")}
                  className={`w-full ${navItemClass("packages-and-circuits")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">alt_route</span>
                  <span>Circuits &amp; Packages</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick("transparent-km-calculator")}
                  className={`w-full ${navItemClass("transparent-km-calculator")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">calculate</span>
                  <span>KM &amp; Fare Desk</span>
                </button>
              </div>
            </div>

            {/* Booking & Dispatch */}
            <div>
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-outline">
                Bookings &amp; Dispatch
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleNavClick("all-bookings")}
                  className={`w-full ${navItemClass("all-bookings")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">book_online</span>
                  <span>All Bookings</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick("enquiries-and-bookings")}
                  className={`w-full justify-between ${navItemClass("enquiries-and-bookings")}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[19px]">inbox</span>
                    <span>Live Enquiries</span>
                  </div>
                  {pendingEnquiriesCount > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gold-subtle text-secondary font-mono">
                      {pendingEnquiriesCount} new
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick("customer-crm")}
                  className={`w-full ${navItemClass("customer-crm")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">group</span>
                  <span>Customer CRM</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick("payments")}
                  className={`w-full ${navItemClass("payments")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">receipt_long</span>
                  <span>Payments &amp; Billing</span>
                </button>
              </div>
            </div>

            {/* Section: Website CMS */}
            <div>
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-outline">
                Website CMS
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleNavClick("homepage-cms")}
                  className={`w-full ${navItemClass("homepage-cms")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">web</span>
                  <span>Dynamic CMS Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick("media-gallery")}
                  className={`w-full ${navItemClass("media-gallery")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">photo_library</span>
                  <span>Media Gallery</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick("testimonials")}
                  className={`w-full ${navItemClass("testimonials")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">star</span>
                  <span>Testimonials</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick("contact-and-business-info")}
                  className={`w-full ${navItemClass("contact-and-business-info")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">business</span>
                  <span>Contact &amp; Address</span>
                </button>
              </div>
            </div>

            {/* Section: Configuration */}
            <div>
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-outline">
                Configuration
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => handleNavClick("seo-settings")}
                  className={`w-full ${navItemClass("seo-settings")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">language</span>
                  <span>SEO Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick("admin-settings")}
                  className={`w-full ${navItemClass("admin-settings")}`}
                >
                  <span className="material-symbols-outlined text-[19px]">settings</span>
                  <span>Admin Settings</span>
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Fleet Hub status footer */}
        <div className="p-3 border-t border-border-clean bg-surface-subtle/50 flex-shrink-0">
          <div className="flex items-center justify-between rounded-lg p-2.5 bg-surface-card border border-border-clean">
            <div className="flex flex-col min-w-0">
              <span className="font-headline text-[11px] font-bold text-charcoal-accent leading-none">
                Hub DEL-MAIN-01
              </span>
              <span className="text-[10px] text-outline mt-1 font-medium truncate">
                Majnu Ka Tilla Depot
              </span>
            </div>
            <span className="text-[9px] font-headline font-bold px-1.5 py-0.5 rounded bg-status-verified-bg text-status-verified">
              LIVE
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
