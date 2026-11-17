# AURO PERFECT VISION — FRONTEND IMPLEMENTATION HANDOFF
**Brand:** Auro Perfect Vision (Centre for Vision Beyond Glasses • Auroville)  
**Milestone:** Complete Frontend Implementation (Public Website, Guest Booking & Staff Dashboards)  
**Status:** Verification Complete & Runnable Locally  

---

## 1. Quick Start Guide

### Prerequisites
- Node.js v18+ (verified on Node v24.20.0, npm 11.19.0)

### Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Typecheck and lint
npm run typecheck
npm run lint

# 3. Production build
npm run build

# 4. Start production server (runs on port 3000)
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in any modern browser.

---

## 2. Complete Routes & Screen Directory

### Public Web Portal (Zero-Auth)
| Route | Description | Tested Status |
|---|---|:---:|
| `/` | **Homepage:** Art-directed hero, vision philosophy, featured therapies (1:1 & programmes), 4-step process guide, Auroville heritage narrative, practitioner preview, wellness journal highlights, and primary booking CTA. | Pass |
| `/about` | **About Us:** In-depth mission, educational Bates and yogic methodology, Auroville community context, and non-clinical complementary care disclaimer. | Pass |
| `/therapies` | **Catalogue:** Filterable directory of all offerings (Individual vs Group, Online vs On-site), category tabs, dynamic search bar, pricing cards, and direct booking links. | Pass |
| `/therapies/[slug]` | **Offering Details:** Comprehensive session syllabus, what to expect, who it suits, assigned therapists, and sticky reservation summary. | Pass |
| `/team` | **Team Directory:** Practitioner profiles, bios, qualifications, and direct booking shortcuts. | Pass |
| `/blogs` | **Journal:** Educational eye-care articles, screen fatigue recovery, and category filtering. | Pass |
| `/blogs/[slug]` | **Article Reader:** Typographic reading view with responsive font hierarchy and related insights. | Pass |
| `/book/[offeringSlug]` | **Guest Booking Wizard:** 4-step transactional flow (Therapist $\rightarrow$ Slot $\rightarrow$ Intake $\rightarrow$ Payment). | Pass |
| `/booking/[reference]` | **Status Tracking:** Reference lookup, status indicator, simulated WhatsApp/email message preview, and watermarked demo invoice modal. | Pass |

### Staff & Administrative Portals
| Route | Description | Role / Permissions |
|---|---|:---:|
| `/therapist` | **My Appointments:** Filter assigned bookings, view client contact info, and inspect confidential intake answers. | Therapist Portal |
| `/therapist/schedule` | **Weekly Availability:** Edit recurring consultation hours (Mon–Sun), slot intervals, and active toggles. | Therapist Portal |
| `/therapist/time-off` | **Time Off & Leave:** Log calendar exception dates (which immediately block guest booking slots). | Therapist Portal |
| `/admin` | **Platform Overview:** KPI summary (Total bookings, Confirmed active, Pending offline revenue, Domestic INR & USD). | Super Admin |
| `/admin/bookings` | **Bookings Ledger:** Global search, filter by status, detail drawer, and "Mark as Paid" action for offline reservations. | Super Admin |
| `/admin/offerings` | **Offerings CRUD:** Create, edit, and archive sessions and flagship programmes, format, delivery, and multi-currency pricing. | Super Admin |
| `/admin/intake-builder` | **Dynamic Form Builder:** Add, remove, reorder, and configure intake questions per offering with live guest preview. | Super Admin |
| `/admin/payments` | **Payments & Offline Queue:** Review captured transactions and approve cash/bank transfer receipts. | Super Admin |
| `/admin/invoices` | **Invoice Records:** View issued immutable invoices with "SAMPLE — NOT A TAX INVOICE" watermark. | Super Admin |
| `/admin/cms` | **Journal CMS:** Draft and publish articles without developer assistance. | Super Admin |
| `/admin/notifications` | **Template Inspector:** Audit WhatsApp Business API and email trigger templates. | Super Admin |
| `/admin/settings` | **Platform Settings:** Scheduling buffers, time zones, and "Reset Demo Data" button. | Super Admin |

---

## 3. Interactive Demo Capabilities & Testing Scenarios

1. **End-to-End Offline Booking & Admin Confirmation:**
   - Go to `/book/eye-yoga`, pick Dr. Ananya Sen and an open slot.
   - Fill in client details and answer the dynamic questionnaire.
   - On Step 3, choose **Pay at Centre / Bank Transfer (Offline)** and submit.
   - Confirm status shows `Pending Offline Payment Confirmation`.
   - Open `/admin/bookings` or `/admin/payments`, locate the booking, and click **Mark as Paid**.
   - Confirm status flips to `Confirmed`, generating Invoice `#APV-2026-XXXX`.
2. **Dynamic Intake Form Configurator Test:**
   - Go to `/admin/intake-builder`, select "Eye Yoga for Children & Adults".
   - Add a new custom question (e.g. "Do you wear bifocal spectacles?"), set as required, and click **Save & Publish Version**.
   - Navigate to `/book/eye-yoga` $\rightarrow$ proceed to Step 2, and observe that the newly added question appears in the live intake form!
3. **Leave Calendar Exception Impact:**
   - Go to `/therapist/time-off` and block a specific date (e.g., tomorrow).
   - Go to `/book/eye-yoga` and check the date picker; observe that the blocked date is disabled.
4. **Demo State Reset:**
   - Go to `/admin/settings` and click **Reset Demo Data** to restore the pristine seed data.

---

## 4. Responsive Viewports & Accessibility Audit

- **Tested Breakpoints:**
  - `375px` (Compact Mobile): Single-column cards, sticky bottom order drawer, minimum 44px tap targets, zero horizontal overflow.
  - `768px` (Tablet): 2-column catalogue, collapsable admin navigation.
  - `1440px` (Desktop): Centered 1240px container, sticky right summary panels.
- **Accessibility:**
  - Color contrast exceeds WCAG 2.2 AA (minimum 7:1 for body text on ivory canvas).
  - Explicit `prefers-reduced-motion` CSS overrides.
  - High-contrast plum focus rings on all interactive elements.
