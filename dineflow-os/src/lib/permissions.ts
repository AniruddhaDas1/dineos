import type { Permission, StaffRole } from "@/services/types";
import { usePosAuthStore } from "@/stores/posAuth.store";
import { usePermissionStore, DEFAULT_MATRIX } from "@/stores/permissions.store";

export { DEFAULT_MATRIX };

export const ALL_PERMISSIONS: Permission[] = [

  "orders:view",
  "orders:advance",
  "orders:cancel",
  "orders:bill",
  "orders:print",

  "tables:view",
  "tables:create",
  "tables:edit",
  "tables:delete",
  "tables:manageFloors",

  "staff:view",
  "staff:create",
  "staff:edit",
  "staff:delete",

  "inventory:view",
  "inventory:create",
  "inventory:edit",
  "inventory:delete",
  "inventory:restock",

  "crm:view",
  "feedback:view",
  "website:build",
  "pos:instant",
  "reservations:view",
  "reservations:create",
  "reservations:edit",
  "menu:manage",

  "settings:view",
  "settings:manage",

  "aggregator:simulate",
  "kds:view",
];

export function can(role: StaffRole | null, permission: Permission): boolean {
  if (!role) return false;
  const matrix = usePermissionStore.getState().rolePermissions;
  const rolePerms = matrix[role];
  if (!rolePerms) return false;
  return rolePerms.has(permission);
}

export function usePermission(permission: Permission): boolean {
  const role = usePosAuthStore((s) => s.staff?.role ?? null);
  return usePermissionStore((s) => {
    const rolePerms = role ? s.rolePermissions[role] : undefined;
    return rolePerms ? rolePerms.has(permission) : false;
  });
}

export function useRolePermissions(): Set<Permission> | undefined {
  const role = usePosAuthStore((s) => s.staff?.role ?? null);
  return usePermissionStore((s) => (role ? s.rolePermissions[role] : undefined));
}

export const ROLE_LABELS: Record<StaffRole, string> = {
  admin: "Admin",
  executive: "Executive",
  manager: "Manager",
  captain: "Captain",
  cashier: "Cashier",
  user: "User",
};

export const ROLE_HIERARCHY: StaffRole[] = [
  "admin",
  "executive",
  "manager",
  "captain",
  "cashier",
  "user",
];

export function isRoleAtOrBelow(
  role: StaffRole,
  maxRole: StaffRole
): boolean {
  return ROLE_HIERARCHY.indexOf(role) >= ROLE_HIERARCHY.indexOf(maxRole);
}
