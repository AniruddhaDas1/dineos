import { categories as seedCategories, menuItems as seedMenuItems } from "@/data/menu";
import { restaurant } from "@/data/restaurant";
import type { MenuService, MenuItem, Category } from "../index";

let categories = [...seedCategories];

const menuItems = new Map<string, MenuItem>();

// Initialize items
for (const item of seedMenuItems) {
  menuItems.set(item.id, { ...item });
}

export const mockMenuService: MenuService = {
  async getRestaurant() {
    return restaurant;
  },
  async getCategories() {
    return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
  },
  async getMenuItems() {
    return Array.from(menuItems.values());
  },
  async getItem(id) {
    return menuItems.get(id);
  },

  async createItem(data) {
    const created: MenuItem = { ...data, id: `mi-${crypto.randomUUID().slice(0, 6)}` };
    menuItems.set(created.id, created);
    return created;
  },
  async updateItem(id, updates) {
    const item = menuItems.get(id);
    if (!item) throw new Error(`Item ${id} not found`);
    const updated = { ...item, ...updates };
    menuItems.set(id, updated);
    return updated;
  },
  async deleteItem(id) {
    menuItems.delete(id);
  },

  async createCategory(data) {
    const created: Category = { ...data, id: `cat-${crypto.randomUUID().slice(0, 6)}` };
    categories.push(created);
    return created;
  },
  async updateCategory(id, updates) {
    const idx = categories.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Category ${id} not found`);
    categories[idx] = { ...categories[idx], ...updates };
    return categories[idx];
  },
  async deleteCategory(id) {
    categories = categories.filter((c) => c.id !== id);
  },
};

export function updateItemAvailability(itemId: string, available: boolean) {
  const item = menuItems.get(itemId);
  if (item) {
    item.available = available;
    menuItems.set(itemId, item);
  }
}
