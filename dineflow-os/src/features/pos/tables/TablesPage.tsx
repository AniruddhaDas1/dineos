import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, ChevronDown, ChevronRight, Edit3, Trash2 } from "lucide-react";
import { services } from "@/services";
import { usePosStore } from "@/stores/pos.store";
import { usePermission } from "@/lib/permissions";
import { TableStatusBadge } from "../components/TableStatusBadge";
import { FloorForm } from "./FloorForm";
import { TableForm } from "./TableForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { TableStatus } from "../components/TableStatusBadge";
import type { Floor, Table } from "@/services/types";

export function TablesPage() {
  const orders = usePosStore((s) => s.orders);
  const navigate = useNavigate();
  const [floors, setFloors] = useState<Floor[]>([]);
  const [allTables, setAllTables] = useState<Table[]>([]);
  const [expandedFloors, setExpandedFloors] = useState<Set<string>>(new Set());
  const [floorFormOpen, setFloorFormOpen] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [tableFormOpen, setTableFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [targetFloorId, setTargetFloorId] = useState<string>("");

  const canManageFloors = usePermission("tables:manageFloors");
  const canCreateTable = usePermission("tables:create");
  const canEditTable = usePermission("tables:edit");
  const canDeleteTable = usePermission("tables:delete");

  async function loadData() {
    const [f, t] = await Promise.all([services.table.getFloors(), services.table.getTables()]);
    setFloors(f);
    setAllTables(t);
  }

  useEffect(() => { loadData(); }, []);

  const tableStatus = useMemo(() => {
    const statusMap = new Map<string, { status: TableStatus; orderId?: string }>();
    for (const t of allTables) {
      statusMap.set(t.id, { status: "available" });
    }
    for (const order of orders) {
      const current = statusMap.get(order.tableId);
      if (!current || current.status === "available") {
        const s: TableStatus =
          order.status === "billed"
            ? "billed"
            : ["received", "preparing", "ready", "served"].includes(order.status)
              ? "occupied"
              : "available";
        statusMap.set(order.tableId, {
          status: s,
          orderId: s === "occupied" || s === "billed" ? order.id : undefined,
        });
      }
    }
    return statusMap;
  }, [orders, allTables]);

  function toggleFloor(id: string) {
    setExpandedFloors((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function openFloorForm(floor?: Floor) {
    setEditingFloor(floor ?? null);
    setFloorFormOpen(true);
  }

  function openTableForm(floorId: string, table?: Table) {
    setTargetFloorId(floorId);
    setEditingTable(table ?? null);
    setTableFormOpen(true);
  }

  async function handleDeleteFloor(id: string) {
    await services.table.deleteFloor(id);
    loadData();
  }

  async function handleDeleteTable(id: string) {
    await services.table.deleteTable(id);
    loadData();
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Tables</h1>
          <p className="mt-1 text-sm text-muted">Floor plan overview</p>
        </div>
        {canManageFloors && (
          <Button className="gap-2" onClick={() => openFloorForm()}>
            <Plus className="h-4 w-4" /> Add Floor
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {floors.length === 0 && (
          <p className="py-12 text-center text-muted">No floors configured. Add one to get started.</p>
        )}
        {floors.map((floor) => {
          const floorTables = allTables.filter((t) => t.floorId === floor.id);
          const isExpanded = expandedFloors.has(floor.id);
          return (
            <div key={floor.id} className="rounded-xl border border-border bg-surface">
              <button
                onClick={() => toggleFloor(floor.id)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted" />
                  )}
                  <span className="font-serif text-lg">{floor.name}</span>
                  <span className="text-sm text-muted">
                    ({floorTables.length} table{floorTables.length !== 1 ? "s" : ""})
                  </span>
                </div>
                {canManageFloors && (
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8"
                      onClick={() => openFloorForm(floor)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 text-danger hover:text-danger"
                      onClick={() => handleDeleteFloor(floor.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </button>
              {isExpanded && (
                <div className="border-t border-border px-5 py-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {floorTables.map((table) => {
                      const info = tableStatus.get(table.id) ?? { status: "available" as TableStatus };
                      return (
                        <div
                          key={table.id}
                          className={cn(
                            "flex flex-col items-center rounded-xl border border-border bg-surface-2 p-4 transition-colors",
                            info.status === "occupied" ? "ring-1 ring-accent/30" : "",
                            info.status === "available" ? "opacity-70" : ""
                          )}
                        >
                          <button
                            onClick={() => {
                              if (info.orderId) navigate(`/pos/orders/${info.orderId}`);
                            }}
                            className="flex flex-col items-center"
                          >
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent/40 text-xl font-serif text-accent">
                              {table.label}
                            </div>
                            <div className="mt-2 flex items-center gap-1 text-xs text-muted">
                              <Users className="h-3 w-3" />
                              <span>{table.capacity}p</span>
                            </div>
                            {table.section && (
                              <span className="mt-0.5 text-[10px] text-muted">{table.section}</span>
                            )}
                            <div className="mt-1.5">
                              <TableStatusBadge status={info.status} />
                            </div>
                          </button>
                          <div className="mt-2 flex items-center gap-1 border-t border-border pt-2">
                            {canEditTable && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7"
                                onClick={() => openTableForm(table.floorId, table)}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            )}
                            {canDeleteTable && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 text-danger hover:text-danger"
                                onClick={() => handleDeleteTable(table.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {canCreateTable && (
                      <button
                        onClick={() => openTableForm(floor.id)}
                        className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-2 p-4 text-muted transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        <Plus className="h-8 w-8" />
                        <span className="mt-2 text-sm">Add Table</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floor Form Dialog */}
      <FloorForm
        open={floorFormOpen}
        onOpenChange={setFloorFormOpen}
        floor={editingFloor ?? undefined}
        onSave={async (data) => {
          if (editingFloor) {
            await services.table.updateFloor(editingFloor.id, data);
          } else {
            await services.table.createFloor(data);
          }
          loadData();
        }}
      />

      {/* Table Form Dialog */}
      <TableForm
        open={tableFormOpen}
        onOpenChange={setTableFormOpen}
        table={editingTable ?? undefined}
        defaultFloorId={targetFloorId}
        floors={floors}
        onSave={async (data) => {
          if (editingTable) {
            await services.table.updateTable(editingTable.id, data);
          } else {
            await services.table.createTable(data);
          }
          loadData();
        }}
      />
    </div>
  );
}
