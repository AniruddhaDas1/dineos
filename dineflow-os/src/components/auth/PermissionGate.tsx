import type { Permission } from "@/services/types";
import { Navigate } from "react-router-dom";
import { usePosAuthStore } from "@/stores/posAuth.store";
import { usePermissionStore } from "@/stores/permissions.store";

interface PermissionGateProps {
  permission: Permission | Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({
  permission,
  fallback = <Navigate to="/pos" replace />,
  children,
}: PermissionGateProps) {
  const perms = Array.isArray(permission) ? permission : [permission];
  const role = usePosAuthStore((s) => s.staff?.role ?? null);
  const allowed = usePermissionStore((s) => {
    if (!role) return false;
    const rolePerms = s.rolePermissions[role];
    return rolePerms ? perms.some((p) => rolePerms.has(p)) : false;
  });

  return allowed ? <>{children}</> : <>{fallback}</>;
}
