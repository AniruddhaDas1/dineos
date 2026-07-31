import type { Order } from "@/services/types";

type PrintFormat = "85mm" | "58mm" | "a4";

export function printBill(order: Order, format: PrintFormat) {
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (!printWindow) {
    alert("Please allow popups to print bills");
    return;
  }

  const restaurant = JSON.parse(
    localStorage.getItem("dineflow-restaurant") || "{}"
  );

  const restaurantName = restaurant.name || "Restaurant";
  const restaurantTagline = restaurant.tagline || "";
  const restaurantAddress = restaurant.address || "";
  const restaurantPhone = restaurant.phone || "";
  const restaurantEmail = restaurant.email || "";
  const restaurantWebsite = restaurant.website || "";
  const restaurantGst = restaurant.gstNumber || "";
  const restaurantFooter = restaurant.footer || "Thank you for dining with us!";
  const gstPercent = restaurant.gstPercent || 5;
  const serviceChargePercent = restaurant.serviceChargePercent || 10;

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

  const itemsHtml = order.lines
    .map(
      (line) => `
      <div class="bill-item">
        <div class="item-details">
          <div class="item-name">${line.quantity}× ${line.name}</div>
          ${
            line.selectedAddOns.length > 0
              ? `<div class="item-addons">+ ${line.selectedAddOns.map((a) => a.name).join(", ")}</div>`
              : ""
          }
        </div>
        <div class="item-price">₹${Math.round(line.unitPrice * line.quantity)}</div>
      </div>
    `
    )
    .join("");

  const isThermal = format === "85mm" || format === "58mm";
  const width = format === "a4" ? "210mm" : format === "85mm" ? "80mm" : "48mm";
  const cssClass = format === "a4" ? "print-a4" : `print-${format}`;

  const contactHtml = `
    <p>${restaurantAddress}</p>
    <p>Phone: ${restaurantPhone}</p>
    <p>Email: ${restaurantEmail}</p>
    <p>Web: ${restaurantWebsite}</p>
    <p>GST No: ${restaurantGst}</p>
  `;

  const deliveryFeeRow =
    order.deliveryFee != null && order.deliveryFee > 0
      ? `<div class="total-row"><span>Delivery Fee</span><span>₹${Math.round(order.deliveryFee)}</span></div>`
      : "";

  const footerHtml = isThermal
    ? `<p>${restaurantPhone} | ${restaurantWebsite}</p>`
    : `<p class="thank-you">${restaurantFooter}</p>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Bill - ${order.id.slice(-5)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${isThermal ? '"Courier New", Courier, monospace' : '"Georgia", "Times New Roman", serif'}; font-size: ${format === "58mm" ? "10px" : format === "85mm" ? "12px" : "12px"}; color: ${isThermal ? "#000" : "#333"}; background: #fff; }
    
    .${cssClass} {
      width: ${width};
      padding: ${format === "a4" ? "20mm" : format === "85mm" ? "5mm" : "3mm"};
      margin: 0 auto;
    }
    
    .bill-header { text-align: center; margin-bottom: ${isThermal ? "4mm" : "8mm"}; ${!isThermal ? "border-bottom: 2px solid #c9a24b; padding-bottom: 8mm;" : ""} }
    .bill-header h2 { font-size: ${format === "58mm" ? "12px" : format === "85mm" ? "14px" : "28px"}; font-weight: bold; margin: 0 0 2mm 0; ${!isThermal ? "color: #0e0e10;" : ""} }
    .restaurant-tagline { font-size: 14px; color: #9a958c; font-style: italic; margin: 0 0 4mm 0; }
    .contact-info { font-size: ${isThermal ? "10px" : "10px"}; ${isThermal ? "" : "color: #666; line-height: 1.6;"} }
    .contact-info p { margin: ${isThermal ? "1mm" : "0.5mm"} 0; }
    
    .bill-separator { border: none; border-top: ${isThermal ? "1px dashed #000" : "1px solid #e0e0e0"}; margin: ${isThermal ? "3mm" : "6mm"} 0; }
    
    .bill-meta { ${isThermal ? "" : "display: flex; justify-content: space-between; margin-bottom: 8mm; font-size: 11px; color: #666;"} }
    .bill-meta p { ${isThermal ? "margin: 1mm 0; font-size: 10px;" : ""} }
    
    .bill-items { margin: ${isThermal ? "3mm" : "6mm"} 0; }
    .bill-items h3 { font-size: 14px; ${!isThermal ? "color: #0e0e10; margin: 0 0 4mm 0; text-transform: uppercase; letter-spacing: 1px;" : "margin-bottom: 2mm;"} }
    
    .bill-item { display: flex; justify-content: space-between; padding: ${isThermal ? "1mm 0" : "2mm 0"}; ${!isThermal ? "border-bottom: 1px dotted #e0e0e0;" : ""} }
    .item-details { flex: 1; }
    .item-name { ${!isThermal ? "font-weight: 500; color: #0e0e10;" : ""} }
    .item-addons { font-size: ${isThermal ? "8px" : "10px"}; ${isThermal ? "" : "color: #9a958c;"} margin-top: 1mm; }
    .item-price { width: ${format === "a4" ? "35mm" : format === "85mm" ? "25mm" : "18mm"}; text-align: right; ${!isThermal ? "font-weight: 500; color: #0e0e10;" : ""} }
    
    .bill-totals { margin: ${isThermal ? "3mm" : "8mm"} 0; ${!isThermal ? "padding: 4mm; background: #f9f7f3; border-radius: 4px;" : ""} }
    .total-row { display: flex; justify-content: space-between; padding: ${isThermal ? "1mm 0" : "1.5mm 0"}; font-size: ${isThermal ? "" : "11px"}; }
    .total-row.grand-total { font-weight: bold; font-size: ${format === "58mm" ? "12px" : format === "85mm" ? "14px" : "16px"}; ${isThermal ? "" : "color: #0e0e10; border-top: 2px solid #c9a24b; padding-top: 3mm; margin-top: 3mm;"} ${isThermal ? "border-top: 1px dashed #000; padding-top: 2mm; margin-top: 2mm;" : ""} }
    
    .bill-footer { text-align: center; margin-top: ${isThermal ? "4mm" : "10mm"}; ${!isThermal ? "padding-top: 6mm; border-top: 2px solid #c9a24b;" : ""} }
    .thank-you { font-size: 14px; color: #c9a24b; font-style: italic; margin-bottom: 2mm; }
    .footer-info { font-size: 9px; color: #9a958c; }
  </style>
</head>
<body>
  <div class="${cssClass}">
    <div class="bill-header">
      <h2>${restaurantName}</h2>
      ${!isThermal ? `<p class="restaurant-tagline">${restaurantTagline}</p>` : ""}
      <div class="contact-info">${contactHtml}</div>
    </div>
    
    <div class="bill-meta">
      <p>Bill #${order.id.slice(-5)} · ${orderType}</p>
      ${isThermal ? "" : `<p>${orderDate}</p>`}
    </div>
    
    <hr class="bill-separator" />
    
    <div class="bill-items">
      ${!isThermal ? "<h3>Items</h3>" : ""}
      ${itemsHtml}
    </div>
    
    <hr class="bill-separator" />
    
    <div class="bill-totals">
      <div class="total-row"><span>Subtotal</span><span>₹${Math.round(order.subtotal)}</span></div>
      <div class="total-row"><span>GST (${gstPercent}%)</span><span>₹${Math.round(order.gst)}</span></div>
      <div class="total-row"><span>Service Charge (${serviceChargePercent}%)</span><span>₹${Math.round(order.serviceCharge)}</span></div>
      ${deliveryFeeRow}
      <div class="total-row grand-total"><span>Total</span><span>₹${Math.round(order.total)}</span></div>
    </div>
    
    <div class="bill-footer">
      ${footerHtml}
    </div>
  </div>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
  };
}
