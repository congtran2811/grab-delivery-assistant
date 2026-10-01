# Specification & Execution Plan: Grab Driver Assistant & E-Receipt Sync

## 1. Project Overview & Problem Statement
A specialized Progressive Web App (PWA) and Backend API built for individual Grab delivery drivers without official Grab API access.
The solution solves multi-stop delivery hurdles:
- Ingests delivery data directly from Grab's Electronic Consignment Note (PGĐT - `https://phieuguige.grab-bat.net/`) using a browser Bookmarklet scraper (bypassing Android `FLAG_SECURE` screenshot blocks).
- Allows live route re-ordering (Drag & Drop) without losing payment tracking.
- Tracks COD amounts, individual stop cancellations, and cash/online payment status.
- Generates public dynamic QR codes/links for recipients to sign on an HTML5 canvas, auto-updating order status to `DELIVERED`.

---

## 2. Free Technology Stack & Configuration

| Layer | Service / Tool | Free Tier Quota | Role & Configuration |
| :--- | :--- | :--- | :--- |
| **Frontend Host** | **Vercel** / **Cloudflare Pages** | Unlimited static bandwidth, SSL | Hosts Driver PWA and Public Signature pages |
| **Backend API** | **Render.com** / **Railway** | 500 free compute hours/mo | Node.js Express server handling synchronization and route APIs |
| **DB & Realtime** | **Supabase** (PostgreSQL) | 500MB DB, 50k users, Realtime WebSockets | Stores Trips, Orders, real-time sync when customer signs |
| **Signature Storage** | **Supabase Storage** | 1GB public bucket | Stores recipient signature images (PNG Base64) |
| **PWA & UI** | **React / Vite + TailwindCSS** | Open Source | Mobile-first touch interface, standalone display mode |
| **Drag & Drop** | **@hello-pangea/dnd** | Open Source | Touch-optimized drag and drop re-ordering |
| **Signature Canvas**| **signature_pad** | Open Source | Smooth touch signature on recipient mobile browser |
| **QR Code Engine** | **qrcode.react** | Open Source | Generates instant QR on driver's screen for customers |

### Required Environment Configurations

#### `apps/api/.env`
```env
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-admin-key>
INTERNAL_SYNC_SECRET=grab_driver_secret_key_2026
ALLOWED_ORIGINS=[https://phieuguige.grab-bat.net](https://phieuguige.grab-bat.net),https://<your-driver-pwa>.vercel.app