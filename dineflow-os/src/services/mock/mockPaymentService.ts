import type { PaymentService } from "../index";
import { genId } from "./mockOrderService";

export const mockPaymentService: PaymentService = {
  async createPaymentIntent(orderId, amount) {
    console.log(`[PaymentService] Creating intent for order ${orderId} of ${amount}`);
    return { id: `pi_${genId()}` };
  },
  async verifyPayment(paymentId) {
    console.log(`[PaymentService] Verifying payment ${paymentId}...`);
    await new Promise((res) => setTimeout(res, 1500));
    return true;
  },
  async refundPayment(paymentId) {
    console.log(`[PaymentService] Refunding payment ${paymentId}`);
  },
};
