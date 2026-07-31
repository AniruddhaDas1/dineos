import type { Floor, Table, TableService } from "../index";
import { floors as seedFloors, tables as seedTables } from "@/data/tables";

let floors: Floor[] = seedFloors.map((f) => ({ ...f }));
let tables: Table[] = seedTables.map((t) => ({ ...t }));

function nextId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export const mockTableService: TableService = {
  async getFloors() {
    return [...floors].sort((a, b) => a.order - b.order);
  },

  async getFloor(id) {
    return floors.find((f) => f.id === id);
  },

  async createFloor(floor) {
    const created: Floor = { ...floor, id: nextId("floor") };
    floors.push(created);
    return created;
  },

  async updateFloor(id, updates) {
    const idx = floors.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error(`Floor ${id} not found`);
    floors[idx] = { ...floors[idx], ...updates };
    return floors[idx];
  },

  async deleteFloor(id) {
    floors = floors.filter((f) => f.id !== id);
    tables = tables.filter((t) => t.floorId !== id);
  },

  async getTables(floorId) {
    if (floorId) return tables.filter((t) => t.floorId === floorId);
    return [...tables];
  },

  async createTable(table) {
    const created: Table = { ...table, id: nextId("tbl") };
    tables.push(created);
    return created;
  },

  async updateTable(id, updates) {
    const idx = tables.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Table ${id} not found`);
    tables[idx] = { ...tables[idx], ...updates };
    return tables[idx];
  },

  async deleteTable(id) {
    tables = tables.filter((t) => t.id !== id);
  },
};
