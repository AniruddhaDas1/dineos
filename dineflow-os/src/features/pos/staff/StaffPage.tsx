import { useEffect, useState } from "react";
import { services } from "@/services";
import { Button } from "@/components/ui/button";
import { usePermission, isRoleAtOrBelow } from "@/lib/permissions";
import { usePosAuthStore } from "@/stores/posAuth.store";
import { StaffForm } from "./StaffForm";
import { User, Users, Plus, Edit3, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import type { StaffMember, StaffRole } from "@/services/types";

export function StaffPage() {
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [activeStaff, setActiveStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const currentStaff = usePosAuthStore((s) => s.staff);
  const canCreate = usePermission("staff:create");
  const canEdit = usePermission("staff:edit");
  const canDelete = usePermission("staff:delete");

  async function refresh() {
    setLoading(true);
    const [all, active] = await Promise.all([
      services.staff.getAllStaff(),
      services.staff.getActiveStaff(),
    ]);
    setAllStaff(all);
    setActiveStaff(active);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  function openForm(staff?: StaffMember) {
    setEditingStaff(staff ?? null);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    await services.staff.deleteStaff(id);
    refresh();
  }

  function canManageRole(targetRole: StaffRole): boolean {
    if (!currentStaff) return false;
    return isRoleAtOrBelow(targetRole, currentStaff.role);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Staff Management</h1>
          <p className="mt-1 text-sm text-muted">
            Manage staff, roles, and active shifts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh}>
            Refresh Status
          </Button>
          {canCreate && (
            <Button className="gap-2" onClick={() => openForm()}>
              <Plus className="h-4 w-4" /> Add Staff
            </Button>
          )}
        </div>
      </div>

      {/* All staff overview */}
      <div className="mt-6">
        <div className="space-y-2">
          {allStaff.map((s) => {
            const isActive = activeStaff.some((a) => a.id === s.id);
            const canEditThis = canEdit && canManageRole(s.role);
            const canDeleteThis = canDelete && canManageRole(s.role);
            return (
              <div
                key={s.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4 transition-colors",
                  isActive
                    ? "border-success/40 bg-success/5"
                    : "border-border bg-surface"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-muted">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{s.name}</p>
                      <RoleBadge role={s.role} />
                    </div>
                    <p className="text-xs text-muted">
                      {isActive
                        ? `Clocked in${s.lastClockIn ? ` at ${new Date(s.lastClockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`
                        : "Not on shift"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                      isActive
                        ? "bg-success/15 text-success"
                        : "bg-surface-2 text-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        isActive ? "bg-success" : "bg-muted"
                      )}
                    />
                    {isActive ? "Active" : "Off shift"}
                  </span>
                  {canEditThis && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8"
                      onClick={() => openForm(s)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  )}
                  {canDeleteThis && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 text-danger hover:text-danger"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active count summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryCard label="Active Now" value={String(activeStaff.length)} />
        <SummaryCard label="Managers +" value={String(activeStaff.filter((s) => ["manager", "executive", "admin"].includes(s.role)).length)} />
        <SummaryCard label="Total Staff" value={String(allStaff.length)} />
      </div>

      {loading && allStaff.length === 0 && (
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-muted">
          <Users className="mb-3 h-8 w-8 opacity-40" />
          <p>Loading staff…</p>
        </div>
      )}

      {/* Staff Form Dialog */}
      <StaffForm
        open={formOpen}
        onOpenChange={setFormOpen}
        staff={editingStaff ?? undefined}
        currentUserRole={currentStaff?.role ?? "user"}
        onSave={async (data) => {
          if (editingStaff) {
            await services.staff.updateStaff(editingStaff.id, data);
          } else {
            await services.staff.createStaff(data);
          }
          refresh();
        }}
      />
    </div>
  );
}

function RoleBadge({ role }: { role: StaffMember["role"] }) {
  const configs: Record<StaffMember["role"], { label: string; color: string }> = {
    admin: { label: "Admin", color: "bg-red-500/15 text-red-400" },
    executive: { label: "Executive", color: "bg-amber-500/15 text-amber-400" },
    manager: { label: "Manager", color: "bg-purple-500/15 text-purple-400" },
    captain: { label: "Captain", color: "bg-blue-500/15 text-blue-400" },
    cashier: { label: "Cashier", color: "bg-gray-500/15 text-gray-400" },
    user: { label: "User", color: "bg-green-500/15 text-green-400" },
  };
  const cfg = configs[role];
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", cfg.color)}>
      {cfg.label}
    </span>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-serif text-xl">{value}</p>
    </div>
  );
}
