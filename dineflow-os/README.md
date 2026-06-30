# DineFlow OS — Phase 1: Customer Ordering PWA

A premium-editorial, mobile-first Progressive Web App for in-restaurant QR ordering.
Scan → browse menu → customize → cart → place order → live tracking → bill → feedback.
No app install required.

## Stack

Vite, React 18, TypeScript, Tailwind CSS, shadcn-style primitives (Radix + CVA),
React Router, Zustand, Framer Motion, vite-plugin-pwa.
Vitest + React Testing Library for tests.

## Scripts

```bash
npm run dev       # start dev server
npm run build     # production build (emits PWA manifest + service worker)
npm run preview   # preview the production build
npx vitest        # run tests
```

## Architecture note

All UI talks to typed service interfaces in `src/services/index.ts`. Mock
implementations live in `src/services/mock/`. To go live later, add
`src/services/firebase/*` with matching signatures and swap the `services`
singleton — **no UI or store changes required.**

```
src/
├─ app/            # router + route table
├─ features/
│  └─ customer/    # all 10 customer screens + shared components
├─ components/ui/  # shadcn-style primitives
├─ services/       # swappable interfaces + mock impl
├─ stores/         # Zustand: session, cart, order, feedback
├─ data/           # typed mock data (restaurant, tables, menu)
├─ lib/            # cn, formatCurrency, cartLineId
└─ styles/         # theme tokens
```

Later phases add `features/pos/`, `features/kitchen/`, … and `services/firebase/*`
without restructuring.

## Demo flow

1. Open the dev URL — enter name + 10-digit mobile.
2. Lands on **Table 12**. Tap **View Menu**.
3. Add dishes (try **Butter Chicken** — it has a required bread add-on).
4. Open cart, apply coupon `WELCOME10`, place order.
5. Watch the status advance Received → Preparing → Ready → Served.
6. **Request Bill** → **Pay Online** → **Rate**.
7. Use the floating hand button (bottom-right) to call waiter / water / tissue.
8. **Order history** shows your placed orders.

## Key product behaviors (per spec)

- **Active-order detection**: re-visiting the table shows an "active order" banner
  and lets you add more items without creating duplicates.
- **Customization merging**: adding the same item with identical add-ons merges
  quantity; different customizations stay as separate cart lines.
- **Simulated real-time**: order status advances on a timer (`received → preparing
  → ready → served`), driven by a service so it can become a real Firestore
  listener later.

## PWA

After `npm run build && npm run preview`, use browser devtools →
Application → Install, and toggle offline to confirm the cached shell loads.

## Tests

16 tests cover the cart store (add/merge/remove/totals), the order service
(place/active-order/status subscription), and the utility helpers
(`formatCurrency`, `cartLineId` determinism).
