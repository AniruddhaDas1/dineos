import type {
  Category,
  Customer,
  Feedback,
  MenuItem,
  Order,
  OrderStatus,
  Restaurant,
  AssistanceType,
  CartLine,
} from "./types";

export type Unsubscribe = () => void;

export interface PlaceOrderInput {
  tableId: string;
  tableNumber: number;
  customer: Customer;
  lines: CartLine[];
  subtotal: number;
  gst: number;
  serviceCharge: number;
  total: number;
}

export interface MenuService {
  getRestaurant(): Promise<Restaurant>;
  getCategories(): Promise<Category[]>;
  getMenuItems(): Promise<MenuItem[]>;
  getItem(id: string): Promise<MenuItem | undefined>;
}

export interface OrderService {
  placeOrder(input: PlaceOrderInput): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getActiveOrder(
    tableId: string,
    customer: Customer
  ): Promise<Order | undefined>;
  subscribeToStatus(
    orderId: string,
    cb: (status: OrderStatus) => void
  ): Unsubscribe;
  requestBill(orderId: string): Promise<void>;
  requestAssistance(orderId: string, type: AssistanceType): Promise<void>;
}

export interface CustomerService {
  getHistory(customer: Customer): Promise<Order[]>;
  submitFeedback(feedback: Feedback): Promise<void>;
}

export interface Services {
  menu: MenuService;
  order: OrderService;
  customer: CustomerService;
}

import { mockMenuService } from "./mock/mockMenuService";
import { mockOrderService } from "./mock/mockOrderService";
import { mockCustomerService } from "./mock/mockCustomerService";

// DI seam: swap mock for firebase later without touching UI/stores.
export const services: Services = {
  menu: mockMenuService,
  order: mockOrderService,
  customer: mockCustomerService,
};
