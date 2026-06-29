import { useNavigate, useParams } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { formatCurrency } from "@/lib/format";

export function CartBar() {
  const { tableId = "" } = useParams();
  const navigate = useNavigate();
  const count = useCartStore((s) => s.count);
  const subtotal = useCartStore((s) => s.subtotal);
  if (count === 0) return null;
  return (
    <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <button
        onClick={() => navigate(`/table/${tableId}/cart`)}
        className="flex w-full items-center justify-between rounded-xl bg-accent px-5 py-3.5 text-accent-foreground shadow-lg"
      >
        <span className="flex items-center gap-2 font-medium">
          <ShoppingBag className="h-5 w-5" /> {count} item{count > 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-2 font-semibold">
          {formatCurrency(subtotal)} →
        </span>
      </button>
    </div>
  );
}
