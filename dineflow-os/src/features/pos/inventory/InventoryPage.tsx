import { useEffect, useState } from "react";
import { services } from "@/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePermission } from "@/lib/permissions";
import { InventoryForm } from "./InventoryForm";
import { Package, AlertTriangle, Plus, Edit3, Trash2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/cn";
import type { InventoryItem } from "@/services/types";

export function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adjAmount, setAdjAmount] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const canRestock = usePermission("inventory:restock");
  const canCreate = usePermission("inventory:create");
  const canEdit = usePermission("inventory:edit");
  const canDelete = usePermission("inventory:delete");

  async function refresh() {
    setLoading(true);
    const all = await services.inventory.getAllItems();
    setItems(all);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function handleAddStock() {
    if (!editingId) return;
    await services.inventory.addStock(editingId, adjAmount);
    setAdjAmount(0);
    setEditingId(null);
    await refresh();
  }

  function openForm(item?: InventoryItem) {
    setEditingItem(item ?? null);
    setFormOpen(true);
  }

  async function handleDelete(id: string) {
    await services.inventory.deleteItem(id);
    refresh();
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Inventory</h1>
          <p className="mt-1 text-sm text-muted">
            Manage raw ingredients and BOH stock levels.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="mr-1 h-4 w-4" /> Refresh Stock
          </Button>
          {canCreate && (
            <Button className="gap-2" onClick={() => openForm()}>
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 w-full rounded-xl border border-border bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.length === 0 && (
            <p className="py-12 text-center text-muted">No inventory items. Add one to get started.</p>
          )}
          {items.map((item) => {
            const isLow = item.currentStock <= item.threshold;
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4 transition-colors",
                  isLow ? "border-danger/40 bg-danger/5" : "border-border bg-surface"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2 text-muted">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{item.name}</p>
                      {isLow && (
                        <span className="flex items-center gap-1 rounded-full bg-danger/20 px-2 py-0.5 text-[10px] font-bold text-danger uppercase tracking-tight">
                          <AlertTriangle className="h-3 w-3" /> Low Stock
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted">SKU: {item.sku} · Min: {item.minStock}{item.unit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-muted">Current Stock</p>
                    <p className={cn("font-serif text-lg", isLow ? "text-danger" : "text-foreground")}>
                      {item.currentStock} {item.unit}
                    </p>
                  </div>

                  {editingId === item.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={adjAmount}
                        onChange={(e) => setAdjAmount(parseInt(e.target.value) || 0)}
                        className="w-20 h-9"
                      />
                      <Button size="sm" onClick={handleAddStock}>
                        Add
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      {canRestock && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => setEditingId(item.id)}
                        >
                          <Plus className="h-3 w-3" /> Restock
                        </Button>
                      )}
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8"
                          onClick={() => openForm(item)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 text-danger hover:text-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inventory Form Dialog */}
      <InventoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editingItem ?? undefined}
        onSave={async (data) => {
          if (editingItem) {
            await services.inventory.updateItem(editingItem.id, data);
          } else {
            await services.inventory.createItem(data);
          }
          refresh();
        }}
      />
    </div>
  );
}
