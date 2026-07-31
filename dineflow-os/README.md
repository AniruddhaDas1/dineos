# DineFlow OS

A full-stack **restaurant management platform** built as a Progressive Web App.
One codebase, four surfaces:

| Surface | Path | Description |
|---------|------|-------------|
| **Website** | `/` | Public marketing landing page (10 customizable templates) |
| **Customer** | `/order/*` | Mobile-first QR ordering: menu → customize → cart → track → bill → feedback |
| **POS** | `/pos/*` | Back-office: dashboard, orders, tables, CRM, inventory, staff, website builder, settings |
| **KDS** | `/kds` | Kitchen display system for order fulfillment |

## Stack

- **React 19** + **Vite 8** (PWA with offline support)
- **TypeScript** + **Tailwind CSS** + shadcn-style primitives (Radix + CVA)
- **React Router** v6 (createBrowserRouter, code-split routes)
- **Zustand** for state management (13 stores, 4 persisted)
- **Framer Motion** for animations
- **Vitest** for unit testing
- **Lucide React** for icons

## Scripts

```bash
npm run dev       # start dev server
npm run build     # production build (tsc + vite PWA)
npm run preview   # preview production build
npm run lint      # oxlint
npx vitest run    # run all 104 tests
```

## Architecture

All UI talks to typed service interfaces in `src/services/index.ts`. Mock
implementations live in `src/services/mock/`. To go live later, replace the
`services` singleton with real backends — **no UI or store changes required.**

```
src/
├── app/              # router (4 surfaces), routes (customer order flow)
├── features/
│   ├── customer/     # Phase 1 — 10 screens + shared components (cart, cartbar)
│   ├── online/       # Phase 7 — pickup & delivery ordering
│   ├── pos/          # Phase 3/5/9 — back-office (dashboard, orders, CRM,
│   │                  #   inventory, staff, tables, website builder, settings)
│   ├── kds/          # Phase 4 — kitchen display system
│   ├── website/      # Phase 2 — public marketing site (10 templates)
│   └── ai/           # Phase 10 — recommendations, forecasting, pricing,
│                     #   NLP chat, sentiment analysis
├── components/
│   ├── ui/           # shadcn-style primitives (11 files)
│   └── auth/         # PermissionGate RBAC guard
├── services/
│   ├── index.ts      # 13 service interfaces + singleton
│   ├── types.ts      # 30+ domain types
│   └── mock/         # 14 mock services + aggregator simulator
├── stores/           # 13 Zustand stores
├── data/             # Typed mock data (8 files)
├── lib/             # Utilities (3 lib files + format, color, permissions)
└── styles/           # theme.css, print.css
```

### Four Route Surfaces

| Path | Surface | Layout | Auth |
|------|---------|--------|------|
| `/` | Website | `WebsiteLayout` | Public |
| `/order/*` | Customer | `AppLayout` → `OrderApp` | Customer session |
| `/pos/*` | POS | `PosLoginPage` → `PosLayout` | RBAC permission-gated |
| `/kds` | Kitchen | `KdsLayout` | Public |

## Phase Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Customer PWA (QR ordering, PWA) | ✅ Built |
| 2 | Public marketing website (10 templates) | ✅ Built |
| 3 | POS & table management (floor hierarchy) | ✅ Built |
| 4 | Kitchen Display System (KDS) | ✅ Built |
| 5 | Owner/manager dashboard | ✅ Built |
| 6 | CRM, loyalty & segmentation | ✅ Built |
| 7 | Online ordering & delivery | ✅ Built |
| 8 | Aggregator integrations + payments/printers | ✅ Built (mocks) |
| 9 | Inventory & staff (RBAC) | ✅ Built |
| 10 | AI: recommendations, forecasting, pricing, NLP, sentiment | ✅ Built |

## RBAC (Role-Based Access Control)

The POS has 30 granular permission strings across 6 roles.

**Demo PINs:**

| PIN | Staff | Role |
|-----|-------|------|
| 1111 | Priya Sharma | admin |
| 2222 | Arjun Mehta | executive |
| 1234 | Vikram Rao | manager |
| 0000 | Anita Desai | captain |
| 9999 | Suresh Kumar | cashier |
| 3333 | Neha Gupta | user |

Permissions are enforced via route guards (`<PermissionGate>`), sidebar filtering,
and conditional UI (action buttons hidden if denied). Admins can configure the
permission matrix at `/pos/settings`.

## AI Features (Phase 10)

Five AI-powered features with client-side heuristic algorithms and mock services:

- **Recommendations** — Personalized dish suggestions based on order history, time of day,
  season, popularity, and dietary tags. Integrated into MenuPage.
- **Demand Forecasting** — Hourly/daily demand predictions with peak-hour indicators
  and inventory depletion alerts. Integrated into DashboardPage.
- **Smart Pricing** — Dynamic pricing based on demand level, personalized offers,
  and AI-optimized loyalty rewards. Integrated into CartPage.
- **Natural Language Ordering** — Chat-based ordering with intent classification
  (order, modify, cancel, query, reorder) and entity extraction. Floating ChatBot
  on the website, enhanced with quick replies and order summary panel.
- **Sentiment Analysis** — Analyzes feedback text for sentiment score, topics,
  and urgency. Integrated into POS Feedback panel with alert banners and
  analyzed feedback cards.

## Website Builder

The POS has a Website Builder at `/pos/website-builder` (gated by `website:build`).
Builds customizable public landing pages with 10 templates, live theme preview
(HSL color tokens), and content editing (hero, story, menu, gallery, reviews,
contact, hours, social). One config is set as "active" and rendered at the
public `/` route.

## Demo Flow

1. **POS login** — Enter PIN `1111` (admin).
2. **Dashboard** — View demand forecast, peak hours, inventory alerts.
3. **Tables** — Navigate the floor/table hierarchy, create/edit tables.
4. **Orders** — View orders, advance status, print bills.
5. **Customer flow** — Visit `/order`, enter name + mobile, browse menu with
   AI recommendations, add to cart, apply SmartCoupon, place order, track status.
6. **KDS** — Open `/kds` to see kitchen orders in real time.
7. **Website** — Visit `/` to see the live marketing site. Visit `/pos/website-builder`
   to customize it.

## Key Product Behaviors

- **Active-order detection**: re-visiting a table shows an "active order" banner
  and lets you add more items without creating duplicates.
- **Customization merging**: adding the same item with identical add-ons merges
  quantity; different customizations stay as separate cart lines.
- **Simulated real-time**: order status advances on a timer
  (`received → preparing → ready → served`).
- **RBAC enforcement**: every POS route is wrapped in `<PermissionGate>`;
  sidebar links and action buttons are conditionally rendered.
- **Swappable services**: all data access goes through `services` singleton —
  swap mocks for real backends with zero UI changes.

## PWA

After `npm run build && npm run preview`, use browser devtools →
Application → Install, and toggle offline to confirm the cached shell loads.

## Tests

**104 tests, 12 files — ALL PASSING**

```bash
npx vitest run
```

Covers utility helpers (`formatCurrency`, `formatHour`, `cartLineId`), cart store
(add/merge/remove/totals), order service, and all 5 AI service algorithms
(recommendations, forecasting, pricing, NLU, sentiment).
