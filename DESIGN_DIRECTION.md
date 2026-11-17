# AURO PERFECT VISION — DESIGN SYSTEM & FRONT-END ARCHITECTURE
**Brand Identity:** Auro Perfect Vision (Affiliated with Auroville)  
**Document Version:** 1.0.0 (Design & Component Planning)  
**Status:** Architecture Review Only — Pending Visual Asset Handover  

---

## 1. Visual Direction & Brand Philosophy

Auro Perfect Vision occupies a distinct intersection between **rigorous holistic vision science** and the **serene, natural, conscious living ethos of Auroville**. 

### Guiding Aesthetic Principles
1. **Calm, High-End Wellness vs Clinical Coldness:** Move away from sterile pharmaceutical whites, harsh cyan blues, and generic stock doctor imagery. Embrace warm organic tones, rich editorial contrast, and grounding natural textures that evoke peace and visual restoration.
2. **Authenticity & Heritage:** Celebrate the Auroville connection through thoughtful editorial typography, respectful spatial pacing, and authentic photography of the centre and therapists.
3. **Clarity & Visual Comfort (Optometric Empathy):** Because visitors may be experiencing eye strain, astigmatism, myopia, or vision fatigue, the UI prioritizes generous typography scales, high contrast ratios (exceeding WCAG 2.2 AA), soft non-glare backgrounds, and ample negative space.
4. **Purposeful, Accessible Motion:** Micro-interactions and reveals must be gentle, fluid, and unobtrusive. Animation should never cause motion sickness or disorientation, with strict adherence to `prefers-reduced-motion`.

---

## 2. Design Tokens & Visual Specifications

```css
:root {
  /* Core Brand Colors */
  --color-canvas-ivory: #F8F5F0;    /* Warm, anti-glare primary page background */
  --color-surface-white: #FFFFFF;   /* Clean elevated card & modal surface */
  --color-brand-plum: #432747;      /* Deep rich primary brand color (headers, primary buttons) */
  --color-plum-hover: #331C37;      /* Interactive dark plum state */
  --color-brand-gold: #BA9453;      /* Warm muted gold accent (badges, borders, highlights) */
  --color-gold-soft: #F4EFE6;       /* Gold tint for subtle background pills */
  --color-nature-sage: #E8EDE6;     /* Calming sage green for callouts, wellness highlights */
  --color-sage-dark: #3F523E;       /* Deep sage for text on light accents */
  --color-charcoal-text: #2E2435;   /* Soft charcoal primary text (never harsh 100% #000) */
  --color-muted-grey: #6B6270;      /* Secondary descriptive text and metadata */
  --color-border-subtle: #E6E0D7;   /* Gentle warm border line */

  /* Functional Status Colors */
  --color-status-success: #2E7D32;  /* Verified payment, confirmed booking */
  --color-status-warning: #C27D00;  /* Pending offline confirmation, hold expiring */
  --color-status-danger: #C62828;   /* Cancellation, slot conflict, expired session */

  /* Typography Families */
  --font-serif-heading: 'Fraunces', Georgia, serif;
  --font-sans-body: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Elevation Shadows (Soft & Diffused) */
  --shadow-subtle: 0 2px 8px -2px rgba(46, 36, 53, 0.05);
  --shadow-card: 0 8px 24px -4px rgba(46, 36, 53, 0.07);
  --shadow-modal: 0 20px 48px -12px rgba(46, 36, 53, 0.18);

  /* Layout Boundaries */
  --container-max-width: 1240px;
  --container-reading-width: 760px;
  --radius-subtle: 8px;
  --radius-card: 16px;
  --radius-pill: 9999px;
}
```

### Typography Scale & Hierarchy

| Role | Element | Font Family | Size (Desktop) | Size (Mobile) | Line Height | Tracking |
|---|---|---|---|---|---|---|
| Display Hero | `h1` | Fraunces (Optical 72) | 56px (3.5rem) | 38px (2.375rem) | 1.15 | -0.02em |
| Page Title | `h2` | Fraunces (Optical 48) | 40px (2.5rem) | 28px (1.75rem) | 1.2 | -0.015em |
| Section Title | `h3` | Fraunces | 28px (1.75rem) | 22px (1.375rem) | 1.3 | -0.01em |
| Card Title | `h4` | DM Sans (Bold) | 20px (1.25rem) | 18px (1.125rem) | 1.4 | 0 |
| Body Regular | `p`, `span` | DM Sans (Regular) | 17px (1.0625rem) | 16px (1rem) | 1.65 | 0 |
| Body Muted | `p.muted` | DM Sans (Regular) | 15px (0.9375rem) | 14px (0.875rem) | 1.55 | +0.01em |
| Eyebrow / Badges | `span.pill` | DM Sans (SemiBold) | 13px (0.8125rem) | 12px (0.75rem) | 1.2 | +0.06em (Caps) |

---

## 3. Component Inventory & Architecture

Components are built on accessible primitives (Radix UI / headless primitives), styled cleanly with Tailwind CSS, and organized into modular domain directories:

```
src/components/
├── ui/                  # Reusable low-level design primitives
│   ├── button.tsx       # Primary (Plum), Secondary (Gold Outlined), Ghost, Danger
│   ├── input.tsx        # Floating label, error state, high-contrast focus ring
│   ├── select.tsx       # Accessible dropdown with keyboard arrow navigation
│   ├── dialog.tsx       # Accessible modal dialogue for holds, confirmations
│   ├── badge.tsx        # Pill badges for Mode (Online/On-site) and Format (1:1/Group)
│   ├── calendar.tsx     # Accessible month grid with keyboard navigation
│   └── toast.tsx        # Temporary feedback toast notifications
├── public/              # Marketing & Content components
│   ├── site-header.tsx  # Sticky header with logo, nav links, and "Book a Session" CTA
│   ├── site-footer.tsx  # Legal links, Auroville affiliation, address, WhatsApp contact
│   ├── hero-banner.tsx  # Editorial hero with headline, value prop, and dual CTAs
│   ├── therapy-card.tsx # Card showcasing session details, duration, pricing, format badge
│   ├── team-card.tsx    # Therapist bio, portrait photo, specialties, and session link
│   └── blog-card.tsx    # Article card with publication date, read time, and excerpt
├── booking/             # Multi-step transactional booking flow
│   ├── wizard-stepper.tsx       # 4-stage visual progress indicator
│   ├── therapist-picker.tsx     # Filterable therapist selection grid
│   ├── slot-grid.tsx            # Morning / Afternoon grouped time-slot picker
│   ├── dynamic-intake-form.tsx  # JSON-schema driven dynamic form renderer
│   ├── price-summary.tsx        # Real-time subtotal, currency, tax line, and hold countdown
│   └── confirmation-panel.tsx   # Reference code, WhatsApp link, PDF invoice download button
└── dashboard/           # Staff & Therapist administrative interfaces
    ├── app-sidebar.tsx          # Collapsible navigation sidebar by role
    ├── stats-widget.tsx         # Metric cards (Bookings, Revenue, Pending Holds)
    ├── availability-matrix.tsx  # Weekly calendar grid for therapist hours
    ├── exception-calendar.tsx   # Date picker for logging leave and time-off
    ├── booking-table.tsx        # Sortable, filterable datatable with status badges
    └── form-builder/            # Drag-and-drop intake field configurator
```

---

## 4. Suggested Wireframe Hierarchy

### 4.1. Homepage (`/`) Flow
1. **Announcement Bar (Top):** "Welcoming clients to our Auroville Centre & Worldwide via Online Consultation."
2. **Global Navigation:** Logo (`Auro Perfect Vision`), Nav Links (`About`, `Therapies & Programmes`, `Team`, `Articles`), and prominent `Book Session` CTA.
3. **Hero Section:**
   - Left Column: Headline (*"Holistic Eye Restoration & Vision Wellness in Auroville"*), subtitle on conscious eye relaxation and Bates/integral methodology, and dual CTAs (*"Explore Therapies"*, *"Book a Session"*).
   - Right Column: High-resolution editorial photograph of natural daylight therapy space or practitioner in gentle session.
4. **Organisation Pillars:** 3-column micro-features:
   - *Natural Eye Movement & Acupressure*
   - *Online & On-Site Guided Sessions*
   - *Grounded in Auroville's Vision of Integral Living*
5. **Featured Therapies & Programmes:** Tabbed selector (`Individual Therapies` vs `Flagship Programmes`) rendering dynamic therapy cards with clear session duration and pricing in INR / USD.
6. **Meet Our Practitioners:** Horizontal cards introducing verified therapists with their specialties and direct "Book with [Name]" shortcut.
7. **The Booking Process (3 Clear Steps):**
   - 1. Choose Therapy & Preferred Guide
   - 2. Select Date & Complete Confidential Intake
   - 3. Confirm Online or Pay Upon Arrival
8. **Latest Articles & Vision Care Insights:** 3 featured blog cards with direct links.
9. **Footer:** Contact telephone, email, Auroville location details, quick links, privacy disclaimer, copyright.

---

### 4.2. Guest Booking Funnel (`/book/[slug]`) Flow
The booking flow is contained in a calm, distraction-free layout with sticky order summary:

```
+-----------------------------------------------------------------------------------+
|  [Logo] Auro Perfect Vision                           [Need Assistance? WhatsApp]  |
+-----------------------------------------------------------------------------------+
|  Step 1: Therapist & Slot  >  Step 2: Intake Details  >  Step 3: Confirm & Pay    |
+------------------------------------------------------+----------------------------+
|  LEFT COLUMN: Active Step Content                    | RIGHT COLUMN: Sticky Order |
|                                                      | Summary                    |
|  [Step 1: Choose Therapist]                          | -------------------------- |
|  ( ) Any Available Therapist                         | Session: Natural Vision    |
|  ( ) Dr. A (Specialty: Myopia)                       |          Therapy (1:1)     |
|  ( ) Dr. B (Specialty: Computer Vision Strain)       | Mode: On-site (Auroville)  |
|                                                      | Duration: 60 Minutes       |
|  [Select Date on Interactive Calendar]               | -------------------------- |
|  << November 2026 >>                                 | Selected Time:             |
|  Mo  Tu  We  Th  Fr  Sa  Su                          | Friday, 20 Nov 2026        |
|  16  17 [18] 19  20  21  22                          | 10:00 AM - 11:00 AM IST    |
|                                                      | Therapist: Dr. A           |
|  [Available Morning Slots]                           | -------------------------- |
|  [ 09:00 AM ]  [ 10:15 AM ]  [ 11:30 AM ]            | Total: ₹2,500 INR / $45 USD|
|                                                      | (Includes all taxes)       |
|  [Available Afternoon Slots]                         | -------------------------- |
|  [ 02:00 PM ]  [ 03:30 PM ]                          | [ Hold Timer: 11:45 left ] |
|                                                      |                            |
|  [ Continue to Confidential Intake -> ]              |                            |
+------------------------------------------------------+----------------------------+
```

---

## 5. Responsive Breakpoint Rules

To deliver a flawless experience across handheld smartphones, tablets, laptops, and ultra-wide screens:

| Breakpoint | Target Devices | Layout Adjustments |
|---|---|---|
| `< 640px` (sm) | Smartphones | • Single-column layout for all cards and forms.<br>• Booking summary collapses to a bottom sticky bar showing total price and "Next Step" drawer trigger.<br>• Date picker switches to a swipeable horizontal date strip.<br>• Minimum touch target: 44px × 44px on all interactive buttons. |
| `640px - 1024px` (md) | Tablets & Foldables | • 2-column grid for therapy catalogue.<br>• Calendar displays as full month grid.<br>• Dashboard collapses sidebar into an accessible slide-over sheet navigation. |
| `> 1024px` (lg/xl) | Laptops & Desktops | • Fixed max container: `1240px` with centered alignment.<br>• 2-column side-by-side layout for booking wizard with sticky summary card on right.<br>• Persistent left sidebar navigation for Admin and Therapist dashboards. |

---

## 6. Accessibility & Inclusivity Guidelines (WCAG 2.2 AA)

1. **Color Contrast:** All body text on `--color-canvas-ivory` maintains a minimum contrast ratio of **7:1** (exceeding standard 4.5:1). Interactive controls maintain at least **4.5:1** against backgrounds.
2. **Keyboard Accessibility:** All calendar slots, modal dialogues, and form fields are fully operable via Tab, Shift+Tab, Enter, and Arrow keys. Active focus indicators use a prominent 2px solid plum outline with a 2px offset.
3. **Screen Reader Semantic Structure:** Proper heading rank (`h1` through `h4`) without skipping levels. ARIA attributes for live regions during hold timer countdowns (`aria-live="polite"`).
4. **Motion Safety:** All animations wrap inside:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```
