import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Grid3X3,
  ClipboardList,
  Users,
  LogOut,
  UtensilsCrossed,
  MessageSquare,
  Package,
  UserCog,
  Settings,
  Globe,
  ShoppingCart,
  Phone,
  Calendar,
  BookOpen,
} from "lucide-react";
import { usePosAuthStore } from "@/stores/posAuth.store";
import { usePermissionStore } from "@/stores/permissions.store";
import { usePosSettingsStore } from "@/stores/posSettings.store";
import type { Permission } from "@/services/types";
import { cn } from "@/lib/cn";

const links: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; permission: Permission; feature?: keyof import("@/stores/posSettings.store").PosFeatures }[] = [
  { to: "/pos/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
  { to: "/pos/instant-pos", label: "Instant POS", icon: ShoppingCart, permission: "pos:instant", feature: "instantPos" },
  { to: "/pos/tables", label: "Tables", icon: Grid3X3, permission: "tables:view", feature: "tableDining" },
  { to: "/pos/orders", label: "Orders", icon: ClipboardList, permission: "orders:view" },
  { to: "/pos/online-orders", label: "Online Orders", icon: Phone, permission: "orders:view", feature: "onlineOrders" },
  { to: "/pos/crm", label: "CRM", icon: Users, permission: "crm:view" },
  { to: "/pos/feedback", label: "Feedback", icon: MessageSquare, permission: "feedback:view" },
  { to: "/pos/inventory", label: "Inventory", icon: Package, permission: "inventory:view" },
  { to: "/pos/staff", label: "Staff", icon: UserCog, permission: "staff:view" },
  { to: "/pos/website-builder", label: "Website", icon: Globe, permission: "website:build", feature: "websiteBuilder" },
  { to: "/pos/reservations", label: "Reservations", icon: Calendar, permission: "reservations:view", feature: "reservations" },
  { to: "/pos/menu", label: "Menu", icon: BookOpen, permission: "menu:manage" },
  { to: "/pos/settings", label: "Settings", icon: Settings, permission: "settings:view" },
];

export function Sidebar() {
  const staff = usePosAuthStore((s) => s.staff);
  const logout = usePosAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const isFeatureEnabled = usePosSettingsStore((s) => s.isEnabled);

  function handleLogout() {
    logout();
    navigate("/pos");
  }

  const role = usePosAuthStore((s) => s.staff?.role ?? null);
  const rolePerms = usePermissionStore((s) => (role ? s.rolePermissions[role] : undefined));

  const visibleLinks = links.filter((link) => {
    const hasPerm = rolePerms ? rolePerms.has(link.permission) : false;
    const featureOk = !link.feature || isFeatureEnabled(link.feature);
    return hasPerm && featureOk;
  });

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-surface">
      {/* Brand */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-5">
        <UtensilsCrossed className="h-6 w-6 text-accent" />
        <div>
          <p className="font-serif text-lg leading-none">Saffron &amp; Smoke</p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-muted">
            POS Terminal
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              )
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Staff + logout */}
      <div className="border-t border-border px-5 py-4">
        {staff && (
          <>
            <p className="text-sm font-medium">{staff.name}</p>
            <p className="mb-3 text-xs capitalize text-muted">{staff.role}</p>
            {staff.role === "admin" && (
              <p className="mb-2 text-[10px] uppercase tracking-widest text-danger">Full Access</p>
            )}
          </>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
