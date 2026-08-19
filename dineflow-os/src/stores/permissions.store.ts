import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Permission, PermissionMatrix, StaffRole } from "@/services/types";

// Default permission matrix — defined here (not in lib/permissions.ts) to avoid
// a circular import: lib/permissions.ts imports this store for usePermission().
export const DEFAULT_MATRIX: Record<StaffRole, Set<Permission>> = {
  admin: new Set<Permission>([
    "dashboard:view",
    "orders:view", "orders:advance", "orders:cancel", "orders:bill", "orders:print",
    "tables:view", "tables:create", "tables:edit", "tables:delete", "tables:manageFloors",
    "staff:view", "staff:create", "staff:edit", "staff:delete",
    "inventory:view", "inventory:create", "inventory:edit", "inventory:delete", "inventory:restock",
    "crm:view", "feedback:view",
    "website:build",
    "pos:instant", "reservations:view", "reservations:create", "reservations:edit", "menu:manage",
    "marketing:view", "marketing:manage",
    "settings:view", "settings:manage",
    "aggregator:simulate", "kds:view",
  ]),
  executive: new Set<Permission>([
    "dashboard:view",
    "orders:view", "orders:advance", "orders:cancel", "orders:bill", "orders:print",
    "tables:view", "tables:create", "tables:edit", "tables:delete", "tables:manageFloors",
    "staff:view", "staff:create", "staff:edit",
    "inventory:view", "inventory:create", "inventory:edit", "inventory:restock",
    "crm:view", "feedback:view",
    "website:build",
    "pos:instant", "reservations:view", "reservations:create", "reservations:edit", "menu:manage",
    "marketing:view", "marketing:manage",
    "settings:view",
    "aggregator:simulate", "kds:view",
  ]),
  manager: new Set<Permission>([
    "dashboard:view",
    "orders:view", "orders:advance", "orders:cancel", "orders:bill", "orders:print",
    "tables:view", "tables:create", "tables:edit", "tables:manageFloors",
    "staff:view", "staff:create", "staff:edit",
    "inventory:view", "inventory:create", "inventory:edit", "inventory:restock",
    "crm:view", "feedback:view",
    "website:build",
    "pos:instant", "reservations:view", "reservations:create", "reservations:edit",
    "marketing:view", "marketing:manage",
    "settings:view",
    "aggregator:simulate", "kds:view",
  ]),
  captain: new Set<Permission>([
    "dashboard:view",
    "orders:view", "orders:advance", "orders:cancel", "orders:bill", "orders:print",
    "tables:view",
    "crm:view", "feedback:view",
    "pos:instant",
    "kds:view",
  ]),
  cashier: new Set<Permission>([
    "dashboard:view",
    "orders:view", "orders:bill", "orders:print",
    "tables:view",
    "feedback:view",
    "pos:instant",
    "kds:view",
  ]),
  user: new Set<Permission>([
    "dashboard:view",
    "orders:view",
    "tables:view",
  ]),
};

function serializeMatrix(matrix: PermissionMatrix): Record<string, string[]> {
  const serialized: Record<string, string[]> = {};
  for (const role of Object.keys(matrix) as StaffRole[]) {
    serialized[role] = Array.from(matrix[role]);
  }
  return serialized;
}

function deserializeMatrix(data: Record<string, string[]>): PermissionMatrix {
  const matrix = {} as Record<string, Set<Permission>>;
  for (const role of Object.keys(data) as StaffRole[]) {
    matrix[role] = new Set(data[role] as Permission[]);
  }
  return matrix as PermissionMatrix;
}

interface PermissionState {
  rolePermissions: PermissionMatrix;
  can: (role: StaffRole | null, permission: Permission) => boolean;
  grant: (role: StaffRole, permission: Permission) => void;
  revoke: (role: StaffRole, permission: Permission) => void;
  resetToDefaults: () => void;
  hydrateDefaults: () => void;
}

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      rolePermissions: { ...DEFAULT_MATRIX },

      can(role, permission) {
        if (!role) return false;
        const perms = get().rolePermissions[role];
        return perms ? perms.has(permission) : false;
      },

      grant(role, permission) {
        set((state) => {
          const updated = { ...state.rolePermissions };
          updated[role] = new Set(updated[role]);
          updated[role].add(permission);
          return { rolePermissions: updated };
        });
      },

      revoke(role, permission) {
        set((state) => {
          const updated = { ...state.rolePermissions };
          updated[role] = new Set(updated[role]);
          updated[role].delete(permission);
          return { rolePermissions: updated };
        });
      },

      resetToDefaults() {
        set({ rolePermissions: { ...DEFAULT_MATRIX } });
      },

      hydrateDefaults() {
        // Fill in any roles/permissions that might be missing from stored state
        set((state) => {
          const merged = { ...state.rolePermissions };
          for (const role of Object.keys(DEFAULT_MATRIX) as StaffRole[]) {
            if (!merged[role]) {
              merged[role] = new Set(DEFAULT_MATRIX[role]);
            }
          }
          return { rolePermissions: merged };
        });
      },
    }),
    {
      name: "dineflow-pos-permissions",
      storage: {
        getItem: (name) => {
          const raw = localStorage.getItem(name);
          if (!raw) return null;
          try {
            const parsed = JSON.parse(raw);
            if (parsed?.state?.rolePermissions && typeof parsed.state.rolePermissions === "object") {
              parsed.state.rolePermissions = deserializeMatrix(parsed.state.rolePermissions);
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              rolePermissions: serializeMatrix(value.state.rolePermissions),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
