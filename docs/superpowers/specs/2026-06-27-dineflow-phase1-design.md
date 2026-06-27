# DineFlow OS — Phase 1 Design: Customer Ordering PWA

**Status:** Approved
**Date:** 2026-06-27
**Visual direction:** Premium & Editorial (fine dining)
**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui

---

## 1. Purpose

Phase 1 delivers the **customer-facing ordering experience** — a mobile-first, installable Progressive Web App that a diner reaches by scanning a QR code at their table. No app download. It should feel like a polished native app.

This is the first deliverable in a 10-phase roadmap toward the full DineFlow OS Restaurant Commerce platform. Phase 1 is independently demoable and is the foundation every later phase (POS, KDS, owner dashboard, CRM, delivery, integrations, inventory, AI) plugs into.

### Phase roadmap (for context — only Phase 1 built now)
1. **Customer PWA** ← this phase
2. Public marketing website
3. POS & table management
4. Kitchen Display System (KDS)
5. Owner / manager dashboard
6. CRM, loyalty & marketing
7. Online ordering & delivery
8. Aggregator integrations (Swiggy/Zomato/ONDC) + payments/printers/messaging
9. Inventory & staff
10. AI + multi-branch

After each phase, the agent stops and asks the user before proceeding to the next.

---

## 2. Out of scope (explicitly deferred)

To keep Phase 1 focused, the following are **not** built now (they arrive in later phases):
- Real backend / database / authentication / OTP login (Phase uses mock data behind a service abstraction that is Firebase-ready)
- Staff screens (POS, KDS, dashboards)
- Online ordering, delivery, takeaway flows
- Payments processing (Phase 1 shows bill UI + a simulated pay action)
- CRM, loyalty, coupons engine, marketing
- Aggregator integrations
- Inventory, staff management
- AI features
- Real-time order status from a real kitchen (simulated via timer)

---

## 3. Stack & Architecture

| Concern | Choice |
|---|---|
| Build tool | **Vite** |
| UI framework | **React 18** + **TypeScript** |
| Styling | **Tailwind CSS** |
| Component library | **shadcn/ui** (Radix primitives, class-variance-authority) |
| Routing | **React Router v6** |
| State | **Zustand** (cart store, order store, session store) |
| Animation | **Framer Motion** (page transitions, micro-interactions — key to "app-like" feel) |
| Icons | **lucide-react** |
| PWA | **vite-plugin-pwa** (installable, app-like chrome, offline shell) |
| Data | **Mock data** in `src/data/` behind typed services in `src/services/` |
| Real-time | **Simulated** — order status advances on a timer; architected as a swappable listener |

### Architectural principle — swappable data layer
All UI talks only to `src/services/` interfaces (`menuService`, `orderService`, `customerService`). Mock implementations live in `src/services/mock/`. When Phase 8 introduces real Firebase, only new service implementations are added — **no UI or store code changes**. This is the single most important structural decision in Phase 1.

---

## 4. Design System — "Premium Editorial"

### Color tokens
| Token | Value | Use |
|---|---|---|
| `background` | `#0E0E10` | App background (near-black) |
| `surface` | `#16161A` | Elevated cards, sheets |
| `surface-2` | `#1E1E24` | Inputs, secondary surfaces |
| `accent` | `#C9A24B` | Primary action, highlights (gold/champagne) |
| `accent-foreground` | `#0E0E10` | Text on accent |
| `foreground` | `#F5F2EC` | Primary text (warm off-white) |
| `muted` | `#9A958C` | Secondary text |
| `border` | `#2A2A30` | Hairline dividers |
| `success` | `#5BA678` | Veg, ready, positive |
| `danger` | `#C25450` | Non-veg, delayed, destructive |

### Typography
- **Headings:** Playfair Display (serif) — editorial, luxe
- **Body:** Inter (sans) — clean, legible
- Loading via Google Fonts (preconnected).

### Mood & principles
- Generous whitespace; fine hairline dividers over heavy borders
- Full-bleed food photography as the visual anchor of menu items and hero
- Restrained motion: subtle fades, slides, spring on press
- Currency: ₹ (INR); locale formatting via a `formatCurrency` util
- All screens mobile-first, max content width constrained for large screens (PWA target is phones)

---

## 5. Data Models

```ts
// src/services/types.ts

type VegType = 'veg' | 'non-veg' | 'egg';
type SpiceLevel = 0 | 1 | 2 | 3;
type Badge = 'bestseller' | 'chef-recommendation' | 'popular' | 'new';

interface AddOn {
  id: string;
  name: string;
  price: number;
  selected?: boolean;
}

interface AddOnGroup {
  id: string;
  name: string;          // e.g. "Size", "Extras", "Choice of bread"
  required: boolean;
  min: number;
  max: number;
  options: AddOn[];
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  vegType: VegType;
  spiceLevel?: SpiceLevel;
  calories?: number;
  ingredients?: string[];
  badges?: Badge[];
  rating?: number;       // 0–5
  prepMinutes?: number;
  addOnGroups?: AddOnGroup[];
  available: boolean;
}

interface Category {
  id: string;
  name: string;          // Starters, Main Course, Desserts, Drinks…
  icon?: string;
  displayOrder: number;
}

interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl: string;
  heroUrl: string;
  currency: string;      // "INR"
  gstPercent: number;
  serviceChargePercent: number;
}

interface Table {
  id: string;
  number: number;        // display "Table 12"
  seats: number;
}

interface CartLine {
  id: string;            // unique per customization combination
  itemId: string;
  name: string;
  basePrice: number;
  selectedAddOns: AddOn[];
  quantity: number;
  instructions?: string;
  unitPrice: number;     // base + selected add-ons
}

interface Customer {
  name: string;
  mobile: string;        // 10-digit IN mobile
  isGuest?: boolean;
}

type OrderStatus =
  | 'received'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'billed';

interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  customer: Customer;
  lines: CartLine[];
  status: OrderStatus;
  placedAt: number;      // epoch ms
  subtotal: number;
  gst: number;
  serviceCharge: number;
  total: number;
  specialRequests?: string[];   // assistance: waiter/water/tissue
}

interface Feedback {
  orderId: string;
  rating: number;        // 1–5
  review?: string;
  createdAt: number;
}
```

---

## 6. Screens & Flows

Mobile-first. Bottom navigation where relevant; sticky cart bar; Framer Motion page transitions.

### 6.1 Welcome / Sign-in (`/`)
- Cinematic dark hero (restaurant `heroUrl`), logo, name, tagline.
- Inputs: **Name** + **Mobile number** (10-digit IN). Basic validation.
- "Begin" → stores `Customer` in session store (mock session; no OTP in Phase 1).
- Re-entry: if session exists, skip to table landing.

### 6.2 Table Landing (`/table/:tableId`)
- `restaurant.com/table/12` style route. Resolves `Table` by id.
- Shows: restaurant identity, **Table 12**, seats, a short welcome line.
- **Behavior:** if an active (non-`completed`/`billed`) order already exists for this table + customer, show a banner linking to **Order Tracking** and surface "Already Ordered" items — no duplicate orders (PRD requirement).
- CTA: **View Menu**.

### 6.3 Menu (`/table/:tableId/menu`)
- Sticky horizontal category rail (Starters, Main Course, Desserts, Drinks…) synced with scroll.
- Search bar (filters items by name/description/ingredient).
- Filters: Veg / Non-veg / Egg toggle; badge filters (Best Seller, Chef's Recommendation).
- Item card: image, name, short desc, veg indicator, spice dots, rating, prep time, price, **Add** button. Tapping card opens item detail.
- Unavailable items shown dimmed, no add.
- Sticky bottom **cart bar** appears when cart non-empty: item count + total + "View Cart".

### 6.4 Item Detail + Customization (`/table/:tableId/item/:itemId`)
- Full-bleed hero image, name, price, description, ingredients, calories, spice level, badges, rating.
- **Add-on groups** rendered per model (required/optional, min/max). Validation: required groups must satisfy min before Add enabled.
- Quantity stepper.
- Special instructions textarea ("No onions").
- "Add to Cart" computes `unitPrice = basePrice + Σ selectedAddOns.price`; generates a deterministic `CartLine.id` from `itemId + selected add-ons` so identical customizations merge quantity.

### 6.5 Cart (`/table/:tableId/cart`)
- Lines: image, name, selected add-ons, instructions, unit price, qty stepper, line total, remove.
- Coupon field (UI only — applies a demo coupon in Phase 1, full engine in Phase 6).
- Charges breakdown: subtotal, GST %, service charge %, total.
- **Place Order** → creates `Order` (status `received`), clears cart, routes to tracking, starts simulated status progression.

### 6.6 Order Tracking (`/table/:tableId/order/:orderId`)
- Vertical status timeline: Received → Preparing → Ready → Served. Current step highlighted (accent); completed steps ticked.
- Order summary (items + qty).
- **Simulated progression:** `received` → (8s) → `preparing` → (15s) → `ready` → (10s) → `served`. Driven by a service so it can become a real Firestore listener later.
- Actions: **Request Bill**, **Add More Items** (→ menu, active-order detection applies), **Assistance**.

### 6.7 Bill (`/table/:tableId/order/:orderId/bill`)
- Itemized lines (incl. all orders placed at the table in this session), taxes, total.
- Split-bill UI is **not** in Phase 1 (Phase 3).
- **Pay Online** (simulated → success state) and **Request Bill at Counter**.

### 6.8 Assistance Sheet (floating, global)
- Bottom sheet with three actions: **Call Waiter**, **Request Water**, **Request Tissue**.
- Records into `Order.specialRequests`; shows confirmation toast.

### 6.9 Feedback (`/table/:tableId/order/:orderId/feedback`)
- Shown after `served`/`completed`. 1–5 star input (custom), optional review textarea.
- Submit → thanks state. Persisted to mock feedback store.

### 6.10 Order History (`/table/:tableId/history`) — light
- Lists this customer's past orders at this restaurant (from mock store) with status + total. Full CRM history is Phase 6.

---

## 7. State (Zustand stores)

- **`sessionStore`**: `customer`, `restaurantId`, `tableId`. Persisted (localStorage) so a re-scan keeps context.
- **`cartStore`**: `lines[]`, add/remove/updateQty/clear, derived `count` + `subtotal`. Cart is per-table-session.
- **`orderStore`**: `activeOrder` (for current table), `pastOrders[]`, `placeOrder()`, `subscribeToStatus()` (simulated), `requestAssistance()`.
- **`feedbackStore`**: keyed by orderId.

---

## 8. Services (swappable data layer)

```ts
// src/services/index.ts — interfaces
interface MenuService {
  getRestaurant(): Promise<Restaurant>;
  getCategories(): Promise<Category[]>;
  getMenuItems(): Promise<MenuItem[]>;
  getItem(id: string): Promise<MenuItem | undefined>;
}
interface PlaceOrderInput {
  tableId: string;
  customer: Customer;
  lines: CartLine[];
  subtotal: number;
  gst: number;
  serviceCharge: number;
  total: number;
}

type Unsubscribe = () => void;
type AssistanceType = 'waiter' | 'water' | 'tissue';

interface OrderService {
  placeOrder(input: PlaceOrderInput): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getActiveOrder(tableId: string, customer: Customer): Promise<Order | undefined>;
  subscribeToStatus(orderId: string, cb: (status: OrderStatus) => void): Unsubscribe; // simulated timer now
  requestBill(orderId: string): Promise<void>;
  requestAssistance(orderId: string, type: AssistanceType): Promise<void>;
}
interface CustomerService {
  getHistory(customer: Customer): Promise<Order[]>;
  submitFeedback(feedback: Feedback): Promise<void>;
}
```
`src/services/mock/*` implements these against typed mock data. Phase 8 adds `src/services/firebase/*` with identical signatures.

---

## 9. Folder Structure (scales across all phases)

```
dineflow-os/
  src/
    app/
      router.tsx
      routes.tsx
    features/
      customer/              # Phase 1 (this phase)
        welcome/
        table/
        menu/
        item-detail/
        cart/
        order-tracking/
        bill/
        assistance/
        feedback/
        history/
      components/            # customer-specific shared
    components/              # global shadcn-based UI
      ui/                    # shadcn primitives
    services/
      types.ts
      index.ts               # interface exports
      mock/                  # mock implementations
    stores/
      session.store.ts
      cart.store.ts
      order.store.ts
      feedback.store.ts
    data/
      restaurant.ts
      menu.ts                # rich mock menu with add-ons, badges
      tables.ts
    lib/
      format.ts              # formatCurrency etc.
      id.ts
      cn.ts
    styles/
      theme.css              # tokens → CSS vars consumed by Tailwind
    main.tsx
  index.html
  tailwind.config.ts
  vite.config.ts
  tsconfig.json
  components.json            # shadcn config
```
Later phases add siblings under `features/` (e.g. `features/pos/`, `features/kitchen/`) and new service implementations under `src/services/firebase/`. No restructuring required.

---

## 10. PWA & "App-like" feel

- `vite-plugin-pwa` with a manifest: name, short_name, theme color `#0E0E10`, gold maskable icon, standalone display.
- Service worker precaches the app shell + menu data for offline browsing.
- No browser address bar in standalone; bottom safe-area insets respected.
- Framer Motion page transitions + haptic-style spring on press.

---

## 11. Mock Data

A believable, premium menu (≈ 24–30 items across Starters, Main Course, Breads, Rice, Desserts, Drinks) with:
- High-quality royalty-free food photography (Unsplash source URLs in mock data).
- Real add-on groups (Size, Extras, Spice, Choice of bread) on selected items.
- Badges, ratings, prep times, veg/non-veg, spice levels, calories, ingredients.
- One restaurant ("Saffron & Smoke" — fine-dining Indian), one table (Table 12), one mock customer seed.

---

## 12. Testing

- **Vitest + React Testing Library** for unit/component tests of:
  - `cartStore` (add/merge/remove/totals, customization id determinism)
  - Service mock implementations (place order, active-order detection)
  - Item customization validation (required add-on groups)
  - Currency formatting
- A few key component smoke tests (menu renders, add-to-cart flow).
- Manual PWA install + offline check documented in README.
Test discipline is light but real in Phase 1; deeper E2E comes with backend in later phases.

---

## 13. Definition of Done (Phase 1)

- [ ] All 10 screens implemented, navigable, premium-styled
- [ ] Cart logic correct (merge identical customizations, totals, taxes)
- [ ] Place order → simulated real-time status progression
- [ ] Active-order detection on re-scan (no duplicates, shows "Already Ordered")
- [ ] Assistance + feedback flows functional
- [ ] PWA installable, offline shell works
- [ ] Mobile-first, looks beautiful on a phone
- [ ] Services are interface-driven & Firebase-ready (no UI coupling to mock)
- [ ] Vitest tests green for stores/services/key components
- [ ] README documents run/build/test + how to demo
- [ ] `npm run build` succeeds; `npm run dev` runs clean
