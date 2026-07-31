export const STATIONS = [
  "Main Kitchen",
  "Tandoor",
  "Grill",
  "Bar",
  "Desserts",
] as const;

export type Station = (typeof STATIONS)[number];
