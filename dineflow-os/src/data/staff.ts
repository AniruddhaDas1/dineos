import type { StaffMember } from "@/services/types";

export type { StaffRole, StaffMember } from "@/services/types";

export const staff: StaffMember[] = [
  { id: "staff-1", name: "Vikram Rao", pin: "1234", role: "manager" },
  { id: "staff-2", name: "Anita Desai", pin: "0000", role: "captain" },
  { id: "staff-3", name: "Suresh Kumar", pin: "9999", role: "cashier" },
  { id: "staff-4", name: "Priya Sharma", pin: "1111", role: "admin" },
  { id: "staff-5", name: "Arjun Mehta", pin: "2222", role: "executive" },
  { id: "staff-6", name: "Neha Gupta", pin: "3333", role: "user" },
];
