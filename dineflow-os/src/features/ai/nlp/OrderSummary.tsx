import { motion } from "framer-motion";
import { ShoppingBag, X } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { formatCurrency } from "@/lib/format";

function OrderSummaryContent() {
  const lines = useCartStore((s) => s.lines);
  const subtotal = useCartStore((s) => s.subtotal);

  if (lines.length === 0) {
    return (
      <div className="px-4 py-3 text-center text-xs text-muted">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="px-3 py-2">
      <div className="mb-2 border-b border-border pb-1.5 text-xs font-medium text-muted">
        Order Summary ({lines.reduce((s, l) => s + l.quantity, 0)} items)
      </div>
      <div className="max-h-32 overflow-y-auto space-y-1.5">
        {lines.slice(0, 4).map((line) => (
          <div key={line.id} className="flex items-center justify-between text-xs">
            <span className="truncate">
              {line.name}
              {line.quantity > 1 && <span className="text-muted"> ×{line.quantity}</span>}
            </span>
            <span>{formatCurrency(line.unitPrice * line.quantity)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-border pt-1.5 flex justify-between text-xs font-medium">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
    </div>
  );
}

export function OrderSummary() {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="border-t border-border bg-surface-2"
    >
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <ShoppingBag className="h-3 w-3" />
          <span>Order Summary</span>
        </div>
        <X className="h-3 w-3 text-muted cursor-pointer hover:text-foreground" />
      </div>
      <OrderSummaryContent />
    </motion.div>
  );
}
