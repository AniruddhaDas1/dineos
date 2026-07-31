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
import type { Floor, Table } from "@/services/types";

interface TableFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: Table;
  defaultFloorId?: string;
  floors: Floor[];
  onSave: (data: Omit<Table, "id">) => void;
}

export function TableForm({ open, onOpenChange, table, defaultFloorId, floors, onSave }: TableFormProps) {
  const [label, setLabel] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [floorId, setFloorId] = useState("");
  const [section, setSection] = useState("");

  useEffect(() => {
    if (table) {
      setLabel(table.label);
      setCapacity(table.capacity);
      setFloorId(table.floorId);
      setSection(table.section ?? "");
    } else {
      setLabel("");
      setCapacity(4);
      setFloorId(defaultFloorId ?? "");
      setSection("");
    }
  }, [table, defaultFloorId, open]);

  function handleSave() {
    if (!label.trim() || !floorId) return;
    onSave({
      label: label.trim(),
      capacity,
      floorId,
      section: section.trim() || undefined,
      status: table?.status,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{table ? "Edit Table" : "Add Table"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Table Label</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. T1, A-01"
            />
          </div>
          <div className="space-y-2">
            <Label>Capacity</Label>
            <Input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label>Floor</Label>
            <Select value={floorId} onValueChange={setFloorId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a floor" />
              </SelectTrigger>
              <SelectContent>
                {floors.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Section (optional)</Label>
            <Input
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. Window, Bar"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!label.trim() || !floorId}>
            {table ? "Save Changes" : "Create Table"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
