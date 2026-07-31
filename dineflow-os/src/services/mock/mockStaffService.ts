import type { StaffService, StaffMember } from "../index";
import { staff as seedStaff } from "@/data/staff";

let allStaff: StaffMember[] = seedStaff.map((s) => ({ ...s }));

export const mockStaffService: StaffService = {
  async clockIn(staffId) {
    const staff = allStaff.find((s) => s.id === staffId);
    if (!staff) throw new Error(`Staff member ${staffId} not found`);
    
    staff.lastClockIn = Date.now();
    staff.currentShift = true;
    console.log(`[StaffService] ${staff.name} clocked in at ${new Date(staff.lastClockIn).toLocaleTimeString()}`);
  },

  async clockOut(staffId: string) {
    const staff = allStaff.find((s) => s.id === staffId);
    if (!staff) throw new Error(`Staff member ${staffId} not found`);
    
    staff.currentShift = false;
    console.log(`[StaffService] ${staff.name} clocked out.`);
  },

  async getActiveStaff() {
    return allStaff.filter((s) => s.currentShift);
  },

  async getAllStaff() {
    return [...allStaff];
  },

  async createStaff(data) {
    const created: StaffMember = { ...data, id: `staff-${crypto.randomUUID().slice(0, 8)}` };
    allStaff.push(created);
    return created;
  },

  async updateStaff(id, updates) {
    const idx = allStaff.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Staff member ${id} not found`);
    allStaff[idx] = { ...allStaff[idx], ...updates };
    return allStaff[idx];
  },

  async deleteStaff(id) {
    allStaff = allStaff.filter((s) => s.id !== id);
  },
};

// Helper for auth flow to get the updated staff object
export function getStaffById(id: string): StaffMember | undefined {
  return allStaff.find((s) => s.id === id);
}
