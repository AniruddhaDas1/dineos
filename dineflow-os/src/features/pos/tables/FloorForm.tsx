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
import type { Floor } from "@/services/types";

interface FloorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  floor?: Floor;
  onSave: (data: { name: string; order: number }) => void;
}

export function FloorForm({ open, onOpenChange, floor, onSave }: FloorFormProps) {
  const [name, setName] = useState("");
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (floor) {
      setName(floor.name);
      setOrder(floor.order);
    } else {
      setName("");
      setOrder(0);
    }
  }, [floor, open]);

  function handleSave() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), order });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{floor ? "Edit Floor" : "Add Floor"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Floor Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Main Hall, Terrace"
            />
          </div>
          <div className="space-y-2">
            <Label>Display Order</Label>
            <Input
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {floor ? "Save Changes" : "Create Floor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
