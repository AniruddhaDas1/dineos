export type VegType = "veg" | "non-veg" | "egg";
export type SpiceLevel = 0 | 1 | 2 | 3;
export type Badge = "bestseller" | "chef-recommendation" | "popular" | "new";

export interface AddOn {
  id: string;
  name: string;
  price: number;
  selected?: boolean;
}

export interface AddOnGroup {
  id: string;
  name: string;
  required: boolean;
  min: number;
  max: number;
  options: AddOn[];
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  vegType: VegType;
  spiceLevel?: SpiceLevel;
  calories?: number;
  ingredients?: string[];
  badges?: Badge[];
  rating?: number;
  prepMinutes?: number;
  addOnGroups?: AddOnGroup[];
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  displayOrder: number;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  logoUrl: string;
  heroUrl: string;
  currency: string;
  gstPercent: number;
  serviceChargePercent: number;
}

export interface Table {
  id: string;
  number: number;
  seats: number;
}

export interface CartLine {
  id: string;
  itemId: string;
  name: string;
  basePrice: number;
  selectedAddOns: AddOn[];
  quantity: number;
  instructions?: string;
  unitPrice: number;
}

export interface Customer {
  name: string;
  mobile: string;
  isGuest?: boolean;
}

export type OrderStatus =
  | "received"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "billed";

export type AssistanceType = "waiter" | "water" | "tissue";

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  customer: Customer;
  lines: CartLine[];
  status: OrderStatus;
  placedAt: number;
  subtotal: number;
  gst: number;
  serviceCharge: number;
  total: number;
  specialRequests?: AssistanceType[];
}

export interface Feedback {
  orderId: string;
  rating: number;
  review?: string;
  createdAt: number;
}
