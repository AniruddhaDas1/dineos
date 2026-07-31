import type { PrintService } from "../index";

export const mockPrintService: PrintService = {
  async printReceipt(orderId: string) {
    console.log(`[PrintService] Sending receipt job for order ${orderId} to thermal printer...`);
    // Simulate hardware delay
    await new Promise((res) => setTimeout(res, 800));
    // Use the browser's print functionality for simulation
    window.print();
  },
  async printKdsTicket(orderId: string) {
    console.log(`[PrintService] Printing kitchen ticket for order ${orderId}...`);
    await new Promise((res) => setTimeout(res, 500));
  },
};
