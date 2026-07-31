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
import { ROLE_LABELS, ROLE_HIERARCHY, isRoleAtOrBelow } from "@/lib/permissions";
import type { StaffMember, StaffRole } from "@/services/types";

interface StaffFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: StaffMember;
  currentUserRole: StaffRole;
  onSave: (data: { name: string; pin: string; role: StaffRole }) => void;
}

export function StaffForm({ open, onOpenChange, staff, currentUserRole, onSave }: StaffFormProps) {
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState<StaffRole>("user");

  useEffect(() => {
    if (staff) {
      setName(staff.name);
      setPin(staff.pin);
      setRole(staff.role);
    } else {
      setName("");
      setPin("");
      setRole("user");
    }
  }, [staff, open]);

  const availableRoles = ROLE_HIERARCHY.filter((r) =>
    isRoleAtOrBelow(r, currentUserRole)
  );

  function handleSave() {
    if (!name.trim() || !pin.trim() || pin.length < 4) return;
    onSave({ name: name.trim(), pin, role });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{staff ? "Edit Staff Member" : "Add Staff Member"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="space-y-2">
            <Label>PIN</Label>
            <Input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="4-digit PIN"
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
              <SelectTrigger>
                <SelectValue>
                  {role ? ROLE_LABELS[role] : "Select role"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((r) => (
                  <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !pin.trim() || pin.length !== 4}>
            {staff ? "Save Changes" : "Add Staff"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
