import { useState } from "react";
import { usePermissionStore } from "@/stores/permissions.store";
import { usePermission, ROLE_LABELS } from "@/lib/permissions";
import { usePosSettingsStore } from "@/stores/posSettings.store";
import { useRestaurantStore } from "@/stores/restaurant.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Save } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Permission, StaffRole } from "@/services/types";
import type { PosFeatures } from "@/stores/posSettings.store";

const ROLES: StaffRole[] = ["admin", "executive", "manager", "captain", "cashier", "user"];

const PERMISSION_LABELS: Record<Permission, string> = {
  "dashboard:view": "View Dashboard",
  "orders:view": "View Orders",
  "orders:advance": "Advance Order Status",
  "orders:cancel": "Cancel Orders",
  "orders:bill": "Bill Orders",
  "orders:print": "Print Receipts",
  "tables:view": "View Tables",
  "tables:create": "Create Tables",
  "tables:edit": "Edit Tables",
  "tables:delete": "Delete Tables",
  "tables:manageFloors": "Manage Floors",
  "staff:view": "View Staff",
  "staff:create": "Create Staff",
  "staff:edit": "Edit Staff",
  "staff:delete": "Delete Staff",
  "inventory:view": "View Inventory",
  "inventory:create": "Create Items",
  "inventory:edit": "Edit Items",
  "inventory:delete": "Delete Items",
  "inventory:restock": "Restock",
  "crm:view": "View CRM",
  "feedback:view": "View Feedback",
  "website:build": "Build / Edit Websites",
  "pos:instant": "Use Instant POS",
  "reservations:view": "View Reservations",
  "reservations:create": "Create Reservations",
  "reservations:edit": "Edit Reservations",
  "menu:manage": "Manage Menu",
  "marketing:view": "View Marketing",
  "marketing:manage": "Manage Marketing",
  "settings:view": "View Settings",
  "settings:manage": "Manage Permissions",
  "aggregator:simulate": "Simulate Aggregator Orders",
  "kds:view": "View KDS",
};

const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  { label: "General", permissions: ["dashboard:view"] },
  { label: "Orders", permissions: ["orders:view", "orders:advance", "orders:cancel", "orders:bill", "orders:print"] },
  { label: "Tables & Floors", permissions: ["tables:view", "tables:create", "tables:edit", "tables:delete", "tables:manageFloors"] },
  { label: "Staff", permissions: ["staff:view", "staff:create", "staff:edit", "staff:delete"] },
  { label: "Inventory", permissions: ["inventory:view", "inventory:create", "inventory:edit", "inventory:delete", "inventory:restock"] },
  { label: "Customers", permissions: ["crm:view", "feedback:view"] },
  { label: "Website", permissions: ["website:build"] },
  { label: "POS", permissions: ["pos:instant"] },
  { label: "Reservations", permissions: ["reservations:view", "reservations:create", "reservations:edit"] },
  { label: "Menu", permissions: ["menu:manage"] },
  { label: "Marketing", permissions: ["marketing:view", "marketing:manage"] },
  { label: "Settings", permissions: ["settings:view", "settings:manage"] },
  { label: "Operations", permissions: ["aggregator:simulate", "kds:view"] },
];

export function SettingsPage() {
  const rolePermissions = usePermissionStore((s) => s.rolePermissions);
  const grant = usePermissionStore((s) => s.grant);
  const revoke = usePermissionStore((s) => s.revoke);
  const resetToDefaults = usePermissionStore((s) => s.resetToDefaults);
  const canManage = usePermission("settings:manage");
  const [saved, setSaved] = useState(false);

  const posFeatures = usePosSettingsStore((s) => s.features);
  const toggleFeature = usePosSettingsStore((s) => s.toggle);

  const restaurant = useRestaurantStore((s) => s.details);
  const updateRestaurant = useRestaurantStore((s) => s.updateDetails);
  const [restaurantSaved, setRestaurantSaved] = useState(false);

  function togglePermission(role: StaffRole, permission: Permission) {
    if (!canManage) return;
    if (role === "admin" && permission === "settings:manage") return;
    const current = rolePermissions[role];
    if (current?.has(permission)) {
      revoke(role, permission);
    } else {
      grant(role, permission);
    }
    setSaved(false);
  }

  function handleReset() {
    if (!canManage) return;
    resetToDefaults();
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted">
            Configure role permissions. Admin can delegate any permission to any role.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <Button variant="outline" className="gap-2" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" /> Reset to Defaults
              </Button>
              <Button className="gap-2" onClick={handleSave}>
                <Save className="h-4 w-4" /> {saved ? "Saved!" : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-muted">Permission</th>
              {ROLES.map((role) => (
                <th key={role} className="px-3 py-3 text-center text-xs uppercase tracking-widest text-muted">
                  {ROLE_LABELS[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_GROUPS.map((group, gi) => (
              <>
                <tr key={`g-${gi}`} className="border-b border-border bg-surface-2/50">
                  <td colSpan={ROLES.length + 1} className="px-4 py-2 text-xs font-semibold text-muted">
                    {group.label}
                  </td>
                </tr>
                {group.permissions.map((perm) => (
                  <tr key={perm} className="border-b border-border/50 transition-colors hover:bg-surface-2/50">
                    <td className="px-4 py-2.5">{PERMISSION_LABELS[perm]}</td>
                    {ROLES.map((role) => {
                      const has = rolePermissions[role]?.has(perm) ?? false;
                      const locked = role === "admin" && perm === "settings:manage";
                      return (
                        <td key={role} className="px-3 py-2.5 text-center">
                          <button
                            disabled={!canManage || locked}
                            onClick={() => togglePermission(role, perm)}
                            className={cn(
                              "mx-auto flex h-6 w-6 items-center justify-center rounded transition-colors",
                              locked
                                ? "bg-accent/30 text-accent cursor-not-allowed"
                                : has
                                  ? "bg-accent text-accent-foreground"
                                  : "bg-surface-2 text-transparent border border-border hover:border-accent/40"
                            )}
                          >
                            ✓
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Feature Toggles */}
      {canManage && (
        <>
          <div className="mt-10">
            <h2 className="mb-1 font-serif text-2xl">Feature Toggles</h2>
            <p className="mb-4 text-sm text-muted">Enable or disable major POS modules.</p>
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              {FEATURE_TOGGLES.map((f) => (
                <div key={f.key} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{f.label}</p>
                    <p className="text-xs text-muted">{f.desc}</p>
                  </div>
                  <button
                    onClick={() => toggleFeature(f.key)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      posFeatures[f.key] ? "bg-accent" : "bg-surface-2 border border-border"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow-sm",
                        posFeatures[f.key] ? "left-[22px]" : "left-[2px]"
                      )}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Restaurant Details */}
      {canManage && (
        <div className="mt-10">
          <h2 className="mb-1 font-serif text-2xl">Restaurant Details</h2>
          <p className="mb-4 text-sm text-muted">Information printed on bills and receipts.</p>
          <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs text-muted">Restaurant Name</label>
                <Input
                  value={restaurant.name}
                  onChange={(e) => updateRestaurant({ name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted">Tagline</label>
                <Input
                  value={restaurant.tagline}
                  onChange={(e) => updateRestaurant({ tagline: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted">Phone Number</label>
                <Input
                  value={restaurant.phone}
                  onChange={(e) => updateRestaurant({ phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted">Email</label>
                <Input
                  value={restaurant.email}
                  onChange={(e) => updateRestaurant({ email: e.target.value })}
                  placeholder="hello@restaurant.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted">Website</label>
                <Input
                  value={restaurant.website}
                  onChange={(e) => updateRestaurant({ website: e.target.value })}
                  placeholder="www.restaurant.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-muted">GST Number</label>
                <Input
                  value={restaurant.gstNumber}
                  onChange={(e) => updateRestaurant({ gstNumber: e.target.value })}
                  placeholder="27AABCS1234F1Z5"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs text-muted">Address</label>
                <Input
                  value={restaurant.address}
                  onChange={(e) => updateRestaurant({ address: e.target.value })}
                  placeholder="12 MG Road, Mumbai 400001"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs text-muted">Bill Footer Message</label>
                <Input
                  value={restaurant.footer || ""}
                  onChange={(e) => updateRestaurant({ footer: e.target.value })}
                  placeholder="Thank you for dining with us!"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                className="gap-2"
                onClick={() => {
                  setRestaurantSaved(true);
                  setTimeout(() => setRestaurantSaved(false), 2000);
                }}
              >
                <Save className="h-4 w-4" /> {restaurantSaved ? "Saved!" : "Save Details"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FEATURE_TOGGLES: { key: keyof PosFeatures; label: string; desc: string }[] = [
  { key: "instantPos", label: "Instant POS", desc: "Quick-sale cart for walk-in / takeaway orders" },
  { key: "tableDining", label: "Table Dining", desc: "Table service with session holding & checkout" },
  { key: "onlineOrders", label: "Online Orders Hub", desc: "Accept/reject incoming Zomato/Swiggy orders" },
  { key: "reservations", label: "Reservations", desc: "Schedule, assign, and manage table reservations" },
  { key: "websiteBuilder", label: "Website Builder", desc: "Build & customize the public-facing landing page" },
  { key: "marketing", label: "Marketing Automations", desc: "Campaigns, automations, and templates across WhatsApp, SMS & Email" },
];
