import type { Floor, Table } from "@/services/types";

export const floors: Floor[] = [
  { id: "floor-1", name: "Main Hall", order: 1 },
  { id: "floor-2", name: "Terrace", order: 2 },
  { id: "floor-3", name: "Private Dining", order: 3 },
];

export const tables: Table[] = [
  { id: "tbl-1", floorId: "floor-1", label: "T1", capacity: 4, section: "Window" },
  { id: "tbl-2", floorId: "floor-1", label: "T2", capacity: 2 },
  { id: "tbl-3", floorId: "floor-1", label: "T3", capacity: 6 },
  { id: "tbl-4", floorId: "floor-1", label: "T4", capacity: 4, section: "Bar" },
  { id: "tbl-5", floorId: "floor-2", label: "T5", capacity: 4 },
  { id: "tbl-6", floorId: "floor-2", label: "T6", capacity: 2 },
  { id: "tbl-7", floorId: "floor-2", label: "T7", capacity: 8 },
  { id: "tbl-8", floorId: "floor-3", label: "P1", capacity: 10 },
  { id: "tbl-9", floorId: "floor-3", label: "P2", capacity: 6 },
];

// Legacy export for backward compatibility — order/store still uses these IDs
export const legacyTables: { id: string; number: number; seats: number }[] = [
  { id: "tbl-1", number: 1, seats: 4 },
  { id: "tbl-2", number: 2, seats: 2 },
  { id: "tbl-3", number: 3, seats: 6 },
  { id: "tbl-4", number: 4, seats: 4 },
  { id: "tbl-5", number: 5, seats: 4 },
  { id: "tbl-6", number: 6, seats: 2 },
  { id: "tbl-7", number: 7, seats: 8 },
  { id: "tbl-8", number: 8, seats: 10 },
  { id: "tbl-9", number: 9, seats: 6 },
];
