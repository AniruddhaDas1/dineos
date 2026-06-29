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
