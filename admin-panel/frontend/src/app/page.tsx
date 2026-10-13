"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, TabKey } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/components/ui/Toast";

// Dashboard Components
import { MetricsBento } from "@/components/dashboard/MetricsBento";
import { RecentEnquiriesTable } from "@/components/dashboard/RecentEnquiriesTable";
import { FleetReadinessCard } from "@/components/dashboard/FleetReadinessCard";

// Management Sections
import { FleetManager } from "@/components/fleet/FleetManager";
import { PackagesManager } from "@/components/packages/PackagesManager";
import { BookingsManager } from "@/components/bookings/BookingsManager";
import { EnquiriesManager } from "@/components/enquiries/EnquiriesManager";
import { WhatsAppKmFareSimulator } from "@/components/bookings/WhatsAppKmFareSimulator";
import { CustomerCrm } from "@/components/customers/CustomerCrm";
import { PaymentsManager } from "@/components/payments/PaymentsManager";

// Website CMS Sections
import { DynamicContentManager } from "@/components/cms/DynamicContentManager";
import { MediaGallery } from "@/components/cms/MediaGallery";
import { TestimonialsManager } from "@/components/cms/TestimonialsManager";
import { ContactInfoEditor } from "@/components/cms/ContactInfoEditor";
import { SeoSettingsEditor } from "@/components/cms/SeoSettingsEditor";
import { AdminSettings } from "@/components/admin/AdminSettings";

// Quick Action Modals
import { ManualBookingModal } from "@/components/bookings/ManualBookingModal";
import { PackageModal } from "@/components/packages/PackageModal";
import { AddVehicleModal } from "@/components/fleet/AddVehicleModal";

export default function AdminDashboardPage() {
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<TabKey>("dashboard");
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Global Dispatch & Live Fleet Stats (Initialized to 0, populated strictly from actual database records)
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    enRouteBookings: 0,
    completedBookings: 0,
    totalCustomers: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    totalDrivers: 0,
    totalEnquiries: 0,
    newEnquiries: 0,
    quotesSentCount: 0,
    averageRating: 0,
    reviewCount: 0,
    totalRevenue: 0,
    totalCollected: 0,
    totalPending: 0,
  });

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  // Edge CDN Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncPercent, setSyncPercent] = useState(0);

  // Quick Action Modal states
  const [isManualBookingOpen, setIsManualBookingOpen] = useState(false);
  const [isAddPackageOpen, setIsAddPackageOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [selectedEnquiryForBooking, setSelectedEnquiryForBooking] = useState<any | null>(null);

  // Fetch Dashboard Analytics
  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.error("Stats fetch error:", e);
    }
  };

  // Fetch Recent Enquiries
  const fetchEnquiries = async () => {
    try {
      const res = await fetch("/api/enquiries");
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data.enquiries || []);
      }
    } catch (e) {
      console.error("Enquiries fetch error:", e);
    }
  };

  // Fetch Vehicles & Drivers for dropdowns
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
      console.error("Fleet fetch error:", e);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchEnquiries();
    fetchFleetAndDrivers();

    // Auto-polling every 12 seconds for real-time dashboard analytics
    const interval = setInterval(() => {
      fetchStats();
      fetchEnquiries();
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  // Quick Actions Handler
  const handleQuickAction = (action: "add-booking" | "add-package" | "add-vehicle" | "sync") => {
    switch (action) {
      case "add-booking":
        setSelectedEnquiryForBooking(null);
        setIsManualBookingOpen(true);
        break;
      case "add-package":
        setIsAddPackageOpen(true);
        break;
      case "add-vehicle":
        setIsAddVehicleOpen(true);
        break;
      case "sync":
        handleTriggerSync();
        break;
    }
  };

  // Edge CDN Sync
  const handleTriggerSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncPercent(15);

    const interval = setInterval(() => {
      setSyncPercent((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 200);

    try {
      const res = await fetch("/api/content/sync", { method: "POST" });
      clearInterval(interval);
      setSyncPercent(100);

      if (res.ok) {
        const data = await res.json();
        showToast(
          "Edge CDN Synced",
          data.message || "All dynamic packages & pricing pushed live to budhramtravels.com",
          "success"
        );
      } else {
        showToast("Sync Error", "Could not complete Edge sync", "error");
      }
    } catch {
      clearInterval(interval);
      showToast("Sync Error", "Server connection issue", "error");
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncPercent(0);
      }, 600);
    }
  };

  // Convert Enquiry from Recent Enquiries Table
  const handleConvertToBooking = (enquiry: any) => {
    setSelectedEnquiryForBooking(enquiry);
    setIsManualBookingOpen(true);
  };

  return (
    <div className="min-h-screen bg-surface-subtle text-charcoal-accent font-sans antialiased">
      {/* Responsive Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        pendingEnquiriesCount={stats.newEnquiries}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Master Operational Header */}
        <Header
          onOpenMobileSidebar={() => setIsOpenMobile(true)}
          onSearchChange={setSearchQuery}
          adminName="Administrator"
          adminRole="Admin"
        />

        {/* Dynamic Workspace Container with generous clearance below navbar */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-12 max-w-7xl mx-auto w-full">
          {/* TAB 1: OPERATIONS DISPATCH HUB / DASHBOARD */}
          {currentTab === "dashboard" && (
            <div className="flex flex-col gap-6">
              {/* Bento Metrics & Quick Action Strip */}
              <MetricsBento
                stats={stats}
                onQuickAction={handleQuickAction}
                isSyncing={isSyncing}
                syncPercent={syncPercent}
              />

              {/* Operational Real-time Row: Live Inquiries & Fleet Readiness */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <RecentEnquiriesTable
                    enquiries={enquiries.slice(0, 5)}
                    onViewAll={() => setCurrentTab("enquiries-and-bookings")}
                    onSelectEnquiry={() => setCurrentTab("enquiries-and-bookings")}
                    onConvertToBooking={handleConvertToBooking}
                  />
                </div>
                <div className="lg:col-span-1">
                  <FleetReadinessCard
                    activeCount={stats.activeVehicles}
                    totalCount={stats.totalVehicles}
                    onOpenFleet={() => setCurrentTab("force-tempo-fleet")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORCE TEMPO FLEET */}
          {currentTab === "force-tempo-fleet" && <FleetManager initialSubTab="vehicles" />}

          {/* TAB 3: MOUNTAIN CHAUFFEURS */}
          {currentTab === "mountain-chauffeurs" && <FleetManager initialSubTab="drivers" />}

          {/* TAB 4: CIRCUITS & PACKAGES */}
          {currentTab === "packages-and-circuits" && <PackagesManager />}

          {/* TAB 5: KM & FARE SIMULATOR */}
          {currentTab === "transparent-km-calculator" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline text-[24px] font-extrabold text-charcoal-accent tracking-tight">
                    Transparent KM &amp; WhatsApp Fare Calculator
                  </h2>
                  <p className="text-[13px] text-outline mt-1">
                    Calculate exact door-to-door mountain trip pricing using Budhram Tour &amp; Travels standard rates (₹24–₹34/KM) and dispatch instant WhatsApp quotes.
                  </p>
                </div>
              </div>
              <WhatsAppKmFareSimulator />
            </div>
          )}

          {/* TAB 6: ALL BOOKINGS */}
          {currentTab === "all-bookings" && <BookingsManager />}

          {/* TAB 7: LIVE ENQUIRIES */}
          {currentTab === "enquiries-and-bookings" && <EnquiriesManager />}

          {/* TAB 8: CUSTOMER CRM */}
          {currentTab === "customer-crm" && <CustomerCrm />}

          {/* TAB 9: PAYMENTS & BILLING */}
          {currentTab === "payments" && <PaymentsManager />}

          {/* TAB 10: HOMEPAGE CMS */}
          {currentTab === "homepage-cms" && <DynamicContentManager />}

          {/* TAB 11: MEDIA GALLERY */}
          {currentTab === "media-gallery" && <MediaGallery />}

          {/* TAB 12: TESTIMONIALS */}
          {currentTab === "testimonials" && <TestimonialsManager />}

          {/* TAB 13: CONTACT & BUSINESS INFO */}
          {currentTab === "contact-and-business-info" && <ContactInfoEditor />}

          {/* TAB 14: SEO SETTINGS */}
          {currentTab === "seo-settings" && <SeoSettingsEditor />}

          {/* TAB 15: ADMIN SETTINGS & SECURITY */}
          {currentTab === "admin-settings" && <AdminSettings />}
        </main>
      </div>

      {/* QUICK ACTION MODAL: Manual Booking */}
      <ManualBookingModal
        isOpen={isManualBookingOpen}
        onClose={() => {
          setIsManualBookingOpen(false);
          setSelectedEnquiryForBooking(null);
        }}
        onSuccess={() => {
          setIsManualBookingOpen(false);
          setSelectedEnquiryForBooking(null);
          fetchStats();
          fetchEnquiries();
          showToast(
            "Booking Created",
            "Manifest successfully registered in dispatch queue",
            "success"
          );
        }}
        vehicles={vehicles}
        drivers={drivers}
        initialData={
          selectedEnquiryForBooking
            ? {
                customerName: selectedEnquiryForBooking.name,
                customerPhone: selectedEnquiryForBooking.phone,
                customerEmail: selectedEnquiryForBooking.email,
                pickupLocation: selectedEnquiryForBooking.pickupLocation || "",
                destination: selectedEnquiryForBooking.destinationCircuit || "",
                travelDate: selectedEnquiryForBooking.travelDate,
                message: selectedEnquiryForBooking.message,
              }
            : undefined
        }
      />

      {/* QUICK ACTION MODAL: Add Package */}
      <PackageModal
        isOpen={isAddPackageOpen}
        packageItem={null}
        onClose={() => setIsAddPackageOpen(false)}
        onSuccess={() => {
          setIsAddPackageOpen(false);
          fetchStats();
          showToast("Tour Package Published", "New circuit added to active database", "success");
        }}
      />

      {/* QUICK ACTION MODAL: Add Vehicle */}
      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onSuccess={() => {
          setIsAddVehicleOpen(false);
          fetchFleetAndDrivers();
          fetchStats();
          showToast("Vehicle Registered", "Force Cruiser added to luxury fleet", "success");
        }}
        drivers={drivers}
      />
    </div>
  );
}
