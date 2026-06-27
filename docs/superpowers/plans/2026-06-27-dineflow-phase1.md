# DineFlow OS — Phase 1: Customer Ordering PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a beautiful, installable, mobile-first Premium Editorial restaurant ordering PWA (scan QR → menu → customize → cart → order → track → pay) with a swappable data layer, ready to extend across all future phases.

**Architecture:** Vite + React 18 + TypeScript + Tailwind + shadcn/ui. UI talks only to typed service interfaces in `src/services/`; mock implementations live in `src/services/mock/` and are Firebase-ready (swap-in later without UI changes). Zustand stores hold session/cart/order/feedback state. Framer Motion drives app-like transitions. Order status is simulated by a service timer now, designed to become a real listener later.

**Tech Stack:** Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix + cva), React Router v6, Zustand, Framer Motion, lucide-react, vite-plugin-pwa, Vitest + React Testing Library.

**Spec:** `docs/superpowers/specs/2026-06-27-dineflow-phase1-design.md`

**Node/npm:** Node v22, npm 10.

---

## File Structure (what each file owns)

```
dineflow-os/
├─ index.html                      # HTML shell, font preconnect, root div
├─ vite.config.ts                  # Vite + React + PWA plugin config
├─ tailwind.config.ts              # Tailwind theme mapped to CSS vars
├─ postcss.config.js               # Tailwind/Autoprefixer
├─ tsconfig.json / tsconfig.node.json
├─ components.json                 # shadcn config
├─ package.json
├─ public/
│  ├─ icon-192.png, icon-512.png   # PWA icons (gold on dark)
│  └─ robots.txt
└─ src/
   ├─ main.tsx                     # app entry, mounts router
   ├─ vite-env.d.ts
   ├─ app/
   │  ├─ router.tsx                # RouterProvider setup
   │  └─ routes.tsx                # all routes + AnimatePresence layout
   ├─ styles/theme.css             # design tokens → CSS vars
   ├─ lib/
   │  ├─ cn.ts                     # classname merge
   │  ├─ id.ts                     # deterministic line id
   │  └─ format.ts                 # formatCurrency
   ├─ services/
   │  ├─ types.ts                  # all domain types
   │  ├─ index.ts                  # service interfaces + DI singleton
   │  └─ mock/
   │     ├─ mockMenuService.ts
   │     ├─ mockOrderService.ts
   │     └─ mockCustomerService.ts
   ├─ data/
   │  ├─ restaurant.ts
   │  ├─ tables.ts
   │  └─ menu.ts                   # rich mock menu
   ├─ stores/
   │  ├─ session.store.ts
   │  ├─ cart.store.ts
   │  ├─ order.store.ts
   │  └─ feedback.store.ts
   ├─ components/ui/               # shadcn primitives (button, card, …)
   └─ features/customer/
      ├─ components/               # shared customer UI (veg-mark, cart-bar, …)
      ├─ welcome/WelcomePage.tsx
      ├─ table/TableLandingPage.tsx
      ├─ menu/MenuPage.tsx
      ├─ item-detail/ItemDetailPage.tsx
      ├─ cart/CartPage.tsx
      ├─ order-tracking/OrderTrackingPage.tsx
      ├─ bill/BillPage.tsx
      ├─ assistance/AssistanceSheet.tsx
      ├─ feedback/FeedbackPage.tsx
      └─ history/HistoryPage.tsx
```

Later phases add `features/pos/`, `features/kitchen/`, … and `src/services/firebase/*` without restructuring.

---

## Task 1: Scaffold project, install deps, base config

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `src/main.tsx`, `src/vite-env.d.ts`, `src/styles/theme.css`, `.gitignore`

- [ ] **Step 1: Scaffold Vite React-TS app**

Run from `/Users/aniruddhadas/ZCodeProject`:
```bash
npm create vite@latest dineflow-os -- --template react-ts
```

- [ ] **Step 2: Install runtime dependencies**

```bash
cd dineflow-os
npm install react-router-dom zustand framer-motion lucide-react clsx tailwind-merge class-variance-authority
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D tailwindcss postcss autoprefixer @types/node vite-plugin-pwa vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
```

- [ ] **Step 4: Install shadcn/ui peer primitives**

```bash
npm install @radix-ui/react-slot @radix-ui/react-dialog @radix-ui/react-separator @radix-ui/react-toast @radix-ui/react-label
```

- [ ] **Step 5: Initialize Tailwind**

```bash
npx tailwindcss init -p
```

- [ ] **Step 6: Write `tailwind.config.ts`**

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        surface: "hsl(var(--surface) / <alpha-value>)",
        "surface-2": "hsl(var(--surface-2) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        success: "hsl(var(--success) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
      },
      fontFamily: {
        serif: ['"Playfair Display"', "Georgia", "serif"],
        sans: ['Inter', "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 7: Write `src/styles/theme.css` (tokens; hex converted to HSL)**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 240 6% 4%;       /* #0E0E10 */
    --surface: 240 5% 9%;           /* #16161A */
    --surface-2: 240 6% 13%;        /* #1E1E24 */
    --foreground: 39 31% 95%;       /* #F5F2EC */
    --muted: 39 12% 58%;            /* #9A958C */
    --border: 240 6% 17%;           /* #2A2A30 */
    --accent: 41 55% 54%;           /* #C9A24B */
    --accent-foreground: 240 6% 4%; /* #0E0E10 */
    --success: 138 28% 50%;         /* #5BA678 */
    --danger: 3 49% 55%;            /* #C25450 */
    --radius: 0.75rem;
  }

  * { @apply border-border; }
  html, body, #root { height: 100%; }
  body {
    @apply bg-background text-foreground font-sans antialiased;
    -webkit-tap-highlight-color: transparent;
  }
  h1, h2, h3, h4 { @apply font-serif; }
}
```

> Hex→HSL note: the values above were computed from the spec tokens so Tailwind's `<alpha-value>` alpha channel works.

- [ ] **Step 8: Import theme.css in `src/main.tsx`**

```tsx
import "./styles/theme.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./app/router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

- [ ] **Step 9: Write `index.html` (fonts + manifest + safe-area)**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0" />
    <meta name="theme-color" content="#0E0E10" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet" />
    <title>DineFlow</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 10: Write `vite.config.ts` (React + test + PWA placeholder; PWA finalized in Task 21)**

```ts
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
```

- [ ] **Step 11: Write `tsconfig.json` path alias**

Add to `compilerOptions` of the generated `tsconfig.json`:
```json
"baseUrl": ".",
"paths": { "@/*": ["./src/*"] }
```
Ensure `"types": ["vitest/globals", "@testing-library/jest-dom"]` is present.

- [ ] **Step 12: Write `.gitignore`**

```
node_modules
dist
dist-ssr
*.local
.DS_Store
```

- [ ] **Step 13: Verify the scaffold runs**

```bash
npm run dev
```
Expected: dev server starts, default Vite page renders at the printed localhost URL. Stop with Ctrl-C.

- [ ] **Step 14: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A
git commit -m "chore: scaffold Vite React-TS app with Tailwind, deps, theme tokens"
```

---

## Task 2: Core lib utilities (TDD)

**Files:**
- Create: `src/lib/cn.ts`, `src/lib/format.ts`, `src/lib/id.ts`
- Test: `src/lib/format.test.ts`, `src/lib/id.test.ts`

- [ ] **Step 1: Write `src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Write the failing test for `formatCurrency`**

`src/lib/format.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats a whole rupee amount with the rupee symbol", () => {
    expect(formatCurrency(240)).toBe("₹240");
  });
  it("formats decimal amounts to two digits", () => {
    expect(formatCurrency(240.5)).toBe("₹240.50");
  });
  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("₹0");
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd dineflow-os && npx vitest run src/lib/format.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 4: Write `src/lib/format.ts`**

```ts
export function formatCurrency(amount: number): string {
  const hasFraction = Math.round(amount * 100) % 100 !== 0;
  return `₹${hasFraction ? amount.toFixed(2) : Math.round(amount).toString()}`;
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run src/lib/format.test.ts
```
Expected: 3 passed.

- [ ] **Step 6: Write the failing test for `cartLineId`**

`src/lib/id.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { cartLineId } from "./id";

describe("cartLineId", () => {
  it("is identical for the same item + same sorted add-ons", () => {
    const a = cartLineId("item-1", ["x", "y"]);
    const b = cartLineId("item-1", ["y", "x"]);
    expect(a).toBe(b);
  });
  it("differs when add-ons differ", () => {
    expect(cartLineId("item-1", ["x"])).not.toBe(cartLineId("item-1", ["y"]));
  });
  it("differs when item differs", () => {
    expect(cartLineId("item-1", [])).not.toBe(cartLineId("item-2", []));
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

```bash
npx vitest run src/lib/id.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 8: Write `src/lib/id.ts`**

```ts
export function cartLineId(itemId: string, selectedAddOnIds: string[]): string {
  const sorted = [...selectedAddOnIds].sort().join(",");
  return `${itemId}|${sorted}`;
}
```

- [ ] **Step 9: Run test to verify it passes**

```bash
npx vitest run src/lib/id.test.ts
```
Expected: 3 passed.

- [ ] **Step 10: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A
git commit -m "feat(lib): add cn, formatCurrency, cartLineId utilities with tests"
```

---

## Task 3: Domain types

**Files:**
- Create: `src/services/types.ts`

- [ ] **Step 1: Write all domain types**

`src/services/types.ts`:
```ts
export type VegType = "veg" | "non-veg" | "egg";
export type SpiceLevel = 0 | 1 | 2 | 3;
export type Badge = "bestseller" | "chef-recommendation" | "popular" | "new";

export interface AddOn {
  id: string;
  name: string;
  price: number;
  selected?: boolean;
}

export interface AddOnGroup {
  id: string;
  name: string;
  required: boolean;
  min: number;
  max: number;
  options: AddOn[];
}

export interface MenuItem {
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
  rating?: number;
  prepMinutes?: number;
  addOnGroups?: AddOnGroup[];
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  displayOrder: number;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl: string;
  heroUrl: string;
  currency: string;
  gstPercent: number;
  serviceChargePercent: number;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
}

export interface CartLine {
  id: string;
  itemId: string;
  name: string;
  basePrice: number;
  selectedAddOns: AddOn[];
  quantity: number;
  instructions?: string;
  unitPrice: number;
}

export interface Customer {
  name: string;
  mobile: string;
  isGuest?: boolean;
}

export type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "billed";

export type AssistanceType = "waiter" | "water" | "tissue";

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  customer: Customer;
  lines: CartLine[];
  status: OrderStatus;
  placedAt: number;
  subtotal: number;
  gst: number;
  serviceCharge: number;
  total: number;
  specialRequests?: AssistanceType[];
}

export interface Feedback {
  orderId: string;
  rating: number;
  review?: string;
  createdAt: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(types): add DineFlow domain types"
```

---

## Task 4: Mock data

**Files:**
- Create: `src/data/restaurant.ts`, `src/data/tables.ts`, `src/data/menu.ts`

- [ ] **Step 1: Write restaurant + tables**

`src/data/restaurant.ts`:
```ts
import type { Restaurant, Table } from "@/services/types";

export const restaurant: Restaurant = {
  id: "rest-1",
  name: "Saffron & Smoke",
  tagline: "Modern Indian Fine Dining",
  description:
    "A contemporary take on regional Indian cuisine, plated with intent and served with warmth.",
  logoUrl:
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=120&q=80",
  heroUrl:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
  currency: "INR",
  gstPercent: 5,
  serviceChargePercent: 10,
};

export const tables: Table[] = [
  { id: "tbl-12", number: 12, seats: 4 },
  { id: "tbl-7", number: 7, seats: 2 },
  { id: "tbl-3", number: 3, seats: 6 },
];
```

- [ ] **Step 2: Write the mock menu (categories + items with add-ons)**

`src/data/menu.ts`:
```ts
import type { Category, MenuItem } from "@/services/types";

export const categories: Category[] = [
  { id: "starters", name: "Starters", displayOrder: 1 },
  { id: "main", name: "Main Course", displayOrder: 2 },
  { id: "breads", name: "Breads", displayOrder: 3 },
  { id: "rice", name: "Rice & Biryani", displayOrder: 4 },
  { id: "desserts", name: "Desserts", displayOrder: 5 },
  { id: "drinks", name: "Drinks", displayOrder: 6 },
];

const img = (q: string, w = 800) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=${w}&q=80`;

export const menuItems: MenuItem[] = [
  {
    id: "mi-1",
    categoryId: "starters",
    name: "Paneer Tikka",
    description: "Char-grilled cottage cheese, smoked yogurt marinade, mint chutney.",
    price: 420,
    image: img("photo-1567188040759-fb8a883dc6d8"),
    vegType: "veg",
    spiceLevel: 2,
    calories: 320,
    ingredients: ["Cottage cheese", "Yogurt", "Spices", "Mint"],
    badges: ["bestseller", "chef-recommendation"],
    rating: 4.7,
    prepMinutes: 15,
    addOnGroups: [
      {
        id: "spice", name: "Spice Level", required: false, min: 0, max: 1,
        options: [
          { id: "mild", name: "Mild", price: 0 },
          { id: "medium", name: "Medium", price: 0 },
          { id: "hot", name: "Hot", price: 0 },
        ],
      },
    ],
    available: true,
  },
  {
    id: "mi-2",
    categoryId: "starters",
    name: "Tandoori Chicken",
    description: "Half chicken, clay-oven roasted, smoky and succulent.",
    price: 520,
    image: img("photo-1599487488170-d11ec9c172f0"),
    vegType: "non-veg",
    spiceLevel: 3,
    calories: 540,
    badges: ["popular"],
    rating: 4.6,
    prepMinutes: 20,
    available: true,
  },
  {
    id: "mi-3",
    categoryId: "main",
    name: "Butter Chicken",
    description: "Tandoored chicken in a velvety tomato-cream gravy.",
    price: 560,
    image: img("photo-1603894584373-5ac82b2ae398"),
    vegType: "non-veg",
    spiceLevel: 2,
    calories: 610,
    badges: ["bestseller"],
    rating: 4.8,
    prepMinutes: 25,
    addOnGroups: [
      {
        id: "bread", name: "Choice of bread", required: true, min: 1, max: 1,
        options: [
          { id: "naan", name: "Butter Naan", price: 60 },
          { id: "roti", name: "Tandoori Roti", price: 40 },
          { id: "kulcha", name: "Amritsari Kulcha", price: 80 },
        ],
      },
    ],
    available: true,
  },
  {
    id: "mi-4",
    categoryId: "main",
    name: "Dal Makhani",
    description: "Black lentils slow-cooked overnight with butter and cream.",
    price: 380,
    image: img("photo-1546833999-b9f581a1996d"),
    vegType: "veg",
    spiceLevel: 1,
    calories: 450,
    badges: ["chef-recommendation"],
    rating: 4.7,
    prepMinutes: 18,
    available: true,
  },
  {
    id: "mi-5",
    categoryId: "breads",
    name: "Garlic Naan",
    description: "Tandoor-baked bread brushed with garlic butter and coriander.",
    price: 70,
    image: img("photo-1601050690597-df0568f70950"),
    vegType: "veg",
    spiceLevel: 0,
    calories: 280,
    rating: 4.5,
    prepMinutes: 8,
    available: true,
  },
  {
    id: "mi-6",
    categoryId: "rice",
    name: "Hyderabadi Veg Biryani",
    description: "Fragrant basmati, garden vegetables, saffron, served with raita.",
    price: 440,
    image: img("photo-1563379091339-03b21ab4a4f8"),
    vegType: "veg",
    spiceLevel: 2,
    calories: 520,
    badges: ["bestseller"],
    rating: 4.6,
    prepMinutes: 22,
    addOnGroups: [
      {
        id: "extras", name: "Extras", required: false, min: 0, max: 3,
        options: [
          { id: "raita", name: "Extra Raita", price: 40 },
          { id: "salan", name: "Mirchi Salan", price: 60 },
          { id: "papad", name: "Roasted Papad", price: 30 },
        ],
      },
    ],
    available: true,
  },
  {
    id: "mi-7",
    categoryId: "desserts",
    name: "Gulab Jamun (2 pc)",
    description: "Warm milk dumplings in cardamom-rose syrup.",
    price: 220,
    image: img("photo-1605197181614-c52a212a3e3c"),
    vegType: "veg",
    spiceLevel: 0,
    calories: 380,
    badges: ["popular"],
    rating: 4.9,
    prepMinutes: 6,
    available: true,
  },
  {
    id: "mi-8",
    categoryId: "drinks",
    name: "Masala Chai",
    description: "Assam tea, whole spices, simmered with milk.",
    price: 120,
    image: img("photo-1571934811356-5cc061b6821f"),
    vegType: "veg",
    spiceLevel: 1,
    calories: 120,
    rating: 4.4,
    prepMinutes: 5,
    available: true,
  },
  {
    id: "mi-9",
    categoryId: "drinks",
    name: "Fresh Lime Soda",
    description: "Sweet or salted, on the rocks.",
    price: 140,
    image: img("photo-1556679343-c7306c1976bc"),
    vegType: "veg",
    spiceLevel: 0,
    calories: 90,
    badges: ["new"],
    rating: 4.3,
    prepMinutes: 4,
    available: false,
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(data): add mock restaurant, tables, and menu"
```

---

## Task 5: Service interfaces + dependency injection

**Files:**
- Create: `src/services/index.ts`

- [ ] **Step 1: Write service interfaces + a swappable singleton**

`src/services/index.ts`:
```ts
import type {
  Category,
  Customer,
  Feedback,
  MenuItem,
  Order,
  OrderStatus,
  Restaurant,
  AssistanceType,
  CartLine,
} from "./types";

export type Unsubscribe = () => void;

export interface PlaceOrderInput {
  tableId: string;
  tableNumber: number;
  customer: Customer;
  lines: CartLine[];
  subtotal: number;
  gst: number;
  serviceCharge: number;
  total: number;
}

export interface MenuService {
  getRestaurant(): Promise<Restaurant>;
  getCategories(): Promise<Category[]>;
  getMenuItems(): Promise<MenuItem[]>;
  getItem(id: string): Promise<MenuItem | undefined>;
}

export interface OrderService {
  placeOrder(input: PlaceOrderInput): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getActiveOrder(tableId: string, customer: Customer): Promise<Order | undefined>;
  subscribeToStatus(orderId: string, cb: (status: OrderStatus) => void): Unsubscribe;
  requestBill(orderId: string): Promise<void>;
  requestAssistance(orderId: string, type: AssistanceType): Promise<void>;
}

export interface CustomerService {
  getHistory(customer: Customer): Promise<Order[]>;
  submitFeedback(feedback: Feedback): Promise<void>;
}

export interface Services {
  menu: MenuService;
  order: OrderService;
  customer: CustomerService;
}

// DI seam: swap mock for firebase later without touching UI/stores.
import { mockMenuService } from "./mock/mockMenuService";
import { mockOrderService } from "./mock/mockOrderService";
import { mockCustomerService } from "./mock/mockCustomerService";

export const services: Services = {
  menu: mockMenuService,
  order: mockOrderService,
  customer: mockCustomerService,
};
```

- [ ] **Step 2: Commit (will not type-check yet — mock modules come in Task 6)**

Defer commit until Task 6 so the tree compiles.

---

## Task 6: Mock service implementations (TDD)

**Files:**
- Create: `src/services/mock/mockMenuService.ts`, `src/services/mock/mockOrderService.ts`, `src/services/mock/mockCustomerService.ts`
- Test: `src/services/mock/mockOrderService.test.ts`

- [ ] **Step 1: Write `mockMenuService.ts`**

```ts
import { categories, menuItems } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import type { MenuService } from "../index";

export const mockMenuService: MenuService = {
  async getRestaurant() {
    return restaurant;
  },
  async getCategories() {
    return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  },
  async getMenuItems() {
    return menuItems;
  },
  async getItem(id) {
    return menuItems.find((m) => m.id === id);
  },
};
```

- [ ] **Step 2: Write `mockCustomerService.ts`**

```ts
import type { CustomerService } from "../index";

// In-memory history store keyed by mobile number (mock persistence).
const historyByMobile = new Map<string, import("@/services/types").Order[]>();
const feedbackStore: import("@/services/types").Feedback[] = [];

export const mockCustomerService: CustomerService = {
  async getHistory(customer) {
    return historyByMobile.get(customer.mobile) ?? [];
  },
  async submitFeedback(feedback) {
    feedbackStore.push(feedback);
  },
};

// Used by mockOrderService to record placed orders into history.
export function recordOrder(order: import("@/services/types").Order) {
  const list = historyByMobile.get(order.customer.mobile) ?? [];
  list.push(order);
  historyByMobile.set(order.customer.mobile, list);
}
```

- [ ] **Step 3: Write the failing test for order service**

`src/services/mock/mockOrderService.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { mockOrderService } from "./mockOrderService";

const customer = { name: "Ana", mobile: "9999900001" };
const baseInput = {
  tableId: "tbl-12",
  tableNumber: 12,
  customer,
  lines: [],
  subtotal: 100,
  gst: 5,
  serviceCharge: 10,
  total: 115,
};

describe("mockOrderService", () => {
  beforeEach(() => mockOrderService.__reset());

  it("places an order in received status", async () => {
    const order = await mockOrderService.placeOrder(baseInput);
    expect(order.status).toBe("received");
    expect(order.total).toBe(115);
  });

  it("finds an active order for the same table + customer", async () => {
    const placed = await mockOrderService.placeOrder(baseInput);
    const active = await mockOrderService.getActiveOrder("tbl-12", customer);
    expect(active?.id).toBe(placed.id);
  });

  it("returns undefined active order when none exists", async () => {
    const active = await mockOrderService.getActiveOrder("tbl-12", customer);
    expect(active).toBeUndefined();
  });

  it("does not consider billed orders active", async () => {
    const placed = await mockOrderService.placeOrder(baseInput);
    placed.status = "billed";
    const active = await mockOrderService.getActiveOrder("tbl-12", customer);
    expect(active).toBeUndefined();
  });

  it("calls the status subscriber as status advances", async () => {
    const order = await mockOrderService.placeOrder(baseInput);
    const cb = vi.fn();
    mockOrderService.subscribeToStatus(order.id, cb);
    // run pending timers (subscribe uses setTimeout)
    await vi.runAllTimersAsync();
    expect(cb).toHaveBeenCalled();
    const statuses = cb.mock.calls.map((c) => c[0]);
    expect(statuses).toContain("preparing");
  });
});
```

- [ ] **Step 4: Configure fake timers — add to `vite.config.ts` test setup**

This needs `vi.useFakeTimers()` before each test. Instead of global, add a setup file. Create `src/test-setup.ts`:
```ts
import "@testing-library/jest-dom";
```
Then update the test file to use fake timers per-test by editing the last `it` block's setup. Replace the last test's body start:

In `src/services/mock/mockOrderService.test.ts`, change `beforeEach` to:
```ts
beforeEach(() => {
  vi.useFakeTimers();
  mockOrderService.__reset();
});
```

- [ ] **Step 5: Run test to verify it fails**

```bash
cd dineflow-os && npx vitest run src/services/mock/mockOrderService.test.ts
```
Expected: FAIL — `mockOrderService` not found / `__reset` missing.

- [ ] **Step 6: Write `mockOrderService.ts`**

```ts
import type { OrderService, PlaceOrderInput, Unsubscribe } from "../index";
import type { Order, OrderStatus } from "@/services/types";
import { recordOrder } from "./mockCustomerService";

const orders = new Map<string, Order>();

// Timings (ms) for simulated status progression.
const TRANSITIONS: { status: OrderStatus; after: number }[] = [
  { status: "preparing", after: 8000 },
  { status: "ready", after: 15000 },
  { status: "served", after: 10000 },
];

const ACTIVE_STATUSES: OrderStatus[] = ["received", "preparing", "ready", "served"];

let counter = 0;
function genId() {
  counter += 1;
  return `order-${Date.now()}-${counter}`;
}

export const mockOrderService: OrderService & { __reset: () => void } = {
  async placeOrder(input: PlaceOrderInput) {
    const order: Order = {
      id: genId(),
      tableId: input.tableId,
      tableNumber: input.tableNumber,
      customer: input.customer,
      lines: input.lines,
      status: "received",
      placedAt: Date.now(),
      subtotal: input.subtotal,
      gst: input.gst,
      serviceCharge: input.serviceCharge,
      total: input.total,
      specialRequests: [],
    };
    orders.set(order.id, order);
    recordOrder(order);
    return order;
  },

  async getOrder(id) {
    return orders.get(id);
  },

  async getActiveOrder(tableId, customer) {
    for (const order of orders.values()) {
      if (
        order.tableId === tableId &&
        order.customer.mobile === customer.mobile &&
        ACTIVE_STATUSES.includes(order.status)
      ) {
        return order;
      }
    }
    return undefined;
  },

  subscribeToStatus(orderId, cb) {
    const timers: ReturnType<typeof setTimeout>[] = [];
    let elapsed = 0;
    for (const t of TRANSITIONS) {
      elapsed += t.after;
      const handle = setTimeout(() => {
        const order = orders.get(orderId);
        if (!order) return;
        order.status = t.status;
        orders.set(orderId, order);
        cb(t.status);
      }, elapsed);
      timers.push(handle);
    }
    return () => timers.forEach(clearTimeout);
  },

  async requestBill(orderId) {
    const order = orders.get(orderId);
    if (order) {
      order.status = "billed";
      orders.set(orderId, order);
    }
  },

  async requestAssistance(orderId, type) {
    const order = orders.get(orderId);
    if (order) {
      order.specialRequests = [...(order.specialRequests ?? []), type];
      orders.set(orderId, order);
    }
  },

  __reset() {
    orders.clear();
    counter = 0;
  },
};
```

- [ ] **Step 7: Run test to verify it passes**

```bash
npx vitest run src/services/mock/mockOrderService.test.ts
```
Expected: 5 passed.

- [ ] **Step 8: Verify the whole tree type-checks (services/index.ts now resolves)**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A
git commit -m "feat(services): add swappable service interfaces and mock implementations"
```

---

## Task 7: Zustand stores (TDD for cart)

**Files:**
- Create: `src/stores/session.store.ts`, `src/stores/cart.store.ts`, `src/stores/order.store.ts`, `src/stores/feedback.store.ts`
- Test: `src/stores/cart.store.test.ts`

- [ ] **Step 1: Write `session.store.ts`**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customer } from "@/services/types";

interface SessionState {
  customer: Customer | null;
  setCustomer: (c: Customer) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      customer: null,
      setCustomer: (c) => set({ customer: c }),
      clear: () => set({ customer: null }),
    }),
    { name: "dineflow-session" }
  )
);
```

- [ ] **Step 2: Write the failing cart store test**

`src/stores/cart.store.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore } from "./cart.store";
import type { AddOn, MenuItem } from "@/services/types";
import { cartLineId } from "@/lib/id";

const item: MenuItem = {
  id: "mi-1", categoryId: "c", name: "Paneer", description: "", price: 200,
  image: "", vegType: "veg", available: true,
};
const extra: AddOn = { id: "x", name: "X", price: 30 };

describe("cart store", () => {
  beforeEach(() => useCartStore.getState().clear());

  it("adds a line with computed unit price and id", () => {
    useCartStore.getState().addFromItem(item, 1, [extra], "");
    const { lines } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].unitPrice).toBe(230);
    expect(lines[0].id).toBe(cartLineId("mi-1", ["x"]));
  });

  it("merges quantity for identical customization", () => {
    useCartStore.getState().addFromItem(item, 1, [extra], "");
    useCartStore.getState().addFromItem(item, 2, [extra], "");
    const { lines, count } = useCartStore.getState();
    expect(lines).toHaveLength(1);
    expect(lines[0].quantity).toBe(3);
    expect(count).toBe(3);
  });

  it("keeps separate lines for different customization", () => {
    useCartStore.getState().addFromItem(item, 1, [extra], "");
    useCartStore.getState().addFromItem(item, 1, [], "");
    expect(useCartStore.getState().lines).toHaveLength(2);
  });

  it("computes subtotal correctly", () => {
    useCartStore.getState().addFromItem(item, 2, [extra], ""); // 230*2
    expect(useCartStore.getState().subtotal).toBe(460);
  });

  it("removes a line", () => {
    useCartStore.getState().addFromItem(item, 1, [extra], "");
    const id = useCartStore.getState().lines[0].id;
    useCartStore.getState().removeLine(id);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd dineflow-os && npx vitest run src/stores/cart.store.test.ts
```
Expected: FAIL — module not found.

- [ ] **Step 4: Write `cart.store.ts`**

```ts
import { create } from "zustand";
import type { AddOn, CartLine, MenuItem } from "@/services/types";
import { cartLineId } from "@/lib/id";

interface CartState {
  lines: CartLine[];
  addFromItem: (item: MenuItem, quantity: number, addOns: AddOn[], instructions: string) => void;
  updateQty: (lineId: string, delta: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

export const useCartStore = create<CartState>((set, get) => {
  const recompute = (lines: CartLine[]) => ({
    lines,
    count: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal: lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
  });

  return {
    lines: [],
    count: 0,
    subtotal: 0,

    addFromItem(item, quantity, addOns, instructions) {
      const selectedAddOns = addOns.filter((a) => a.selected !== false);
      const id = cartLineId(
        item.id,
        selectedAddOns.map((a) => a.id)
      );
      const unitPrice = item.price + selectedAddOns.reduce((s, a) => s + a.price, 0);
      const existing = get().lines;
      const match = existing.find((l) => l.id === id);
      let lines: CartLine[];
      if (match) {
        lines = existing.map((l) =>
          l.id === id ? { ...l, quantity: l.quantity + quantity } : l
        );
      } else {
        const line: CartLine = {
          id, itemId: item.id, name: item.name, basePrice: item.price,
          selectedAddOns, quantity, instructions: instructions || undefined, unitPrice,
        };
        lines = [...existing, line];
      }
      set(recompute(lines));
    },

    updateQty(lineId, delta) {
      const lines = get()
        .lines.map((l) =>
          l.id === lineId ? { ...l, quantity: l.quantity + delta } : l
        )
        .filter((l) => l.quantity > 0);
      set(recompute(lines));
    },

    removeLine(lineId) {
      set(recompute(get().lines.filter((l) => l.id !== lineId)));
    },

    clear() {
      set(recompute([]));
    },
  };
});
```

- [ ] **Step 5: Run test to verify it passes**

```bash
npx vitest run src/stores/cart.store.test.ts
```
Expected: 5 passed.

- [ ] **Step 6: Write `order.store.ts`**

```ts
import { create } from "zustand";
import { services } from "@/services";
import { restaurant } from "@/data/restaurant";
import { tables } from "@/data/tables";
import type { Order, OrderStatus, AssistanceType, Customer } from "@/services/types";

interface OrderState {
  activeOrder: Order | null;
  pastOrders: Order[];
  loadActive: (tableId: string, customer: Customer) => Promise<void>;
  placeFromCart: (input: {
    tableId: string;
    customer: Customer;
    lines: Order["lines"];
    subtotal: number;
  }) => Promise<Order>;
  subscribe: (orderId: string) => () => void;
  setStatus: (status: OrderStatus) => void;
  setOrder: (order: Order) => void;
  loadHistory: (customer: Customer) => Promise<void>;
  requestAssistance: (type: AssistanceType) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  activeOrder: null,
  pastOrders: [],

  async loadActive(tableId, customer) {
    const active = await services.order.getActiveOrder(tableId, customer);
    set({ activeOrder: active ?? null });
  },

  async placeFromCart({ tableId, customer, lines, subtotal }) {
    const table = tables.find((t) => t.id === tableId)!;
    const gst = +(subtotal * (restaurant.gstPercent / 100)).toFixed(2);
    const serviceCharge = +(subtotal * (restaurant.serviceChargePercent / 100)).toFixed(2);
    const total = +(subtotal + gst + serviceCharge).toFixed(2);
    const order = await services.order.placeOrder({
      tableId, tableNumber: table.number, customer, lines,
      subtotal, gst, serviceCharge, total,
    });
    set({ activeOrder: order });
    return order;
  },

  subscribe(orderId) {
    return services.order.subscribeToStatus(orderId, (status) => {
      const cur = get().activeOrder;
      if (cur && cur.id === orderId) {
        set({ activeOrder: { ...cur, status } });
      }
    });
  },

  setStatus(status) {
    const cur = get().activeOrder;
    if (cur) set({ activeOrder: { ...cur, status } });
  },

  setOrder(order) {
    set({ activeOrder: order });
  },

  async loadHistory(customer) {
    const pastOrders = await services.customer.getHistory(customer);
    set({ pastOrders });
  },

  async requestAssistance(type) {
    const cur = get().activeOrder;
    if (!cur) return;
    await services.order.requestAssistance(cur.id, type);
    set({
      activeOrder: {
        ...cur,
        specialRequests: [...(cur.specialRequests ?? []), type],
      },
    });
  },
}));
```

- [ ] **Step 7: Write `feedback.store.ts`**

```ts
import { create } from "zustand";
import { services } from "@/services";
import type { Feedback } from "@/services/types";

interface FeedbackState {
  submit: (feedback: Feedback) => Promise<void>;
}

export const useFeedbackStore = create<FeedbackState>(() => ({
  async submit(feedback) {
    await services.customer.submitFeedback(feedback);
  },
}));
```

- [ ] **Step 8: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(stores): add session, cart (tested), order, feedback stores"
```

---

## Task 8: shadcn-style UI primitives

**Files:**
- Create: `src/components/ui/button.tsx`, `card.tsx`, `input.tsx`, `textarea.tsx`, `badge.tsx`, `separator.tsx`, `sheet.tsx`, `label.tsx`, `skeleton.tsx`
- Create: `components.json`

shadcn is normally installed via CLI, but the CLI scaffolds into the chosen framework. Since we are not using Next, we'll author the handful of primitives we need by hand following shadcn conventions (this avoids CLI framework-detection friction).

- [ ] **Step 1: Write `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/styles/theme.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": { "components": "@/components", "ui": "@/components/ui", "lib": "@/lib" }
}
```

- [ ] **Step 2: Write `button.tsx`**

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground hover:bg-accent/90",
        outline: "border border-border bg-transparent hover:bg-surface-2",
        ghost: "hover:bg-surface-2",
        secondary: "bg-surface-2 text-foreground hover:bg-surface-2/80",
        destructive: "bg-danger text-white hover:bg-danger/90",
      },
      size: { default: "h-11 px-5", sm: "h-9 px-3", lg: "h-12 px-6 text-base", icon: "h-11 w-11" },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";
export { buttonVariants };
```

- [ ] **Step 3: Write `card.tsx`**

```tsx
import * as React from "react";
import { cn } from "@/lib/cn";

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-lg bg-surface border border-border", className)} {...props} />
  )
);
Card.displayName = "Card";
export const CardHeader = (p: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 p-4", p.className)} {...p} />
);
export const CardContent = (p: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-4 pt-0", p.className)} {...p} />
);
```

- [ ] **Step 4: Write `input.tsx`, `textarea.tsx`, `label.tsx`, `badge.tsx`, `separator.tsx`, `skeleton.tsx`**

`input.tsx`:
```tsx
import * as React from "react";
import { cn } from "@/lib/cn";
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-md bg-surface-2 border border-border px-3 text-base text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:border-accent",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
```

`textarea.tsx`:
```tsx
import * as React from "react";
import { cn } from "@/lib/cn";
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "flex min-h-[88px] w-full rounded-md bg-surface-2 border border-border px-3 py-2 text-base text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:border-accent",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
```

`label.tsx`:
```tsx
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/cn";
export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn("text-sm font-medium text-muted", className)}
    {...props}
  />
));
Label.displayName = "Label";
```

`badge.tsx`:
```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
  variants: {
    variant: {
      default: "bg-accent/15 text-accent",
      outline: "border border-border text-muted",
      success: "bg-success/15 text-success",
      danger: "bg-danger/15 text-danger",
    },
  },
  defaultVariants: { variant: "default" },
});
export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}
export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
```

`separator.tsx`:
```tsx
import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/cn";
export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
    {...props}
  />
));
Separator.displayName = "Separator";
```

`skeleton.tsx`:
```tsx
import { cn } from "@/lib/cn";
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-surface-2", className)} {...props} />;
}
```

- [ ] **Step 5: Write `sheet.tsx` (bottom sheet via Radix Dialog)**

```tsx
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 rounded-t-2xl bg-surface border-t border-border p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        className
      )}
      {...props}
    >
      <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1 text-muted hover:text-foreground">
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export const SheetTitle = ({ children }: { children: React.ReactNode }) => (
  <DialogPrimitive.Title className="font-serif text-lg text-foreground">{children}</DialogPrimitive.Title>
);
```

> Note: `animate-in/out`, `fade-in`, `slide-in-from-bottom` are provided by `tailwindcss-animate`. Add it next step.

- [ ] **Step 6: Install `tailwindcss-animate` and wire it**

```bash
npm install -D tailwindcss-animate
```
Add to `tailwind.config.ts` `plugins`:
```ts
import animate from "tailwindcss-animate";
// ...
plugins: [animate],
```

- [ ] **Step 7: Type-check + dev run**

```bash
npx tsc --noEmit && npm run dev
```
Expected: no type errors; dev server runs. Ctrl-C.

- [ ] **Step 8: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(ui): add shadcn-style primitives (button, card, input, sheet, …)"
```

---

## Task 9: Shared customer components + app shell + router

**Files:**
- Create: `src/features/customer/components/VegMark.tsx`, `SpiceDots.tsx`, `Rating.tsx`, `BadgeRow.tsx`, `CartBar.tsx`, `TopBar.tsx`, `AppLayout.tsx`
- Create: `src/app/router.tsx`, `src/app/routes.tsx`

- [ ] **Step 1: Write small presentational components**

`VegMark.tsx`:
```tsx
import { cn } from "@/lib/cn";
import type { VegType } from "@/services/types";
export function VegMark({ type, className }: { type: VegType; className?: string }) {
  const color =
    type === "veg" ? "border-success" : type === "egg" ? "border-accent" : "border-danger";
  const dot = type === "veg" ? "bg-success" : type === "egg" ? "bg-accent" : "bg-danger";
  return (
    <span className={cn("inline-flex h-4 w-4 items-center justify-center rounded-sm border bg-background", color, className)}>
      <span className={cn("h-2 w-2 rounded-full", dot)} />
    </span>
  );
}
```

`SpiceDots.tsx`:
```tsx
import { Flame } from "lucide-react";
export function SpiceDots({ level }: { level: number }) {
  if (!level) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-danger">
      {Array.from({ length: level }).map((_, i) => (
        <Flame key={i} className="h-3 w-3" />
      ))}
    </span>
  );
}
```

`Rating.tsx`:
```tsx
import { Star } from "lucide-react";
export function Rating({ value }: { value?: number }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted">
      <Star className="h-3 w-3 fill-accent text-accent" /> {value.toFixed(1)}
    </span>
  );
}
```

`BadgeRow.tsx`:
```tsx
import { Badge } from "@/components/ui/badge";
import type { Badge as B } from "@/services/types";
const LABELS: Record<B, string> = {
  bestseller: "Bestseller",
  "chef-recommendation": "Chef's Pick",
  popular: "Popular",
  new: "New",
};
export function BadgeRow({ badges }: { badges?: B[] }) {
  if (!badges?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <Badge key={b} variant={b === "new" ? "success" : "default"}>
          {LABELS[b]}
        </Badge>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write `TopBar.tsx` (shared header with back + title)**

```tsx
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export function TopBar({
  title, onBack, right,
}: { title?: string; onBack?: () => void; right?: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur">
      <button onClick={() => (onBack ? onBack() : navigate(-1))} className="rounded-full p-2 text-foreground hover:bg-surface-2">
        <ChevronLeft className="h-5 w-5" />
      </button>
      {title && <h2 className="font-serif text-base">{title}</h2>}
      <div className="ml-auto">{right}</div>
    </header>
  );
}
```

- [ ] **Step 3: Write `CartBar.tsx` (sticky bottom bar)**

```tsx
import { useNavigate, useParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { formatCurrency } from "@/lib/format";

export function CartBar() {
  const { tableId = "" } = useParams();
  const navigate = useNavigate();
  const { count, subtotal } = useCartStore();
  if (count === 0) return null;
  return (
    <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <button
        onClick={() => navigate(`/table/${tableId}/cart`)}
        className="flex w-full items-center justify-between rounded-xl bg-accent px-5 py-3.5 text-accent-foreground shadow-lg"
      >
        <span className="flex items-center gap-2 font-medium">
          <ShoppingBag className="h-5 w-5" /> {count} item{count > 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-2 font-semibold">
          {formatCurrency(subtotal)} →
        </span>
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Write `AppLayout.tsx` (mobile frame + page transitions + AssistanceSheet + CartBar)**

```tsx
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CartBar } from "./CartBar";
import { AssistanceSheet } from "../assistance/AssistanceSheet";

export function AppLayout() {
  const location = useLocation();
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-background">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex-1 pb-28"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <CartBar />
      <AssistanceSheet />
    </div>
  );
}
```

- [ ] **Step 5: Write `src/app/routes.tsx` (route table; pages created in later tasks as stubs that we flesh out)**

To keep the tree compiling, create each page as a minimal placeholder now; full implementation is the dedicated task. Write `routes.tsx`:

```tsx
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/features/customer/components/AppLayout";
import { WelcomePage } from "@/features/customer/welcome/WelcomePage";
import { TableLandingPage } from "@/features/customer/table/TableLandingPage";
import { MenuPage } from "@/features/customer/menu/MenuPage";
import { ItemDetailPage } from "@/features/customer/item-detail/ItemDetailPage";
import { CartPage } from "@/features/customer/cart/CartPage";
import { OrderTrackingPage } from "@/features/customer/order-tracking/OrderTrackingPage";
import { BillPage } from "@/features/customer/bill/BillPage";
import { FeedbackPage } from "@/features/customer/feedback/FeedbackPage";
import { HistoryPage } from "@/features/customer/history/HistoryPage";

export const AppRoutes = (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<WelcomePage />} />
      <Route path="table/:tableId" element={<TableLandingPage />} />
      <Route path="table/:tableId/menu" element={<MenuPage />} />
      <Route path="table/:tableId/item/:itemId" element={<ItemDetailPage />} />
      <Route path="table/:tableId/cart" element={<CartPage />} />
      <Route path="table/:tableId/order/:orderId" element={<OrderTrackingPage />} />
      <Route path="table/:tableId/order/:orderId/bill" element={<BillPage />} />
      <Route path="table/:tableId/order/:orderId/feedback" element={<FeedbackPage />} />
      <Route path="table/:tableId/history" element={<HistoryPage />} />
    </Route>
  </Routes>
);
```

- [ ] **Step 6: Write `src/app/router.tsx`**

```tsx
import { createBrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";

export const router = createBrowserRouter([{ path: "*", element: AppRoutes }]);
```

- [ ] **Step 7: Create minimal page stubs so the tree compiles**

For each page file referenced above, create a stub exporting a named component, e.g. `src/features/customer/welcome/WelcomePage.tsx`:
```tsx
export function WelcomePage() { return <div />; }
```
Repeat for the other eight pages (TableLandingPage, MenuPage, ItemDetailPage, CartPage, OrderTrackingPage, BillPage, FeedbackPage, HistoryPage). Real implementations replace these in subsequent tasks.

- [ ] **Step 8: Type-check + dev run**

```bash
npx tsc --noEmit && npm run dev
```
Expected: compiles; loads blank layout. Ctrl-C.

- [ ] **Step 9: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(app): shared customer components, app shell, router with page stubs"
```

---

## Task 10: WelcomePage

**Files:**
- Modify: `src/features/customer/welcome/WelcomePage.tsx`

- [ ] **Step 1: Implement the Welcome page**

```tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "@/stores/session.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WelcomePage() {
  const navigate = useNavigate();
  const setCustomer = useSessionStore((s) => s.setCustomer);
  const existing = useSessionStore((s) => s.customer);
  const [name, setName] = useState(existing?.name ?? "");
  const [mobile, setMobile] = useState(existing?.mobile ?? "");
  const [error, setError] = useState("");

  const valid = name.trim().length >= 2 && /^\d{10}$/.test(mobile);

  function begin() {
    if (!valid) {
      setError("Enter your name and a 10-digit mobile number.");
      return;
    }
    setCustomer({ name: name.trim(), mobile });
    navigate("/table/tbl-12"); // demo: default table; QR would encode this
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-end overflow-hidden">
      <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
        alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="relative z-10 p-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <p className="font-serif text-3xl leading-tight text-foreground">Saffron &amp; Smoke</p>
        <p className="mt-1 text-sm text-muted">Modern Indian Fine Dining</p>
        <div className="mt-8 space-y-3">
          <div>
            <Label htmlFor="name">Your name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ana" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="mobile">Mobile number</Label>
            <Input id="mobile" inputMode="numeric" value={mobile} maxLength={10}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} placeholder="10-digit number" className="mt-1" />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button className="w-full" size="lg" disabled={!valid} onClick={begin}>Begin</Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in dev**

```bash
npm run dev
```
Open the URL; the welcome screen shows with hero image, inputs enable the button only when valid. Ctrl-C.

- [ ] **Step 3: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(customer): WelcomePage with name + mobile entry"
```

---

## Task 11: TableLandingPage + active-order detection

**Files:**
- Modify: `src/features/customer/table/TableLandingPage.tsx`

- [ ] **Step 1: Implement TableLanding with active-order banner**

```tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { services } from "@/services";
import { useSessionStore } from "@/stores/session.store";
import { useOrderStore } from "@/stores/order.store";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Restaurant, Table } from "@/services/types";

export function TableLandingPage() {
  const { tableId = "" } = useParams();
  const navigate = useNavigate();
  const customer = useSessionStore((s) => s.customer);
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const loadActive = useOrderStore((s) => s.loadActive);
  const [table, setTable] = useState<Table | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    services.menu.getRestaurant().then(setRestaurant);
    services.order // resolve table number from menu service tables mock via data import
    import("@/data/tables").then(({ tables }) =>
      setTable(tables.find((t) => t.id === tableId) ?? null)
    );
    if (customer) loadActive(tableId, customer);
  }, [tableId, customer, loadActive]);

  if (!customer) {
    // safety: bounce to welcome
    navigate("/");
    return null;
  }

  return (
    <div className="relative min-h-screen">
      {restaurant && (
        <img src={restaurant.heroUrl} alt="" className="absolute inset-0 h-72 w-full object-cover opacity-60" />
      )}
      <div className="absolute top-0 h-72 w-full bg-gradient-to-b from-transparent to-background" />
      <div className="relative z-10 p-6 pt-40">
        {restaurant ? (
          <>
            <p className="font-serif text-3xl">{restaurant.name}</p>
            <p className="text-sm text-muted">{restaurant.tagline}</p>
          </>
        ) : (
          <Skeleton className="h-9 w-56" />
        )}

        <div className="mt-8 rounded-xl border border-border bg-surface p-5">
          <p className="text-xs uppercase tracking-widest text-muted">Seated at</p>
          <p className="font-serif text-2xl">Table {table?.number ?? "—"}</p>
          <p className="text-sm text-muted">{table?.seats ?? "—"} seats</p>
        </div>

        {activeOrder && (
          <button
            onClick={() => navigate(`/table/${tableId}/order/${activeOrder.id}`)}
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-accent/40 bg-accent/10 p-4 text-left"
          >
            <div>
              <p className="text-sm font-medium text-accent">You have an active order</p>
              <p className="text-xs text-muted">Status: {activeOrder.status}</p>
            </div>
            <span className="text-accent">Track →</span>
          </button>
        )}

        <div className="mt-6 grid gap-3">
          <Button size="lg" onClick={() => navigate(`/table/${tableId}/menu`)}>
            {activeOrder ? "Add more items" : "View Menu"}
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/table/${tableId}/history`)}>
            Order history
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in dev**

```bash
npm run dev
```
Flow: welcome → table landing shows table 12, no active order, "View Menu". Ctrl-C.

- [ ] **Step 3: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(customer): TableLandingPage with active-order detection"
```

---

## Task 12: MenuPage (category rail, search, filters, item cards)

**Files:**
- Modify: `src/features/customer/menu/MenuPage.tsx`

- [ ] **Step 1: Implement the Menu page**

```tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import { services } from "@/services";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";
import { VegMark } from "../components/VegMark";
import { SpiceDots } from "../components/SpiceDots";
import { Rating } from "../components/Rating";
import { BadgeRow } from "../components/BadgeRow";
import type { Category, MenuItem, VegType } from "@/services/types";

export function MenuPage() {
  const { tableId = "" } = useParams();
  const navigate = useNavigate();
  const [cats, setCats] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [vegFilter, setVegFilter] = useState<"all" | VegType>("all");
  const [activeCat, setActiveCat] = useState<string>("");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    Promise.all([services.menu.getCategories(), services.menu.getMenuItems()]).then(
      ([c, i]) => {
        setCats(c);
        setItems(i);
        setActiveCat(c[0]?.id ?? "");
        setLoading(false);
      }
    );
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchesQuery =
        !query ||
        it.name.toLowerCase().includes(query.toLowerCase()) ||
        (it.description ?? "").toLowerCase().includes(query.toLowerCase());
      const matchesVeg = vegFilter === "all" || it.vegType === vegFilter;
      return matchesQuery && matchesVeg;
    });
  }, [items, query, vegFilter]);

  // Scroll spy: set active category as user scrolls.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveCat((e.target as HTMLElement).dataset.cat ?? "");
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [cats, loading]);

  function scrollToCat(id: string) {
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-30 space-y-3 border-b border-border bg-background/90 p-4 backdrop-blur">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search dishes…" className="pl-9" />
        </div>
        <div className="flex gap-2 text-sm">
          {(["all", "veg", "non-veg", "egg"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVegFilter(v)}
              className={`rounded-full border px-3 py-1 capitalize ${
                vegFilter === v ? "border-accent text-accent" : "border-border text-muted"
              }`}
            >
              {v === "all" ? "All" : v}
            </button>
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {cats.map((c) => (
            <button
              key={c.id}
              onClick={() => scrollToCat(c.id)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-sm ${
                activeCat === c.id ? "bg-accent text-accent-foreground" : "bg-surface-2 text-muted"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {cats.map((c) => {
          const list = filtered.filter((i) => i.categoryId === c.id);
          if (!list.length) return null;
          return (
            <section
              key={c.id}
              data-cat={c.id}
              ref={(el) => { sectionRefs.current[c.id] = el; }}
              className="mb-8 scroll-mt-44"
            >
              <h2 className="mb-3 font-serif text-xl">{c.name}</h2>
              <div className="space-y-3">
                {list.map((it) => (
                  <button
                    key={it.id}
                    disabled={!it.available}
                    onClick={() => navigate(`/table/${tableId}/item/${it.id}`)}
                    className="flex w-full gap-3 rounded-xl border border-border bg-surface p-3 text-left disabled:opacity-50"
                  >
                    <img src={it.image} alt={it.name} className="h-20 w-20 flex-shrink-0 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <VegMark type={it.vegType} />
                        <span className="truncate font-medium">{it.name}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">{it.description}</p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <Rating value={it.rating} />
                        <SpiceDots level={it.spiceLevel ?? 0} />
                        {it.prepMinutes && <span className="text-xs text-muted">{it.prepMinutes} min</span>}
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <BadgeRow badges={it.badges} />
                        <span className="font-semibold">{formatCurrency(it.price)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
        {!filtered.length && <p className="py-10 text-center text-muted">No dishes match your search.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in dev**

```bash
npm run dev
```
Menu renders with search, filters, sticky category rail, scroll spy, item cards, sticky cart bar after adding. Ctrl-C.

- [ ] **Step 3: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(customer): MenuPage with search, filters, category rail, scroll spy"
```

---

## Task 13: ItemDetailPage (customization + add to cart)

**Files:**
- Modify: `src/features/customer/item-detail/ItemDetailPage.tsx`

- [ ] **Step 1: Implement item detail + add-on selection + validation**

```tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { services } from "@/services";
import { useCartStore } from "@/stores/cart.store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TopBar } from "../components/TopBar";
import { VegMark } from "../components/VegMark";
import { SpiceDots } from "../components/SpiceDots";
import { Rating } from "../components/Rating";
import { BadgeRow } from "../components/BadgeRow";
import { formatCurrency } from "@/lib/format";
import type { AddOn, AddOnGroup, MenuItem } from "@/services/types";

export function ItemDetailPage() {
  const { itemId = "", tableId = "" } = useParams();
  const navigate = useNavigate();
  const addFromItem = useCartStore((s) => s.addFromItem);
  const [item, setItem] = useState<MenuItem | null>(null);
  const [groups, setGroups] = useState<AddOnGroup[]>([]);
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    services.menu.getItem(itemId).then((it) => {
      if (!it) return;
      setItem(it);
      setGroups((it.addOnGroups ?? []).map((g) => structuredClone(g)));
    });
  }, [itemId]);

  const selectedByGroup = useMemo(
    () => groups.map((g) => g.options.filter((o) => o.selected)),
    [groups]
  );

  const errors = useMemo(() => {
    const errs: Record<string, boolean> = {};
    groups.forEach((g, i) => {
      if (g.required && selectedByGroup[i].length < g.min) errs[g.id] = true;
    });
    return errs;
  }, [groups, selectedByGroup]);

  const valid = Object.keys(errors).length === 0;

  if (!item) return <TopBar title="Loading…" />;

  const selectedAddOns: AddOn[] = selectedByGroup.flat();
  const addOnTotal = selectedAddOns.reduce((s, a) => s + a.price, 0);
  const unitPrice = item.price + addOnTotal;

  function toggle(groupId: string, optId: string, max: number) {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const opts = g.options.map((o) => ({ ...o }));
        const target = opts.find((o) => o.id === optId)!;
        const selectedCount = opts.filter((o) => o.selected).length;
        if (target.selected) {
          target.selected = false;
        } else {
          if (max === 1) opts.forEach((o) => (o.selected = false));
          else if (selectedCount >= max) return g; // respect max
          target.selected = true;
        }
        return { ...g, options: opts };
      })
    );
  }

  function add() {
    if (!valid || !item) return;
    addFromItem(item, qty, selectedAddOns, instructions);
    navigate(`/table/${tableId}/menu`);
  }

  return (
    <div className="pb-32">
      <div className="relative">
        <img src={item.image} alt={item.name} className="h-64 w-full object-cover" />
        <div className="absolute top-0 h-full w-full bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0"><TopBar /></div>
      </div>

      <div className="-mt-10 relative z-10 space-y-4 p-5">
        <div className="flex items-center gap-2">
          <VegMark type={item.vegType} />
          <h1 className="font-serif text-2xl">{item.name}</h1>
        </div>
        <p className="text-sm text-muted">{item.description}</p>
        <div className="flex items-center gap-3">
          <Rating value={item.rating} />
          <SpiceDots level={item.spiceLevel ?? 0} />
          {item.calories && <span className="text-xs text-muted">{item.calories} kcal</span>}
        </div>
        <BadgeRow badges={item.badges} />
        {item.ingredients && (
          <p className="text-xs text-muted">Ingredients: {item.ingredients.join(", ")}</p>
        )}
        <p className="font-serif text-xl">{formatCurrency(item.price)}</p>
      </div>

      {groups.map((g) => (
        <div key={g.id} className="border-t border-border px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">{g.name}{g.required ? " *" : ""}</p>
            <span className="text-xs text-muted">
              {g.required ? `Min ${g.min}` : `Up to ${g.max}`}
            </span>
          </div>
          {errors[g.id] && (
            <p className="mt-1 text-xs text-danger">Please select at least {g.min}.</p>
          )}
          <div className="mt-2 space-y-2">
            {g.options.map((o) => (
              <label key={o.id} className="flex cursor-pointer items-center justify-between rounded-lg bg-surface px-3 py-2.5">
                <span className="flex items-center gap-3">
                  <input
                    type={g.max === 1 ? "radio" : "checkbox"}
                    name={g.id}
                    checked={!!o.selected}
                    onChange={() => toggle(g.id, o.id, g.max)}
                    className="h-4 w-4 accent-[hsl(var(--accent))]"
                  />
                  <span>{o.name}</span>
                </span>
                {o.price > 0 && <span className="text-sm text-muted">+{formatCurrency(o.price)}</span>}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t border-border px-5 py-4">
        <p className="font-medium">Special instructions</p>
        <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. No onions" className="mt-2" />
      </div>

      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border px-2">
            <button className="px-2 py-2 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span className="w-6 text-center">{qty}</span>
            <button className="px-2 py-2 text-lg" onClick={() => setQty((q) => q + 1)}>+</button>
          </div>
          <Button className="flex-1" size="lg" disabled={!valid} onClick={add}>
            Add · {formatCurrency(unitPrice * qty)}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in dev**

```bash
npm run dev
```
Tap a dish: detail opens, select add-ons, required group enforces min, Add reflects price, returns to menu with cart bar populated. Ctrl-C.

- [ ] **Step 3: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(customer): ItemDetailPage with customization, validation, add to cart"
```

---

## Task 14: CartPage + place order

**Files:**
- Modify: `src/features/customer/cart/CartPage.tsx`

- [ ] **Step 1: Implement cart with charges breakdown and place order**

```tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCartStore } from "@/stores/cart.store";
import { useSessionStore } from "@/stores/session.store";
import { useOrderStore } from "@/stores/order.store";
import { restaurant } from "@/data/restaurant";
import { TopBar } from "../components/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";

const DEMO_COUPON = { code: "WELCOME10", percent: 10 };

export function CartPage() {
  const { tableId = "" } = useParams();
  const navigate = useNavigate();
  const { lines, subtotal, updateQty, removeLine, clear } = useCartStore();
  const customer = useSessionStore((s) => s.customer)!;
  const placeFromCart = useOrderStore((s) => s.placeFromCart);
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState(0); // discount amount

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === DEMO_COUPON.code) {
      setApplied(+(subtotal * (DEMO_COUPON.percent / 100)).toFixed(2));
    } else {
      setApplied(0);
    }
  }

  const afterDiscount = Math.max(0, subtotal - applied);
  const gst = +(afterDiscount * (restaurant.gstPercent / 100)).toFixed(2);
  const serviceCharge = +(afterDiscount * (restaurant.serviceChargePercent / 100)).toFixed(2);
  const total = +(afterDiscount + gst + serviceCharge).toFixed(2);

  async function place() {
    if (!lines.length) return;
    const order = await placeFromCart({ tableId, customer, lines, subtotal: afterDiscount });
    clear();
    navigate(`/table/${tableId}/order/${order.id}`);
  }

  return (
    <div className="pb-40">
      <TopBar title="Your Cart" right={lines.length ? <button onClick={clear} className="text-xs text-muted">Clear</button> : undefined} />
      <div className="p-4">
        {lines.length === 0 ? (
          <p className="py-20 text-center text-muted">Your cart is empty.</p>
        ) : (
          <div className="space-y-3">
            {lines.map((l) => (
              <div key={l.id} className="flex gap-3 rounded-xl border border-border bg-surface p-3">
                <div className="flex-1">
                  <p className="font-medium">{l.name}</p>
                  {l.selectedAddOns.length > 0 && (
                    <p className="text-xs text-muted">{l.selectedAddOns.map((a) => a.name).join(", ")}</p>
                  )}
                  {l.instructions && <p className="text-xs italic text-muted">“{l.instructions}”</p>}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-md border border-border px-1.5">
                      <button onClick={() => updateQty(l.id, -1)} className="px-1.5 py-1">−</button>
                      <span className="w-5 text-center text-sm">{l.quantity}</span>
                      <button onClick={() => updateQty(l.id, 1)} className="px-1.5 py-1">+</button>
                    </div>
                    <button onClick={() => removeLine(l.id)} className="text-xs text-danger">Remove</button>
                    <span className="ml-auto text-sm">{formatCurrency(l.unitPrice * l.quantity)}</span>
                  </div>
                </div>
              </div>
            ))}

            <Separator className="my-2" />
            <div className="flex gap-2">
              <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon (try WELCOME10)" />
              <Button variant="outline" onClick={applyCoupon}>Apply</Button>
            </div>

            <div className="space-y-1.5 rounded-xl bg-surface p-4 text-sm">
              <Row label="Subtotal" value={formatCurrency(subtotal)} />
              {applied > 0 && <Row label="Discount" value={`− ${formatCurrency(applied)}`} accent />}
              <Row label={`GST (${restaurant.gstPercent}%)`} value={formatCurrency(gst)} />
              <Row label={`Service (${restaurant.serviceChargePercent}%)`} value={formatCurrency(serviceCharge)} />
              <Separator className="my-2" />
              <div className="flex justify-between font-serif text-lg">
                <span>Total</span><span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {lines.length > 0 && (
        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button className="w-full" size="lg" onClick={place}>Place Order · {formatCurrency(total)}</Button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className={accent ? "text-accent" : ""}>{value}</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify in dev**

```bash
npm run dev
```
Add items, open cart, apply WELCOME10, see discount + taxes, place order → routes to tracking, cart clears. Ctrl-C.

- [ ] **Step 3: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(customer): CartPage with coupon, charges breakdown, place order"
```

---

## Task 15: OrderTrackingPage (status timeline + simulated progression)

**Files:**
- Modify: `src/features/customer/order-tracking/OrderTrackingPage.tsx`

- [ ] **Step 1: Implement order tracking**

```tsx
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { services } from "@/services";
import { useOrderStore } from "@/stores/order.store";
import { TopBar } from "../components/TopBar";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { Check } from "lucide-react";

const STEPS = [
  { key: "received", label: "Order received" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready to serve" },
  { key: "served", label: "Served" },
] as const;

export function OrderTrackingPage() {
  const { tableId = "", orderId = "" } = useParams();
  const navigate = useNavigate();
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const setOrder = useOrderStore((s) => s.setOrder);
  const subscribe = useOrderStore((s) => s.subscribe);

  useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const o = await services.order.getOrder(orderId);
      if (o) setOrder(o);
      unsub = subscribe(orderId);
    })();
    return () => unsub?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (!activeOrder) return <TopBar title="Loading…" />;

  const currentIndex = STEPS.findIndex((s) => s.key === activeOrder.status);

  return (
    <div className="pb-40">
      <TopBar title={`Table ${activeOrder.tableNumber}`} />
      <div className="p-5">
        <p className="text-xs uppercase tracking-widest text-muted">Order status</p>
        <p className="font-serif text-2xl capitalize">{activeOrder.status}</p>

        <div className="mt-6 space-y-1">
          {STEPS.map((s, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            return (
              <div key={s.key} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                    done ? "border-success bg-success text-background" : active ? "border-accent bg-accent text-accent-foreground" : "border-border"
                  }`}>
                    {done ? <Check className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
                  </div>
                  {i < STEPS.length - 1 && <div className={`my-1 h-8 w-px ${done ? "bg-success" : "bg-border"}`} />}
                </div>
                <div className="pt-1">
                  <p className={active || done ? "font-medium" : "text-muted"}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 font-medium">Your order</p>
          {activeOrder.lines.map((l) => (
            <div key={l.id} className="flex justify-between text-sm">
              <span className="text-muted">{l.quantity}× {l.name}</span>
              <span>{formatCurrency(l.unitPrice * l.quantity)}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between font-serif">
            <span>Total</span><span>{formatCurrency(activeOrder.total)}</span>
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          <Button variant="outline" onClick={() => navigate(`/table/${tableId}/menu`)}>
            Add more items
          </Button>
          <Button onClick={() => navigate(`/table/${tableId}/order/${orderId}/bill`)}>
            Request Bill
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in dev**

```bash
npm run dev
```
Place an order; tracking shows Received, advances to Preparing/Ready/Served over ~33s. Wait or shorten timers to verify visually. Ctrl-C.

- [ ] **Step 3: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(customer): OrderTrackingPage with status timeline and live progression"
```

---

## Task 16: BillPage

**Files:**
- Modify: `src/features/customer/bill/BillPage.tsx`

- [ ] **Step 1: Implement bill view + simulated pay**

```tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { services } from "@/services";
import { useOrderStore } from "@/stores/order.store";
import { TopBar } from "../components/TopBar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/format";
import { CheckCircle2 } from "lucide-react";

export function BillPage() {
  const { tableId = "", orderId = "" } = useParams();
  const navigate = useNavigate();
  const activeOrder = useOrderStore((s) => s.activeOrder);
  const [paid, setPaid] = useState(false);

  async function pay() {
    await services.order.requestBill(orderId); // marks billed
    setPaid(true);
  }

  if (!activeOrder) return <TopBar title="Loading…" />;

  return (
    <div className="pb-40">
      <TopBar title="Bill" />
      <div className="p-5">
        <p className="font-serif text-xl">Saffron &amp; Smoke</p>
        <p className="text-xs text-muted">Table {activeOrder.tableNumber} · Order #{activeOrder.id.slice(-6)}</p>

        <div className="mt-4 rounded-xl border border-border bg-surface p-4 text-sm">
          {activeOrder.lines.map((l) => (
            <div key={l.id} className="flex justify-between py-1">
              <span className="text-muted">{l.quantity}× {l.name}</span>
              <span>{formatCurrency(l.unitPrice * l.quantity)}</span>
            </div>
          ))}
          <Separator className="my-3" />
          <Row label="Subtotal" value={formatCurrency(activeOrder.subtotal)} />
          <Row label="GST" value={formatCurrency(activeOrder.gst)} />
          <Row label="Service charge" value={formatCurrency(activeOrder.serviceCharge)} />
          <Separator className="my-3" />
          <div className="flex justify-between font-serif text-lg">
            <span>Total</span><span>{formatCurrency(activeOrder.total)}</span>
          </div>
        </div>

        {paid ? (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <CheckCircle2 className="h-14 w-14 text-success" />
            <p className="font-serif text-xl">Payment successful</p>
            <p className="text-sm text-muted">Thank you for dining with us.</p>
            <Button className="mt-3" onClick={() => navigate(`/table/${tableId}/order/${orderId}/feedback`)}>
              Rate your experience
            </Button>
          </div>
        ) : (
          <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 space-y-2 border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Button className="w-full" size="lg" onClick={pay}>Pay {formatCurrency(activeOrder.total)} Online</Button>
            <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
              Request bill at counter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-muted">{label}</span><span>{value}</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify in dev**

```bash
npm run dev
```
From tracking → Request Bill → Pay Online → success state → Rate. Ctrl-C.

- [ ] **Step 3: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(customer): BillPage with itemized bill and simulated pay"
```

---

## Task 17: AssistanceSheet (global floating actions)

**Files:**
- Modify: `src/features/customer/assistance/AssistanceSheet.tsx`

- [ ] **Step 1: Implement global assistance sheet + a trigger button**

```tsx
import { useState } from "react";
import { BellRing, GlassWater, Hand, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useOrderStore } from "@/stores/order.store";
import type { AssistanceType } from "@/services/types";
import { cn } from "@/lib/cn";

const ACTIONS: { type: AssistanceType; label: string; icon: React.ReactNode }[] = [
  { type: "waiter", label: "Call Waiter", icon: <BellRing className="h-5 w-5" /> },
  { type: "water", label: "Request Water", icon: <GlassWater className="h-5 w-5" /> },
  { type: "tissue", label: "Need Tissue", icon: <Sparkles className="h-5 w-5" /> },
];

export function AssistanceSheet() {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const requestAssistance = useOrderStore((s) => s.requestAssistance);
  const hasOrder = !!useOrderStore((s) => s.activeOrder);

  async function fire(type: AssistanceType, label: string) {
    if (!hasOrder) return;
    await requestAssistance(type);
    setOpen(false);
    setToast(`${label} requested`);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {hasOrder && (
            <button className="fixed bottom-24 right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-foreground shadow-lg border border-border">
              <Hand className="h-5 w-5" />
            </button>
          )}
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetTitle>Need assistance?</SheetTitle>
          <div className="mt-4 space-y-2">
            {ACTIONS.map((a) => (
              <button
                key={a.type}
                onClick={() => fire(a.type, a.label)}
                className="flex w-full items-center gap-3 rounded-xl bg-surface-2 p-4 text-left"
              >
                <span className="text-accent">{a.icon}</span>
                <span className="font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {toast && (
        <div className={cn(
          "fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-full bg-foreground px-4 py-2 text-sm text-background"
        )}>
          {toast}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify in dev**

```bash
npm run dev
```
With an active order, floating hand button appears → opens sheet → tapping an action shows a toast and records the request. Ctrl-C.

- [ ] **Step 3: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(customer): global AssistanceSheet (waiter/water/tissue)"
```

---

## Task 18: FeedbackPage

**Files:**
- Modify: `src/features/customer/feedback/FeedbackPage.tsx`

- [ ] **Step 1: Implement star feedback**

```tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star } from "lucide-react";
import { useFeedbackStore } from "@/stores/feedback.store";
import { TopBar } from "../components/TopBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/cn";

export function FeedbackPage() {
  const { tableId = "", orderId = "" } = useParams();
  const navigate = useNavigate();
  const submit = useFeedbackStore((s) => s.submit);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [done, setDone] = useState(false);

  async function send() {
    await submit({ orderId, rating, review: review || undefined, createdAt: Date.now() });
    setDone(true);
  }

  return (
    <div className="p-5">
      <TopBar title="Feedback" />
      <div className="mt-6 text-center">
        {done ? (
          <>
            <p className="font-serif text-2xl">Thank you!</p>
            <p className="mt-2 text-sm text-muted">We can't wait to serve you again.</p>
            <Button className="mt-6" onClick={() => navigate(`/table/${tableId}`)}>Back to table</Button>
          </>
        ) : (
          <>
            <p className="font-serif text-2xl">How was your meal?</p>
            <div className="mt-5 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                >
                  <Star className={cn(
                    "h-9 w-9 transition-colors",
                    (hover || rating) >= n ? "fill-accent text-accent" : "text-muted"
                  )} />
                </button>
              ))}
            </div>
            <Textarea
              value={review} onChange={(e) => setReview(e.target.value)}
              placeholder="Tell us more (optional)" className="mt-6 text-left" />
            <Button className="mt-4 w-full" size="lg" disabled={rating === 0} onClick={send}>
              Submit
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in dev**

```bash
npm run dev
```
Bill → Rate → pick stars → submit → thank you. Ctrl-C.

- [ ] **Step 3: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(customer): FeedbackPage with star rating and review"
```

---

## Task 19: HistoryPage (light)

**Files:**
- Modify: `src/features/customer/history/HistoryPage.tsx`

- [ ] **Step 1: Implement order history**

```tsx
import { useEffect } from "react";
import { useSessionStore } from "@/stores/session.store";
import { useOrderStore } from "@/stores/order.store";
import { TopBar } from "../components/TopBar";
import { formatCurrency } from "@/lib/format";

export function HistoryPage() {
  const customer = useSessionStore((s) => s.customer)!;
  const { pastOrders, loadHistory } = useOrderStore();

  useEffect(() => {
    loadHistory(customer);
  }, [customer, loadHistory]);

  return (
    <div>
      <TopBar title="Your Orders" />
      <div className="p-4">
        {pastOrders.length === 0 ? (
          <p className="py-20 text-center text-muted">No previous orders yet.</p>
        ) : (
          <div className="space-y-3">
            {pastOrders.map((o) => (
              <div key={o.id} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex justify-between">
                  <span className="font-medium">Table {o.tableNumber}</span>
                  <span className="capitalize text-muted">{o.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {new Date(o.placedAt).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {o.lines.map((l) => `${l.quantity}× ${l.name}`).join(", ")}
                </p>
                <p className="mt-2 font-serif text-lg">{formatCurrency(o.total)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify in dev**

```bash
npm run dev
```
Place an order → go to table → Order history → list shows it. Ctrl-C.

- [ ] **Step 3: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(customer): HistoryPage (order list)"
```

---

## Task 20: PWA configuration (installable + offline shell)

**Files:**
- Modify: `vite.config.ts`
- Create: `public/icon-192.png`, `public/icon-512.png`

- [ ] **Step 1: Generate simple PWA icons (gold square on dark)**

Create a quick SVG and convert with a tiny node script. Write `scripts/make-icons.mjs`:
```js
import { writeFileSync } from "node:fs";
// Minimal PNG (1x1 gold) placeholders are not acceptable; instead write an SVG-based icon set.
// We embed a recognizable mark: gold circle on dark.
const svg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="#0E0E10"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.3}" fill="#C9A24B"/>
</svg>`;
writeFileSync("public/icon-192.svg", svg(192));
writeFileSync("public/icon-512.svg", svg(512));
console.log("icons written");
```
Run: `node scripts/make-icons.mjs`

- [ ] **Step 2: Configure `vite-plugin-pwa`**

Replace `vite.config.ts` plugins block and add the import:
```ts
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.svg", "icon-512.svg"],
      manifest: {
        name: "DineFlow",
        short_name: "DineFlow",
        description: "DineFlow — order at your table",
        theme_color: "#0E0E10",
        background_color: "#0E0E10",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
          { src: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname === "images.unsplash.com",
            handler: "CacheFirst",
            options: { cacheName: "food-images", expiration: { maxEntries: 60 } },
          },
        ],
      },
    }),
  ],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
```

- [ ] **Step 3: Build and verify manifest is emitted**

```bash
cd dineflow-os && npm run build
```
Expected: build succeeds, `dist/manifest.webmanifest` and `dist/sw.js` exist, `dist/registerSW.js` exists. (Confirm with `ls dist`.)

- [ ] **Step 4: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "feat(pwa): installable manifest, offline shell, image caching"
```

---

## Task 21: README + full verification

**Files:**
- Create: `dineflow-os/README.md`

- [ ] **Step 1: Write the README**

```markdown
# DineFlow OS — Phase 1: Customer Ordering PWA

A premium-editorial, mobile-first Progressive Web App for in-restaurant QR ordering.
Scan → browse menu → customize → cart → place order → live tracking → bill → feedback.
No app install required.

## Stack
Vite, React 18, TypeScript, Tailwind CSS, shadcn-style primitives, React Router,
Zustand, Framer Motion, vite-plugin-pwa. Vitest + React Testing Library for tests.

## Scripts
- `npm run dev` — start dev server
- `npm run build` — production build (emits PWA manifest + service worker)
- `npm run preview` — preview the production build
- `npx vitest` — run tests

## Architecture note
All UI talks to typed service interfaces in `src/services/index.ts`. Mock
implementations live in `src/services/mock/`. To go live later, add
`src/services/firebase/*` with matching signatures and swap the `services`
singleton — no UI or store changes required.

## Demo flow
1. Open the dev URL — enter name + 10-digit mobile.
2. Lands on Table 12. Tap **View Menu**.
3. Add dishes (try Butter Chicken — has a required bread add-on).
4. Open cart, apply coupon `WELCOME10`, place order.
5. Watch the status advance Received → Preparing → Ready → Served.
6. Request Bill → Pay Online → Rate.
7. Use the floating hand button to call waiter/water/tissue.

## PWA
After `npm run build && npm run preview`, use browser devtools → Application →
Install, and toggle offline to confirm the cached shell loads.
```

- [ ] **Step 2: Run the full test suite**

```bash
cd dineflow-os && npx vitest run
```
Expected: all tests pass (format, id, cart store, order service).

- [ ] **Step 3: Type-check the whole project**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Production build**

```bash
npm run build
```
Expected: succeeds; PWA assets emitted.

- [ ] **Step 5: Commit**

```bash
cd /Users/aniruddhadas/ZCodeProject
git add -A && git commit -m "docs: add Phase 1 README and verify build/tests"
```

- [ ] **Step 6: Report Definition of Done**

Confirm against the spec's DoD checklist (all 10 screens, cart logic, simulated real-time, active-order detection, assistance + feedback, PWA, mobile-first, swappable services, tests green, README). Report any gaps honestly.

---

## Self-Review

**1. Spec coverage:**
- §5 data models → Task 3 ✓
- §6.1 Welcome → Task 10 ✓
- §6.2 Table landing + active-order detection → Task 11 ✓
- §6.3 Menu (rail/search/filters/cards) → Task 12 ✓
- §6.4 Item detail + customization + validation → Task 13 ✓
- §6.5 Cart + coupon + charges + place order → Task 14 ✓
- §6.6 Order tracking + simulated progression → Task 15 ✓
- §6.7 Bill + simulated pay → Task 16 ✓
- §6.8 Assistance (waiter/water/tissue) → Task 17 ✓
- §6.9 Feedback → Task 18 ✓
- §6.10 History (light) → Task 19 ✓
- §7 stores → Task 7 ✓
- §8 services (swappable) → Tasks 5–6 ✓
- §10 PWA → Task 20 ✓
- §12 testing → Tasks 2, 6, 7 (cart, services, utils) ✓

**2. Placeholder scan:** No TODO/TBD; every code step contains full code.

**3. Type consistency:** Checked method names across tasks — `addFromItem`, `placeFromCart`, `subscribe`, `loadActive`, `loadHistory`, `requestAssistance`, `getActiveOrder`, `subscribeToStatus`, `requestBill`, `requestAssistance`, `cartLineId`, `formatCurrency` — all consistent between definition and use. `OrderStore.subscribe` returns an unsubscribe used in the effect cleanup; `services.order.subscribeToStatus` matches. `PlaceOrderInput` fields match what `placeFromCart` builds.

One known intentional simplification: `structuredClone` is used in Task 13 (available in Node 22 / modern browsers) — acceptable.
