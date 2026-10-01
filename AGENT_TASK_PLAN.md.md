# Antigravity Task Plan: Driver Delivery Assistant & E-Receipt Sync

## Project Overview
Build a specialized Progressive Web App (PWA) and Backend API for Grab delivery drivers to:
1. Ingest multi-stop delivery orders from Grab Electronic Receipt (PGĐT) via a Bookmarklet extractor.
2. Manage real-time route order (Drag & Drop Re-ordering, auto-resequence).
3. Track COD amounts, paid/unpaid status, and partial cancellations without data loss.
4. Provide a public signature canvas for recipients to e-sign and confirm handoff.

---

## Task Checklist & Execution Plan

### Phase 1: Architecture, Data Models & Environment Setup
- [ ] **Task 1.1: Project Skeleton & CORS Setup**
  - Initialize project with Node.js/Express (or Next.js API Routes) + React/Vite PWA frontend with Tailwind CSS.
  - Setup permissive CORS middleware for `https://phieuguige.grab-bat.net` and local development origins.
- [ ] **Task 1.2: Database & Schema Definition**
  - Implement SQLite/PostgreSQL schema:
    - `trips`: `id`, `trip_id`, `created_at`, `status` (`ACTIVE`, `COMPLETED`).
    - `orders`: `id`, `trip_id`, `order_code` (unique per trip), `recipient_name`, `phone`, `address`, `cod_amount`, `actual_collected`, `payment_status` (`UNPAID`, `PAID_ONLINE`, `COLLECTED`), `delivery_status` (`PENDING`, `DELIVERED`, `CANCELLED`), `sequence` (integer), `signature_image` (text/base64), `notes`.

### Phase 2: Ingestion Pipeline & Bookmarklet Scraper
- [ ] **Task 2.1: Bookmarklet Scraper Script**
  - Create `/public/bookmarklet.js` to inspect Grab PGĐT DOM:
    - Extract `trip_id`, `order_code`, `recipient_name`, `phone`, `address`, `cod_amount`, and original index.
    - POST payload to `/api/v1/sync-grab-orders`.
  - Provide minified `javascript:...` link for easy 1-click mobile browser installation.
- [ ] **Task 2.2: Sync API & Smart Upsert Engine**
  - Implement `POST /api/v1/sync-grab-orders`.
  - **Logic:** Upsert orders by `(trip_id, order_code)`:
    - If new: Insert with `sequence` and `payment_status = UNPAID`.
    - If exists: Update `sequence` based on current Grab sorting. **DO NOT** overwrite existing `payment_status`, `actual_collected`, or `signature_image`.
    - Recalculate total pending trip COD.

### Phase 3: Driver PWA Dashboard & Route Re-ordering
- [ ] **Task 3.1: Responsive Driver Dashboard UI**
  - Mobile-first layout with high-contrast UI and big touch targets for outdoor visibility.
  - Live metric bar: Total COD to collect, Collected amount, Pending stops count.
- [ ] **Task 3.2: Drag-and-Drop & Manual Sequence Adjustment**
  - Integrate `@hello-pangea/dnd` or HTML5 Touch Drag to re-order stop cards.
  - Add quick action buttons: "Move Up", "Move Down", "Set Next".
  - Endpoint `PUT /api/v1/trips/:tripId/reorder` to persist updated order arrays.
- [ ] **Task 3.3: Partial Order Cancellation Handling**
  - Add "Cancel Stop" action with reason modal.
  - Set order status to `CANCELLED`, freeze COD calculation for this order, and auto re-index remaining pending stops.
- [ ] **Task 3.4: Quick Financial Note & Payment Switch**
  - Add 1-tap toggles: `Unpaid` -> `Paid Online` -> `Collected Cash`.
  - Number pad modal to edit actual cash collected if customer pays different amount.

### Phase 4: Customer E-Receipt & Signature Verification
- [ ] **Task 4.1: Public Receipt Route (`/receipt/:orderCode`)**
  - Lightweight page accessible via mobile browser without driver authentication.
  - Shows order item summary, required payment, and delivery address.
- [ ] **Task 4.2: HTML5 Signature Pad**
  - Embed `signature_pad` canvas for recipient sign-off.
  - "Confirm Delivery" button submits signature image (Base64) to `/api/v1/orders/:orderCode/complete`.
  - Auto-updates driver's dashboard in real-time or on refresh.
- [ ] **Task 4.3: QR Code Generator on Driver Card**
  - Driver dashboard generates a quick QR code for each order linking directly to `/receipt/:orderCode`.

---

## Verification & Acceptance Criteria
1. **Sync Test:** Running bookmarklet against mock Grab PGĐT HTML correctly populates database without wiping already collected statuses.
2. **Re-order Test:** Dragging Stop #3 to Stop #1 correctly updates sequences and survives page refresh.
3. **Cancel Test:** Cancelling a 150k COD stop drops total trip receivable by exactly 150k and leaves remaining stops intact.
4. **Signature Test:** Signing on `/receipt/:orderCode` attaches base64 PNG to the order and flips status to `DELIVERED`.