import type { InventoryService, InventoryItem } from "../index";
import type { CartLine } from "@/services/types";
import { inventoryItems as seedItems, recipes } from "@/data/inventory";
import { updateItemAvailability } from "./mockMenuService";

const inventory = new Map<string, InventoryItem>();

// Initialize with seed data
for (const item of seedItems) {
  inventory.set(item.id, { ...item });
}

export const mockInventoryService: InventoryService = {
  async getStockLevel(itemId) {
    const item = inventory.get(itemId);
    return item ? item.currentStock : 0;
  },

  async getAllItems() {
    return Array.from(inventory.values()).map((i) => ({ ...i }));
  },

  async createItem(data) {
    const created: InventoryItem = { ...data, id: `inv-${crypto.randomUUID().slice(0, 8)}` };
    inventory.set(created.id, created);
    return created;
  },

  async updateItem(id, updates) {
    const item = inventory.get(id);
    if (!item) throw new Error(`Item ${id} not found in inventory`);
    const updated = { ...item, ...updates };
    inventory.set(id, updated);
    return updated;
  },

  async deleteItem(id) {
    if (!inventory.has(id)) throw new Error(`Item ${id} not found in inventory`);
    inventory.delete(id);
  },

  async addStock(itemId, quantity) {
    const item = inventory.get(itemId);
    if (!item) throw new Error(`Item ${itemId} not found in inventory`);
    item.currentStock += quantity;
    inventory.set(itemId, item);
    
    // Re-check availability for all recipes using this item
    for (const recipe of recipes) {
      if (recipe.ingredients.some(ing => ing.inventoryId === itemId)) {
        const canServe = recipe.ingredients.every(ing => 
          (inventory.get(ing.inventoryId)?.currentStock ?? 0) >= ing.quantity
        );
        updateItemAvailability(recipe.itemId, canServe);
      }
    }
  },

  async deductStock(orderId) {
    console.log(`[InventoryService] Deducting stock for order ${orderId}...`);
    // Logic is triggered via processRecipeDeduction in mockOrderService
  },

  async getLowStockItems() {
    return Array.from(inventory.values()).filter(
      (item) => item.currentStock <= item.threshold
    );
  },
};

export function processRecipeDeduction(lines: CartLine[]) {
  for (const line of lines) {
    const recipe = recipes.find((r) => r.itemId === line.itemId);
    if (!recipe) continue;

    for (const ing of recipe.ingredients) {
      const item = inventory.get(ing.inventoryId);
      if (item) {
        item.currentStock -= ing.quantity * line.quantity;
        inventory.set(ing.inventoryId, item);
      }
    }
  }

  // Auto-OOS: Update availability for all dishes based on remaining stock
  for (const recipe of recipes) {
    const canServe = recipe.ingredients.every(ing =>
      (inventory.get(ing.inventoryId)?.currentStock ?? 0) >= ing.quantity
    );
    updateItemAvailability(recipe.itemId, canServe);
  }
}
