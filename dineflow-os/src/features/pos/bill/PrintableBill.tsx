import type { Order } from "@/services/types";
import { useRestaurantStore } from "@/stores/restaurant.store";
import { formatCurrency } from "@/lib/format";

interface PrintableBillProps {
  order: Order;
  format: "85mm" | "58mm" | "a4";
}

export function PrintableBill({ order, format }: PrintableBillProps) {
  const restaurant = useRestaurantStore((s) => s.details);
  const isThermal = format === "85mm" || format === "58mm";
  const cssClass = format === "a4" ? "print-a4" : `print-${format}`;

  const orderType =
    order.tableId === "online"
      ? order.channel === "pickup"
        ? "Pickup"
        : "Delivery"
      : `Table ${order.tableNumber}`;

  const orderDate = new Date(order.placedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className={cssClass}>
      {/* Header */}
      <div className="bill-header">
        <h2>{restaurant.name}</h2>
        {!isThermal && <p className="restaurant-tagline">{restaurant.tagline}</p>}
        <div className="contact-info">
          <p>{restaurant.address}</p>
          <p>Phone: {restaurant.phone}</p>
          <p>Email: {restaurant.email}</p>
          <p>Web: {restaurant.website}</p>
          <p>GST No: {restaurant.gstNumber}</p>
        </div>
      </div>

      {/* Order meta */}
      <div className={isThermal ? "" : "bill-meta"}>
        <p>Bill #{order.id.slice(-5)} · {orderType}</p>
        <p>{orderDate}</p>
      </div>

      <hr className="bill-separator" />

      {/* Items */}
      <div className="bill-items">
        {!isThermal && <h3>Items</h3>}
        {order.lines.map((line) => (
          <div key={line.id} className="bill-item">
            <div className="item-details">
              <div className="item-name">
                {line.quantity}× {line.name}
              </div>
              {line.selectedAddOns.length > 0 && (
                <div className="item-addons">
                  + {line.selectedAddOns.map((a) => a.name).join(", ")}
                </div>
              )}
            </div>
            <div className="item-price">
              {formatCurrency(line.unitPrice * line.quantity)}
            </div>
          </div>
        ))}
      </div>

      <hr className="bill-separator" />

      {/* Totals */}
      <div className="bill-totals">
        <div className="total-row">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="total-row">
          <span>GST ({restaurant.gstPercent}%)</span>
          <span>{formatCurrency(order.gst)}</span>
        </div>
        <div className="total-row">
          <span>Service Charge ({restaurant.serviceChargePercent}%)</span>
          <span>{formatCurrency(order.serviceCharge)}</span>
        </div>
        {order.deliveryFee != null && order.deliveryFee > 0 && (
          <div className="total-row">
            <span>Delivery Fee</span>
            <span>{formatCurrency(order.deliveryFee)}</span>
          </div>
        )}
        <div className="total-row grand-total">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="bill-footer">
        {restaurant.footer && <p className="thank-you">{restaurant.footer}</p>}
        {isThermal && <p>{restaurant.phone} | {restaurant.website}</p>}
      </div>
    </div>
  );
}
