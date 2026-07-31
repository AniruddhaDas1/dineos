import type { InventoryItem, Recipe } from "@/services/types";

export const inventoryItems: InventoryItem[] = [
  { id: "inv-1", name: "Chicken Breast", sku: "CHICK-001", currentStock: 5000, unit: "g", threshold: 1000, minStock: 500 },
  { id: "inv-2", name: "Butter", sku: "BUTT-001", currentStock: 2000, unit: "g", threshold: 500, minStock: 200 },
  { id: "inv-3", name: "Heavy Cream", sku: "CRM-001", currentStock: 3000, unit: "ml", threshold: 1000, minStock: 500 },
  { id: "inv-4", name: "Paneer", sku: "PNR-001", currentStock: 4000, unit: "g", threshold: 1000, minStock: 500 },
  { id: "inv-5", name: "Basmati Rice", sku: "RICE-001", currentStock: 10000, unit: "g", threshold: 2000, minStock: 1000 },
  { id: "inv-6", name: "Saffron", sku: "SFF-001", currentStock: 100, unit: "g", threshold: 20, minStock: 10 },
];

export const recipes: Recipe[] = [
  {
    itemId: "mi-3", // Butter Chicken
    ingredients: [
      { inventoryId: "inv-1", quantity: 200 }, // 200g chicken
      { inventoryId: "inv-2", quantity: 50 },  // 50g butter
      { inventoryId: "inv-3", quantity: 100 }, // 100ml cream
    ],
  },
  {
    itemId: "mi-1", // Paneer Tikka
    ingredients: [
      { inventoryId: "inv-4", quantity: 250 }, // 250g paneer
      { inventoryId: "inv-2", quantity: 20 },  // 20g butter
    ],
  },
  {
    itemId: "mi-6", // Hyderabadi Veg Biryani
    ingredients: [
      { inventoryId: "inv-5", quantity: 300 }, // 300g rice
      { inventoryId: "inv-6", quantity: 0.1 }, // 0.1g saffron
    ],
  },
];
