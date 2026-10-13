"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onSearchChange?: (query: string) => void;
  adminName?: string;
  adminRole?: string;
  adminEmail?: string;
}

export function Header({
  onOpenMobileSidebar,
  onSearchChange,
  adminName = "Administrator",
  adminRole = "Admin",
  adminEmail = "",
}: HeaderProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      showToast("Logged Out", "You have been securely signed out", "info");
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchVal);
    }
  };

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-surface-card/95 backdrop-blur-md border-b border-border-clean z-40 flex items-center justify-between px-4 lg:px-6 shadow-[0_1px_2px_-1px_rgba(15,23,42,0.03)]">
      {/* Left side: Hamburger on mobile + Dispatch Status Pill */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-charcoal-accent hover:bg-surface-subtle transition-colors"
          aria-label="Open Navigation"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-status-verified-bg text-status-verified font-headline text-[12px] font-bold border border-status-verified/20">
          <span className="w-1.5 h-1.5 rounded-full bg-status-verified animate-pulse"></span>
          <span>KM Meter Dispatch Live</span>
        </div>

        <div className="hidden xl:flex items-center gap-1.5 text-on-surface-variant font-headline text-[12px]">
          <span className="material-symbols-outlined text-[16px] text-secondary">
            support_agent
          </span>
          <span>24/7 Dispatch Desk</span>
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="flex-1 max-w-xs md:max-w-md mx-2 sm:mx-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              if (onSearchChange) onSearchChange(e.target.value);
            }}
            placeholder="Search booking PNR, customer, circuit..."
            className="w-full pl-9 pr-8 py-1.5 text-[13px] rounded-xl border border-border-clean bg-surface-subtle text-on-surface placeholder:text-outline focus:outline-none focus:border-charcoal-accent focus:bg-surface-card transition-all"
          />
          {searchVal && (
            <button
              type="button"
              onClick={() => {
                setSearchVal("");
                if (onSearchChange) onSearchChange("");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          )}
        </form>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Visit Website link */}
        <a
          href="https://budhramtravels.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border-clean bg-surface-card text-charcoal-accent font-headline text-[12px] font-semibold hover:bg-surface-subtle transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[15px] text-secondary">
            open_in_new
          </span>
          <span>Visit Website</span>
        </a>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-subtle hover:text-charcoal-accent transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-white text-[9px] font-bold ring-2 ring-surface-card animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-surface-card rounded-2xl border border-border-clean shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-border-clean">
                <div className="flex items-center gap-2">
                  <span className="font-headline text-[14px] font-bold text-charcoal-accent">
                    Dispatch Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-gold-subtle text-secondary font-bold text-[10px]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    notifications.forEach((n) => {
                      if (!n.read) markNotificationRead(n.id);
                    });
                  }}
                  className="text-[11px] font-semibold text-secondary hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-border-clean max-h-80 overflow-y-auto mt-2">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-[13px] text-outline">
                    No notifications right now
                  </p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`py-2.5 px-1 flex flex-col gap-0.5 cursor-pointer rounded-lg hover:bg-surface-subtle transition-colors ${
                        !notif.read ? "bg-amber-50/50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-headline text-[12px] font-bold text-charcoal-accent">
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        )}
                      </div>
                      <p className="text-[12px] text-on-surface-variant leading-snug">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-outline mt-0.5">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-border-clean mx-1"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 pl-1 group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-charcoal-accent text-white flex items-center justify-center font-headline text-[13px] font-bold shadow-xs ring-1 ring-border-strong/20">
              DP
            </div>
            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="font-headline text-[13px] font-bold text-charcoal-accent group-hover:text-secondary transition-colors">
                {adminName}
              </span>
              <span className="text-[11px] text-outline">{adminRole}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-outline">
              expand_more
            </span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-card rounded-2xl border border-border-clean shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-3 border-b border-border-clean">
                <p className="font-headline text-[13px] font-bold text-charcoal-accent">
                  {adminName}
                </p>
                <p className="text-[11px] text-outline truncate">
                  {adminEmail || "Not set"}
                </p>
                <span className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-status-verified-bg text-status-verified">
                  SUPER ADMIN
                </span>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[13px] font-medium text-status-alert rounded-xl hover:bg-status-alert-bg transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Logout from Panel</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
