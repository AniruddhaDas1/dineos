import type {
  Category,
  Customer,
  CustomerProfile,
  DeliveryAddress,
  Feedback,
  Floor,
  MenuItem,
  Order,
  OrderChannel,
  OrderStatus,
  Permission,
  Restaurant,
  AssistanceType,
  CartLine,
  InventoryItem,
  InventoryService,
  StaffMember,
  StaffService,
  Table,
  TableService,
  RecommendationService,
  ForecastService,
  PricingService,
  NLPUnderstandingService,
  SentimentService,
} from "./types";

export type {
  Category,
  Customer,
  CustomerProfile,
  DeliveryAddress,
  Feedback,
  Floor,
  MenuItem,
  Order,
  OrderChannel,
  OrderStatus,
  Permission,
  Restaurant,
  AssistanceType,
  CartLine,
  InventoryItem,
  InventoryService,
  StaffMember,
  StaffService,
  Table,
  TableService,
  RecommendationService,
  ForecastService,
  PricingService,
  NLPUnderstandingService,
  SentimentService,
};

export type Unsubscribe = () => void;

export interface PlaceOrderInput {
  tableId: string;
  tableNumber: number;
  customer: Customer;
  lines: CartLine[];
  subtotal: number;
  gst: number;
  serviceCharge: number;
  deliveryFee?: number;
  total: number;
  channel?: OrderChannel;
  deliveryAddress?: DeliveryAddress;
  deliveryInstructions?: string;
  scheduledFor?: number;
  initialStatus?: "pending_acceptance" | "received";
}

export interface MenuService {
  getRestaurant(): Promise<Restaurant>;
  getCategories(): Promise<Category[]>;
  getMenuItems(): Promise<MenuItem[]>;
  getItem(id: string): Promise<MenuItem | undefined>;
  createItem(item: Omit<MenuItem, "id">): Promise<MenuItem>;
  updateItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem>;
  deleteItem(id: string): Promise<void>;
  createCategory(cat: Omit<Category, "id">): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}

export interface OrderService {
  placeOrder(input: PlaceOrderInput): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  getActiveOrders(): Promise<Order[]>;
  getActiveOrder(
    tableId: string,
    customer: Customer
  ): Promise<Order | undefined>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  cancelOrder(orderId: string): Promise<void>;
  subscribeToStatus(
    orderId: string,
    cb: (status: OrderStatus) => void
  ): Unsubscribe;
  requestBill(orderId: string): Promise<void>;
  requestAssistance(orderId: string, type: AssistanceType): Promise<void>;
}

export interface PaymentService {
  createPaymentIntent(orderId: string, amount: number): Promise<{ id: string }>;
  verifyPayment(paymentId: string): Promise<boolean>;
  refundPayment(paymentId: string): Promise<void>;
}

export interface NotificationService {
  sendOrderUpdate(customerId: string, status: OrderStatus): Promise<void>;
  sendPaymentReminder(customerId: string, amount: number): Promise<void>;
  notifyStaff(message: string, priority: "low" | "high"): Promise<void>;
}

export interface PrintService {
  printReceipt(orderId: string): Promise<void>;
  printKdsTicket(orderId: string): Promise<void>;
}

export interface CustomerService {
  getHistory(customer: Customer): Promise<Order[]>;
  submitFeedback(feedback: Feedback): Promise<void>;
  getFeedbacks(): Promise<(Feedback & { customerName?: string })[]>;
  getCustomerProfile(mobile: string): Promise<CustomerProfile | undefined>;
  getAllProfiles(): Promise<CustomerProfile[]>;
}

export interface Services {
  menu: MenuService;
  order: OrderService;
  customer: CustomerService;
  payment: PaymentService;
  notification: NotificationService;
  print: PrintService;
  inventory: InventoryService;
  staff: StaffService;
  table: TableService;
  recommendation: RecommendationService;
  forecast: ForecastService;
  pricing: PricingService;
  nlp: NLPUnderstandingService;
  sentiment: SentimentService;
}

import { mockMenuService } from "./mock/mockMenuService";
import { mockOrderService } from "./mock/mockOrderService";
import { mockCustomerService } from "./mock/mockCustomerService";
import { mockPaymentService } from "./mock/mockPaymentService";
import { mockNotificationService } from "./mock/mockNotificationService";
import { mockPrintService } from "./mock/mockPrintService";
import { mockInventoryService } from "./mock/mockInventoryService";
import { mockStaffService } from "./mock/mockStaffService";
import { mockTableService } from "./mock/mockTableService";
import { mockRecommendationService } from "./mock/mockRecommendationService";
import { mockForecastService } from "./mock/mockForecastService";
import { mockPricingService } from "./mock/mockPricingService";
import { mockNLUService } from "./mock/mockNLUService";
import { mockSentimentService } from "./mock/mockSentimentService";

// DI seam: swap mock for firebase later without touching UI/stores.
export const services: Services = {
  menu: mockMenuService,
  order: mockOrderService,
  customer: mockCustomerService,
  payment: mockPaymentService,
  notification: mockNotificationService,
  print: mockPrintService,
  inventory: mockInventoryService,
  staff: mockStaffService,
  table: mockTableService,
  recommendation: mockRecommendationService,
  forecast: mockForecastService,
  pricing: mockPricingService,
  nlp: mockNLUService,
  sentiment: mockSentimentService,
};

