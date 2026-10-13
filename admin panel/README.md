# Budhram Tour & Travels — Admin Portal & REST API Architecture

Production-ready decoupled architecture consisting of an Express.js Node.js REST API backend and a Next.js client-side Admin Panel frontend.

```
admin panel/
├── backend/
│   ├── prisma/
│   │   ├── dev.db                      # Preserved SQLite database (Production data intact)
│   │   ├── schema.prisma               # Prisma Schema (13 relational models)
│   │   └── migrations/                 # Migration history
│   ├── scripts/                        # Database inspection & test scripts
│   │   ├── test-api-endpoints.js       # Automated 36-assertion API test suite
│   │   ├── test-frontend-proxy-e2e.js  # Automated E2E proxy integration test suite
│   │   ├── count-tables.js             # Table count verification
│   │   └── create-admin.js             # Admin generation utility
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                   # Prisma Client singleton & connection management
│   │   │   └── env.js                  # Environment variable validation & loader
│   │   ├── controllers/
│   │   │   ├── authController.js       # Admin login, registration, me, password
│   │   │   ├── bookingController.js    # Manifests, sequential PNR (BTT-2026-XXXXX), balance due
│   │   │   ├── enquiryController.js    # Inquiries, leads, sequential IDs, customer sync
│   │   │   ├── vehicleController.js    # 12S/17S fleet registry & odometer tracking
│   │   │   ├── driverController.js     # Mountain chauffeurs & passes certification
│   │   │   ├── packageController.js    # Himalayan circuits & tariff specifications
│   │   │   ├── mediaController.js      # Exterior, cabin & cockpit showcase photography
│   │   │   ├── testimonialController.js# Verified guest reviews & ratings
│   │   │   ├── customerController.js   # Customer CRM & repeat traveler ledger
│   │   │   ├── paymentController.js    # Financial transactions & balance reconciliation
│   │   │   ├── odometerController.js   # Honest KM meter audit logs & calibration
│   │   │   ├── notificationController.js# Dispatch alerts & real-time badge counts
│   │   │   ├── contentController.js    # Homepage CMS schema editor & edge cache sync
│   │   │   ├── statsController.js      # Aggregated live analytics (100% database derived)
│   │   │   └── settingsController.js   # Business phone, depot address, pledge & fare matrix
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT validation via Cookie & Bearer header
│   │   │   └── errorMiddleware.js      # Standardized 404 & 500 error responses
│   │   ├── models/
│   │   │   └── prisma.js               # Database model re-exports
│   │   ├── routes/
│   │   │   ├── authRoutes.js           # /api/auth & /api/admin
│   │   │   ├── bookingRoutes.js        # /api/bookings
│   │   │   ├── enquiryRoutes.js        # /api/enquiries, /api/inquiries, /api/leads
│   │   │   ├── vehicleRoutes.js        # /api/vehicles
│   │   │   ├── driverRoutes.js         # /api/drivers
│   │   │   ├── packageRoutes.js        # /api/packages & /api/tours
│   │   │   ├── mediaRoutes.js          # /api/media
│   │   │   ├── testimonialRoutes.js    # /api/testimonials & /api/reviews
│   │   │   ├── customerRoutes.js       # /api/customers
│   │   │   ├── paymentRoutes.js        # /api/payments
│   │   │   ├── odometerRoutes.js       # /api/odometer
│   │   │   ├── notificationRoutes.js   # /api/notifications
│   │   │   ├── contentRoutes.js        # /api/content & /api/content/sync
│   │   │   ├── statsRoutes.js          # /api/stats
│   │   │   ├── settingsRoutes.js       # /api/settings & /api/contact
│   │   │   ├── healthRoutes.js         # /api/health
│   │   │   └── index.js                # Central API router
│   │   ├── services/
│   │   │   └── whatsappService.js      # Meta WhatsApp Cloud API alert dispatcher
│   │   ├── utils/
│   │   │   ├── jwt.js                  # Token signing & verification
│   │   │   ├── password.js             # Bcrypt password hashing
│   │   │   └── response.js             # Standard JSON formatters
│   │   └── app.js                      # Express app, Helmet, CORS, Cookie-parser
│   ├── server.js                       # Server bootstrapper & graceful shutdown handler
│   ├── .env                            # Active backend environment variables
│   ├── .env.example                    # Backend environment template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── globals.css             # Tailwind design tokens & font imports
    │   │   ├── layout.tsx              # Root HTML & Toast provider
    │   │   ├── login/page.tsx          # Super Admin login & registration portal
    │   │   └── page.tsx                # Master 15-tab operations dashboard
    │   ├── components/                 # Exactly preserved UI components (Zero UX/UI changes)
    │   └── middleware.ts               # Client route protection & redirect guard
    ├── next.config.mjs                 # Configured with /api proxy rewrite to backend
    ├── .env.local                      # Frontend environment variables
    ├── .env.example                    # Frontend environment template
│   └── package.json
├── package.json                        # Root conductor (npm run dev, test, inspect)
└── README.md                           # Documentation & deployment guide
```

---

## 1. Quick Start (Development)

### Option A: Single Command from Root Directory
Run both the Node.js Express API (port 5000) and Admin Panel Frontend (port 3000) concurrently:
```bash
# In the root "admin panel" directory:
npm run dev
```

Or individual root controls:
```bash
npm run dev:backend    # Runs only Express API (Port 5000)
npm run dev:frontend   # Runs only Frontend (Port 3000)
npm test               # Runs comprehensive 36-test API test suite
npm run inspect:db     # Inspects all database tables and counts
```

### Option B: Separate Terminal Windows

#### Terminal 1: Backend (Port 5000)
```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```
*API runs at `http://localhost:5000`.*
*Health Check: `http://localhost:5000/api/health`.*

#### Terminal 2: Frontend (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 2. Environment Variables Configuration

### Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development

# Database connection (SQLite for local, PostgreSQL for cloud)
DATABASE_URL="file:./dev.db"

# JWT Secret for admin authentication (min 32 chars in production)
JWT_SECRET="0975c6733c86152de336d1d196a03ce8590cf2511ebd64a283d518a6685cb6edc1e9e66b9be94883db9ea852e60a0680"
ADMIN_SESSION_COOKIE="budhram_admin_session"

# Allowed CORS Origins (comma-separated)
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3001,https://budhramtravels.com,https://www.budhramtravels.com"

# Public Website & Frontend URLs
FRONTEND_URL="http://localhost:3000"
PUBLIC_WEBSITE_URL="https://budhramtravels.com"

# Meta WhatsApp Cloud API Credentials (Optional - simulation mode when unset)
WHATSAPP_ACCESS_TOKEN="your_meta_system_user_access_token_here"
WHATSAPP_PHONE_NUMBER_ID="your_meta_phone_number_id_here"
WHATSAPP_ADMIN_NUMBER="919310847853"
```

### Frontend (`frontend/.env.local`)
```ini
# Backend API URL for server-side proxying
BACKEND_URL="http://localhost:5000"

# Public API URL for direct client access
NEXT_PUBLIC_API_URL="http://localhost:5000"

# Main Budhram Travels Website URL
NEXT_PUBLIC_WEBSITE_URL="https://budhramtravels.com"
```

---

## 3. Database & Production Migrations

The database includes existing production data (3 Force cruisers, 2 verified chauffeurs, 4 Himalayan tour circuits, 3 testimonials, and site configuration).

### Local SQLite (Default)
No setup required. The database file is located at `backend/prisma/dev.db`.

### Switching to PostgreSQL in Production
1. In `backend/.env`, update `DATABASE_URL`:
   ```ini
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@host:5432/budhram_db?schema=public"
   ```
2. In `backend/prisma/schema.prisma`, update provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Run Prisma migration:
   ```bash
   cd backend
   npm run prisma:generate
   npx prisma db push
   ```

---

## 4. API Endpoints Reference

| Category | Endpoint | Method | Access | Description |
|---|---|---|---|---|
| **Health** | `/api/health` | GET | Public | Database status, latency & health check |
| **Auth** | `/api/auth/login` | POST | Public | Authenticates admin, sets JWT cookie |
| **Auth** | `/api/auth/register` | POST | Public | Creates admin account |
| **Auth** | `/api/auth/logout` | POST | Public | Clears session cookie |
| **Auth** | `/api/auth/me` | GET | Public/Cookie | Returns current authenticated admin profile |
| **Auth** | `/api/auth/password` | PUT | Protected | Changes admin password |
| **Stats** | `/api/stats` | GET | Public/Admin | Returns live aggregates (0 dummy numbers) |
| **Bookings** | `/api/bookings` | GET | Public/Admin | Lists bookings (search, status, pagination) |
| **Bookings** | `/api/bookings` | POST | Public | Submits booking, assigns sequential PNR |
| **Bookings** | `/api/bookings/:id` | GET, PATCH, DELETE | Protected | View, update, or remove booking manifest |
| **Inquiries** | `/api/inquiries` / `/api/enquiries` / `/api/leads` | GET | Public/Admin | Lists inquiries |
| **Inquiries** | `/api/inquiries` / `/api/enquiries` / `/api/leads` | POST | Public | Submits website inquiry, WhatsApp alert |
| **Inquiries** | `/api/inquiries/:id` | GET, PATCH, DELETE | Protected | Manage inquiry lifecycle |
| **Vehicles** | `/api/vehicles` | GET, POST | Public (GET) / Protected (POST) | Fleet listing & enrollment |
| **Vehicles** | `/api/vehicles/:id` | PATCH, DELETE | Protected | Update vehicle status or remove |
| **Drivers** | `/api/drivers` | GET, POST | Public (GET) / Protected (POST) | Chauffeurs registry |
| **Drivers** | `/api/drivers/:id` | PATCH, DELETE | Protected | Update driver rating/status or remove |
| **Packages** | `/api/packages` / `/api/tours` | GET, POST | Public (GET) / Protected (POST) | Tour packages & circuits |
| **Packages** | `/api/packages/:id` / `/api/tours/:id` | GET, PATCH, DELETE | Public (GET) / Protected | Package details & updates |
| **Media** | `/api/media` | GET, POST | Public (GET) / Protected (POST) | Photo gallery assets |
| **Media** | `/api/media/:id` | DELETE | Protected | Remove photo asset |
| **Reviews** | `/api/testimonials` / `/api/reviews` | GET, POST, PATCH, DELETE | Public (GET) / Protected | Guest testimonials |
| **Customers**| `/api/customers` | GET, POST | Protected | Customer CRM ledger |
| **Payments** | `/api/payments` | GET, POST | Protected | Payment reconciliation & tracking |
| **Odometer** | `/api/odometer` | GET, POST | Public (GET) / Protected (POST) | KM audit logs |
| **Content**  | `/api/content` | GET, POST | Public (GET) / Protected (POST) | Homepage CMS schema |
| **Content**  | `/api/content/sync` | POST | Protected | CDN Edge Cache invalidation |
| **Settings** | `/api/settings` / `/api/contact` | GET, PUT, PATCH | Public (GET) / Protected | Business configuration & tariffs |

---

## 5. Automated Verification & Testing

Both automated test suites verify backend APIs, database consistency, and frontend proxying:

```bash
# 1. Test all 16 backend controllers, authentication, sequential IDs, and CRUD
node backend/scripts/test-api-endpoints.js

# 2. Test full end-to-end proxy from Frontend (port 3000) to Backend (port 5000)
node backend/scripts/test-frontend-proxy-e2e.js
```

---

## 6. Production Deployment Instructions

### Option A: Standard Linux VPS (Ubuntu / Debian / AWS EC2 / DigitalOcean)

1. **Install Node.js 18+ and PM2:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   sudo npm install -g pm2
   ```

2. **Deploy Backend:**
   ```bash
   cd /var/www/budhram-travels/backend
   npm install --production
   npx prisma generate
   pm2 start server.js --name "budhram-api"
   ```

3. **Deploy Frontend:**
   ```bash
   cd /var/www/budhram-travels/frontend
   npm install
   npm run build
   pm2 start npm --name "budhram-admin" -- start -- -p 3000
   ```

4. **Nginx Reverse Proxy Configuration:**
   ```nginx
   # Backend REST API
   server {
       server_name api.budhramtravels.com;

       location / {
           proxy_pass http://127.0.0.1:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }

   # Admin Panel Frontend
   server {
       server_name admin.budhramtravels.com;

       location / {
           proxy_pass http://127.0.0.1:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option B: Platform as a Service (Render / Railway / Fly.io)

- **Backend Service:**
  - Build Command: `npm install && npx prisma generate`
  - Start Command: `node server.js`
  - Environment Variables: Copy from `backend/.env.example`
- **Frontend Service:**
  - Build Command: `npm install && npm run build`
  - Start Command: `npm start`
  - Environment Variables: Set `BACKEND_URL` to your backend URL.
