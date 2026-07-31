import type { NotificationService } from "../index";

export const mockNotificationService: NotificationService = {
  async sendOrderUpdate(customerId, status) {
    console.log(`[NotificationService] SMS/WhatsApp to ${customerId}: Your order is now ${status}!`);
  },
  async sendPaymentReminder(customerId, amount) {
    console.log(`[NotificationService] Reminder to ${customerId}: Payment of ${amount} is pending.`);
  },
  async notifyStaff(message, priority) {
    console.log(`[NotificationService] STAFF ALERT (${priority}): ${message}`);
  },
};
