"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const endpoint = isRegisterMode ? "/api/auth/register" : "/api/auth/login";
    const payload = isRegisterMode
      ? { name, email, password, phone }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorText = data.error || (isRegisterMode ? "Could not create admin account." : "Invalid credentials.");
        setErrorMsg(errorText);
        showToast("Authentication Failed", errorText, "error");
        setIsLoading(false);
        return;
      }

      showToast(
        isRegisterMode ? "Admin Account Created" : "Access Granted",
        "Welcome to Budhram Tour & Travels CMS",
        "success"
      );
      router.push("/");
      router.refresh();
    } catch {
      setErrorMsg("Network error occurred. Please try again.");
      showToast("Connection Error", "Could not connect to authentication server", "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface-canvas flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-light/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-charcoal-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-surface-card rounded-2xl border border-border-clean shadow-xl p-8 relative z-10 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-white border border-border-clean flex items-center justify-center p-2 shadow-xs mb-3 ring-1 ring-border-strong/20">
            <img
              alt="Budhram Tour & Travels Official Logo"
              className="w-full h-full object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WFLS27Jgil9OT1dtyBMdjMr5eRstz9UXlBMSLVBeSlN2pZsP22Eoi7ZCzd1oe-wVN4OW2zgckS2ZjJmVi_B972WlWH5nuqjDng7OMR549tXe45e4xrZAGO4IoEDrc_tiE96tCM0VQm5p8n-suEGU8L9HL-Sa-LF3gim-Rd1ruu7YK_YzbTPIo4W5xH1jLYo61q8VUO7Fi4ls0GkUOzOacm9wkxhTC6rv8a0pa-UyHfF88ieZHXA8chxsA"
            />
          </div>
          <span className="font-headline text-[20px] font-extrabold text-charcoal-accent tracking-tight">
            BUDHRAM TOUR & TRAVELS
          </span>
          <span className="text-[12px] text-outline uppercase tracking-wider font-semibold mt-0.5">
            Super Admin & Operations Portal
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="flex rounded-xl bg-surface-subtle p-1 border border-border-clean">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setErrorMsg("");
            }}
            className={`flex-1 py-2 rounded-lg text-[13px] font-headline font-bold transition-all ${
              !isRegisterMode
                ? "bg-surface-card text-charcoal-accent shadow-xs"
                : "text-outline hover:text-charcoal-accent"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setErrorMsg("");
            }}
            className={`flex-1 py-2 rounded-lg text-[13px] font-headline font-bold transition-all ${
              isRegisterMode
                ? "bg-surface-card text-charcoal-accent shadow-xs"
                : "text-outline hover:text-charcoal-accent"
            }`}
          >
            Create Admin
          </button>
        </div>

        {/* Operational Security Badge */}
        <div className="p-2.5 rounded-xl bg-surface-subtle border border-border-clean flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-1.5 font-medium text-charcoal-accent">
            <span className="w-2 h-2 rounded-full bg-status-verified animate-pulse"></span>
            <span>Honest KM Meter Dispatch System</span>
          </div>
          <span className="font-bold text-secondary">DELHI NCR</span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-status-alert-bg border border-red-200 text-status-alert text-[13px] flex items-center gap-2 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegisterMode && (
            <div>
              <label className="block text-[12px] font-headline font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Deepanshu Prajapati"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-clean bg-surface-subtle text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:border-charcoal-accent focus:bg-surface-card transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[12px] font-headline font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                mail
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@budhramtravels.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-clean bg-surface-subtle text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:border-charcoal-accent focus:bg-surface-card transition-all"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-[12px] font-headline font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Contact Phone <span className="text-outline font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  call
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-clean bg-surface-subtle text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:border-charcoal-accent focus:bg-surface-card transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[12px] font-headline font-bold text-on-surface uppercase tracking-wider">
                Password {isRegisterMode && <span className="text-outline font-normal">(Min 8 chars)</span>}
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[12px] text-secondary hover:underline font-medium flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
                <span>{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={isRegisterMode ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-clean bg-surface-subtle text-[14px] text-on-surface placeholder:text-outline focus:outline-none focus:border-charcoal-accent focus:bg-surface-card transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-charcoal-accent text-white font-headline text-[14px] font-bold shadow-md hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">
                  progress_activity
                </span>
                <span>{isRegisterMode ? "Creating Admin..." : "Authenticating..."}</span>
              </>
            ) : isRegisterMode ? (
              <>
                <span>Create Admin Account</span>
                <span className="material-symbols-outlined text-[18px]">person_add</span>
              </>
            ) : (
              <>
                <span>Secure Admin Login</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle prompt at bottom */}
        <div className="text-center pt-3 border-t border-border-clean">
          <p className="text-[12px] text-outline">
            {isRegisterMode ? (
              <>
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(false);
                    setErrorMsg("");
                  }}
                  className="text-secondary font-bold hover:underline"
                >
                  Sign In to Dashboard
                </button>
              </>
            ) : (
              <>
                Need to create an admin account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(true);
                    setErrorMsg("");
                  }}
                  className="text-secondary font-bold hover:underline"
                >
                  Create Admin
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
