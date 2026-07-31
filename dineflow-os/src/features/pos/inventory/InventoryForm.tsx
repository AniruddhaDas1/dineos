import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { InventoryItem } from "@/services/types";

const UNITS = ["kg", "l", "pcs", "g", "ml"] as const;

interface InventoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem;
  onSave: (data: { name: string; sku: string; currentStock: number; unit: InventoryItem["unit"]; threshold: number; minStock: number }) => void;
}

export function InventoryForm({ open, onOpenChange, item, onSave }: InventoryFormProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [currentStock, setCurrentStock] = useState(0);
  const [unit, setUnit] = useState<InventoryItem["unit"]>("pcs");
  const [threshold, setThreshold] = useState(100);
  const [minStock, setMinStock] = useState(50);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setSku(item.sku);
      setCurrentStock(item.currentStock);
      setUnit(item.unit);
      setThreshold(item.threshold);
      setMinStock(item.minStock);
    } else {
      setName("");
      setSku("");
      setCurrentStock(0);
      setUnit("pcs");
      setThreshold(100);
      setMinStock(50);
    }
  }, [item, open]);

  function handleSave() {
    if (!name.trim() || !sku.trim()) return;
    onSave({ name: name.trim(), sku: sku.trim().toUpperCase(), currentStock, unit, threshold, minStock });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? "Edit Inventory Item" : "Add Inventory Item"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicken Breast" />
          </div>
          <div className="space-y-2">
            <Label>SKU</Label>
            <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g. CHICK-001" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Stock</Label>
              <Input type="number" value={currentStock} onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as InventoryItem["unit"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Low Stock Threshold</Label>
              <Input type="number" value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Minimum Stock</Label>
              <Input type="number" value={minStock} onChange={(e) => setMinStock(parseInt(e.target.value) || 0)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !sku.trim()}>
            {item ? "Save Changes" : "Create Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
