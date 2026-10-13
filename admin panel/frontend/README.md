# Budhram Tour & Travels — Master CMS & Fleet Operations Admin Portal

> **Commercial-Grade, Database-Backed Travel Management & Dispatch Platform**  
> Faithfully engineered from the official Stitch UI designs, featuring 100% design fidelity, full-stack relational persistence (Prisma ORM), secure JWT authentication, and mobile responsiveness down to 320px.

---

## 🏔️ Brand & Domain Overview
- **Brand:** Budhram Tour & Travels
- **Operations Hub:** Delhi NCR
- **Core Fleet:** Luxury Force Tempo Travellers (12-Seater Executive, 16-Seater Maharaja Suites, 20-Seater Grand Touring)
- **Specializations:** Himalayan High-Altitude Circuits (Manali, Spiti Valley, Leh Ladakh, Char Dham Yatra, Shimla, Dharamshala, Golden Triangle)
- **Differentiator:** Transparent Door-to-Door Meter Billing with digital odometer audit logs.

---

## 🛠️ Technology Architecture

- **Frontend Framework:** Next.js 14 (App Router) + React 18 + TypeScript
- **Styling & Design System:** Tailwind CSS
  - **Visual Hierarchy:** Obsidian (`#0F172A`), Amber Gold (`#F59E0B`/`#D97706`), Emerald (`#059669`), Hairline Clean Slate borders (`#E2E8F0`).
  - **Typography:** Plus Jakarta Sans (Headings) & Inter (Data/Body)
- **Authentication & Security:**
  - Secure bcryptjs password hashing (cost factor 10)
  - JWT tokens stored in HTTP-Only, SameSite cookies (`budhram_admin_session`) and optional `Authorization: Bearer <token>`
  - Next.js edge route middleware protecting all dashboard pages and APIs
- **Database & Relational Modeling:**
  - **Prisma ORM** with relational schema:
    - `Admin` (Super Admin, Fleet Manager, Dispatcher)
    - `Customer` (CRM registry with booking lifetime metrics)
    - `TripPackage` (Himalayan circuits, durations, pricing, highlights, featured status)
    - `Vehicle` (Force Cruiser fleet, registration numbers, tier, odometer reading)
    - `Driver` (Mountain-vetted chauffeurs, mountain passes driven, badge status)
    - `Booking` (PNRs, passenger count, rate/km, advance, balance due, live statuses)
    - `Payment` (Transaction logs, payment modes, receipt numbers)
    - `Enquiry` (Inbound demand leads, WhatsApp quotes sent, conversion pipeline)
    - `OdometerLog` (Verifiable start/end trip audit trail)
    - `WebsiteContent` (Dynamic homepage banners, slogans, about text, hotline)
    - `MediaItem` (Vehicle gallery, fleet photography, alt text)
    - `Testimonial` (Customer reviews, star ratings)
    - `SystemNotification` (Real-time dispatch alerts)

---

## 📱 Responsive & Mobile-First Design
- **Mobile Viewports (320px–430px):**
  - Collapsible off-canvas slideover drawer with frosted backdrop
  - Touch-friendly tap targets (minimum 44px)
  - Single-column bento grids and swipeable tabular horizontal scrolling
- **Tablet / iPad Viewports (768px–1024px):**
  - Adaptive 2-column bento grids
  - Compact quick-action toolbars
- **Desktop & 4K Displays (1280px+):**
  - Full sticky sidebar navigation
  - 4-column metric command dashboard
  - Dense tabular operational manifests

---

## ⚙️ Key Functional Features

1. **Operations Dispatch Hub (Dashboard):**
   - Live fleet metrics: Total bookings, active vehicles, revenue collected, pending balances, unread customer leads.
   - Recent live inquiries feed with 1-click booking conversion.
   - Edge CDN Sync trigger with animated progress bar.

2. **Force Tempo Fleet Management:**
   - Add, edit, and decommission Force Tempo Travellers (12S, 16S, 20S, Maharaja).
   - Assign mountain-certified drivers directly to specific cruisers.
   - Record and audit digital odometer readings before/after mountain runs.

3. **Mountain Chauffeurs Roster:**
   - Track licensed chauffeurs with verified mountain pass experience.
   - Live driver status: On Trip, Ready for Dispatch, Off Duty.

4. **Transparent KM & WhatsApp Fare Simulator:**
   - Real-time door-to-door trip calculator configured from Settings.
   - Fare breakdown: Base running cost, chauffeur allowances, state toll estimates.
   - 1-Click WhatsApp Quote Generator for customer dispatch.

5. **Live Inquiries & Customer Demand Desk:**
   - Pipeline statuses: `NEW`, `QUOTE_SENT`, `CONTACTED`, `CONVERTED`, `RESOLVED`.
   - 1-click WhatsApp quote dispatch.
   - Convert incoming inquiry directly into a confirmed PNR manifest.
   - Internal dispatcher notes and CSV export.

6. **All Bookings Manifest:**
   - Search by PNR, customer name, phone, or destination.
   - Filter by status (`CONFIRMED`, `EN_ROUTE`, `COMPLETED`, `CANCELLED`, `NEW_LEAD`).
   - Detailed booking inspector with payment balance breakdown and passenger details.

7. **Customer CRM:**
   - Centralized customer registry with total trips, total spend, and contact info.

8. **Payments & Billing:**
   - Comprehensive ledger with receipt numbers, payment modes, and payment statuses.

9. **Website CMS & Dynamic Content:**
   - Real-time editing of homepage hero headline, subtitle, hotline numbers, and company about section.
   - Media Gallery management for vehicle photos.
   - Testimonials manager with toggle for featured reviews.
   - SEO metadata editor (Meta titles, OpenGraph tags, schemas).

---

## 📦 How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Push database schema
npx prisma db push

# 3. Start development server
npm run dev

# Or build and run production server
npm run build
npm run start -- -p 3000
```

---

## 🌐 Switching to Remote PostgreSQL for Cloud Production

1. In `.env`, configure your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://user:password@ep-host.pooler.region.neon.tech/budhram_db?sslmode=require"
   ```
2. Run database migration:
   ```bash
   npx prisma migrate deploy
   ```
