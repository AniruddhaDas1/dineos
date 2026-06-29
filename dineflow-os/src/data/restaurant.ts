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
