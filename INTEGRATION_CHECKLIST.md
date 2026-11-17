# AURO PERFECT VISION — BACKEND INTEGRATION CHECKLIST
**Milestone Transition:** Frontend Prototype $\rightarrow$ Production Backend & Cloud Deployment  
**Status:** Requirements Blueprint for Future Backend Phase  

---

## 1. Authentication & Role Permissions
- [ ] **Provision Supabase Auth:** Connect `@supabase/supabase-js` and `@supabase/ssr`.
- [ ] **Create Staff Profiles Table:** Map Supabase Auth UUID to `staff_profiles` with `role` enum (`admin`, `therapist`).
- [ ] **Server-Side Route Middleware:** Replace demo role switcher with Next.js edge middleware inspecting signed JWT sessions for `/admin/*` and `/therapist/*`.
- [ ] **Row Level Security (RLS) Policies:** Enable strict RLS on PostgreSQL so therapists can query only bookings where `therapist_id = auth.uid()`.

---

## 2. Database & Atomic Concurrency Engine
- [ ] **Run Initial Migrations:** Execute DDL schema defining 19 normalized entities specified in `IMPLEMENTATION_PLAN.md`.
- [ ] **Atomic Slot Reservation Service:** Replace client-side slot calculation with PostgreSQL transaction using `SELECT ... FOR UPDATE` and exclusion constraints (`TSTZRANGE(start_time, end_time) WITH &&`).
- [ ] **Provisional 12-Minute Hold Worker:** Implement automated hold expiry (via Supabase Edge Functions or pg_cron) to release abandoned checkout holds.
- [ ] **Intake Form Encryption:** Store sensitive medical responses with column-level encryption or restricted RLS access.

---

## 3. Payment Gateway Integrations
- [ ] **Domestic Rail (Razorpay):**
  - Implement `/api/payments/razorpay/create-order` (reads server price snapshot; never trusts client amount).
  - Implement `/api/payments/razorpay/verify` with HMAC SHA256 signature verification.
  - Set up webhook receiver `/api/webhooks/razorpay` with idempotency check against `payment_events`.
- [ ] **International Rail (PayPal / Razorpay International):**
  - Implement PayPal Orders v2 API and webhook capture reconciliation.
- [ ] **Offline Payment Workflow:**
  - Audit log recording admin user ID and timestamp whenever an offline booking is marked paid.

---

## 4. Document & Invoicing Pipeline
- [ ] **Server-Side PDF Generator:** Deploy `@react-pdf/renderer` in a serverless route handler `/api/invoices/[invoiceId]/render`.
- [ ] **Encrypted Storage:** Save generated PDF documents to private Supabase Storage bucket `invoices/`.
- [ ] **Zero-Trust Access Token Retrieval:** Validate SHA-256 hashed secret link token before streaming PDF bytes to guest browser.

---

## 5. Communications & Notification Outbox
- [ ] **WhatsApp Business API (Meta Cloud):**
  - Register approved message templates: `booking_confirmed_client`, `booking_confirmed_therapist`, `booking_pending_offline`.
  - Connect webhook receiver to update delivery statuses (`sent`, `delivered`, `read`).
- [ ] **Transactional Email (Resend / Postmark):**
  - Verify SPF, DKIM, and DMARC DNS records for `auroperfectvision.com`.
  - Attach server-generated PDF invoice and `.ics` calendar invite to confirmation email.

---

## 6. Production Hardening & Operations
- [ ] **Rate Limiting:** Protect guest booking submission and payment initialization endpoints via Upstash Redis.
- [ ] **Input Sanitization:** Validate all CMS and intake fields against Zod schemas.
- [ ] **Error Monitoring:** Configure Sentry / Logflare for unhandled exception tracking.
- [ ] **Automated Backups:** Daily encrypted PostgreSQL backups with point-in-time recovery (PITR).
