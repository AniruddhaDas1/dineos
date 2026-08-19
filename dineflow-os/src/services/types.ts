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
  phone: string;
  email: string;
  website: string;
  gstNumber: string;
  address: string;
  footer?: string;
}

export type Permission =
  | "dashboard:view"
  | "orders:view" | "orders:advance" | "orders:cancel" | "orders:bill" | "orders:print"
  | "tables:view" | "tables:create" | "tables:edit" | "tables:delete" | "tables:manageFloors"
  | "staff:view" | "staff:create" | "staff:edit" | "staff:delete"
  | "inventory:view" | "inventory:create" | "inventory:edit" | "inventory:delete" | "inventory:restock"
  | "crm:view" | "feedback:view"
  | "website:build"
  | "pos:instant" | "reservations:view" | "reservations:create" | "reservations:edit"
  | "menu:manage"
  | "marketing:view" | "marketing:manage"
  | "settings:view" | "settings:manage"
  | "aggregator:simulate" | "kds:view";

export type PermissionMatrix = Record<StaffRole, Set<Permission>>;

export interface Floor {
  id: string;
  name: string;
  order: number;
}

export interface Table {
  id: string;
  floorId: string;
  label: string;
  capacity: number;
  status?: "available" | "occupied" | "reserved" | "cleaning";
  section?: string;
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
  | "pending_acceptance"
  | "received"
  | "preparing"
  | "ready"
  | "served"
  | "completed"
  | "billed";

export type AssistanceType = "waiter" | "water" | "tissue";

export type OrderChannel = "dine-in" | "pickup" | "delivery";

export interface DeliveryAddress {
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  landmark?: string;
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  customer: Customer;
  lines: CartLine[];
  status: OrderStatus;
  channel?: OrderChannel;
  placedAt: number;
  subtotal: number;
  gst: number;
  serviceCharge: number;
  deliveryFee?: number;
  total: number;
  deliveryAddress?: DeliveryAddress;
  deliveryInstructions?: string;
  scheduledFor?: number;
  specialRequests?: AssistanceType[];
  paymentId?: string;
  source?: "direct" | "zomato" | "swiggy" | "ondc";
  rejectionReason?: string;
}

export interface Reservation {
  id: string;
  guestName: string;
  phone: string;
  guests: number;
  dateTime: number;
  tableId: string | null;
  status: "confirmed" | "seated" | "cancelled" | "no-show";
  notes?: string;
  createdAt: number;
}

export interface TableSession {
  id: string;
  tableId: string;
  waiterId: string;
  waiterName: string;
  cartLines: CartLine[];
  locked: boolean;
  startedAt: number;
}

export interface Feedback {
  orderId: string;
  rating: number;
  review?: string;
  createdAt: number;
}

export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

export type Segment = "vip" | "regular" | "new" | "at-risk" | "churned";

export interface WebsiteTheme {
  background: string;       // "240 6% 4%"
  surface: string;          // "240 5% 9%"
  surface2: string;         // "240 6% 13%"
  foreground: string;       // "39 31% 95%"
  muted: string;            // "39 12% 58%"
  border: string;           // "240 6% 17%"
  accent: string;           // "41 55% 54%"
  accentForeground: string; // "240 6% 4%"
}

export interface WebsiteMenuItem {
  name: string;
  description: string;
  price: number;
  image?: string;
  badge?: string;
}

export interface WebsiteReview {
  name: string;
  date: string;
  rating: number;
  text: string;
}

export interface WebsiteSocial {
  platform: string;
  url: string;
}

export interface WebsiteContent {
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
  logoUrl?: string;
  storyImage?: string;
  story: string;
  menuItems: WebsiteMenuItem[];
  gallery: { url: string; alt: string }[];
  reviews: WebsiteReview[];
  contact: { address: string; phone: string; email: string };
  hours: { day: string; time: string }[];
  social: WebsiteSocial[];
}

export interface WebsiteConfig {
  id: string;
  label: string;
  templateId: string;
  content: WebsiteContent;
  theme: WebsiteTheme;
  createdAt: number;
  updatedAt: number;
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  preview: string;
  theme: WebsiteTheme;
  content: WebsiteContent;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: number;
  validUntil: number;
  active: boolean;
}

export interface CustomerProfile extends Customer {
  visits: number;
  totalSpend: number;
  points: number;
  tier: LoyaltyTier;
  lastVisit: number;
  favoriteItems: string[];
  avgRating: number;
}

export type StaffRole = "admin" | "executive" | "manager" | "captain" | "cashier" | "user";

export interface StaffMember {
  id: string;
  name: string;
  pin: string;
  role: StaffRole;
  lastClockIn?: number;
  currentShift?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  unit: "kg" | "l" | "pcs" | "g" | "ml";
  threshold: number;
  minStock: number;
}

export interface Recipe {
  itemId: string;
  ingredients: {
    inventoryId: string;
    quantity: number;
  }[];
}

export interface InventoryService {
  deductStock(orderId: string): Promise<void>;
  addStock(itemId: string, quantity: number): Promise<void>;
  getLowStockItems(): Promise<InventoryItem[]>;
  getStockLevel(itemId: string): Promise<number>;
  getAllItems(): Promise<InventoryItem[]>;
  createItem(item: Omit<InventoryItem, "id">): Promise<InventoryItem>;
  updateItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem>;
  deleteItem(id: string): Promise<void>;
}

export interface StaffService {
  clockIn(staffId: string): Promise<void>;
  clockOut(staffId: string): Promise<void>;
  getActiveStaff(): Promise<StaffMember[]>;
  getAllStaff(): Promise<StaffMember[]>;
  createStaff(staff: Omit<StaffMember, "id">): Promise<StaffMember>;
  updateStaff(id: string, updates: Partial<StaffMember>): Promise<StaffMember>;
  deleteStaff(id: string): Promise<void>;
}

export interface TableService {
  getFloors(): Promise<Floor[]>;
  getFloor(id: string): Promise<Floor | undefined>;
  createFloor(floor: Omit<Floor, "id">): Promise<Floor>;
  updateFloor(id: string, updates: Partial<Floor>): Promise<Floor>;
  deleteFloor(id: string): Promise<void>;
  getTables(floorId?: string): Promise<Table[]>;
  createTable(table: Omit<Table, "id">): Promise<Table>;
  updateTable(id: string, updates: Partial<Table>): Promise<Table>;
  deleteTable(id: string): Promise<void>;
}

// ─── AI Service Types ────────────────────────────────────────────────

export interface RecommendationResult {
  item: MenuItem;
  score: number;
  reason: string;
}

export interface HourlyDemand {
  hour: number;
  predicted: number;
  confidence: number;
}

export interface DailyDemand {
  date: string;
  dayOfWeek: string;
  predicted: number;
}

export interface InventoryPrediction {
  itemId: string;
  currentStock: number;
  daysUntilStockout: number;
  reorderSuggested: boolean;
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: "percent" | "flat";
  discountValue: number;
  minOrder: number;
  validUntil: number;
}

export interface PricingResult {
  itemId: string;
  basePrice: number;
  dynamicPrice: number;
  demandLevel: "low" | "medium" | "high";
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  discountValue: number;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "flat";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: number;
  validUntil: number;
  active: boolean;
}

export type NLUIntent = "order" | "modify" | "cancel" | "query" | "reorder" | "unknown";

export interface NLUResult {
  intent: NLUIntent;
  confidence: number;
  raw: string;
}

export interface ExtractedEntity {
  type: "dish" | "quantity" | "modifier" | "attribute";
  value: string;
  itemId?: string;
}

export interface SentimentResult {
  score: number; // -1 to 1
  label: "positive" | "negative" | "neutral";
  topics: string[];
}

export interface SentimentTrend {
  date: string;
  avgScore: number;
  count: number;
}

export interface TopicFrequency {
  topic: string;
  count: number;
  avgSentiment: number;
}

export interface RecommendationService {
  getPersonalizedRecommendations(customerId: string, limit: number): Promise<RecommendationResult[]>;
  getTrendingDishes(limit: number): Promise<RecommendationResult[]>;
  getSimilarDishes(dishId: string, limit: number): Promise<RecommendationResult[]>;
}

export interface ForecastService {
  getHourlyForecast(date: string): Promise<HourlyDemand[]>;
  getDailyForecast(week: string): Promise<DailyDemand[]>;
  getInventoryForecast(dishId: string): Promise<InventoryPrediction>;
}

export interface PricingService {
  getPersonalizedOffers(customerId: string): Promise<Offer[]>;
  getDynamicPricing(itemId: string, time: string): Promise<PricingResult>;
  getLoyaltyRewards(customerId: string): Promise<Reward[]>;
}

export interface NLPUnderstandingService {
  parseIntent(input: string): Promise<NLUResult>;
  extractEntities(input: string, menuContext: MenuItem[]): Promise<ExtractedEntity[]>;
  generateResponse(intent: string, entities: ExtractedEntity[]): Promise<string>;
}

export interface SentimentService {
  analyzeSentiment(text: string, rating: number): Promise<SentimentResult>;
  getSentimentTrend(dateRange: { start: string; end: string }): Promise<SentimentTrend[]>;
  getTopTopics(limit: number): Promise<TopicFrequency[]>;
}

// ─── Marketing Automation Types ─────────────────────────────────────

export type MarketingChannel = "whatsapp" | "sms" | "email";

export interface MarketingAudience {
  segment: "all" | Segment;
  tier: "all" | LoyaltyTier;
  minVisits?: number;
  minSpend?: number;
}

export interface MarketingTemplate {
  id: string;
  name: string;
  channel: MarketingChannel;
  subject?: string;
  body: string;
  createdAt: number;
}

export type CampaignStatus = "draft" | "scheduled" | "running" | "completed" | "paused";

export interface CampaignStats {
  targeted: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
}

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: MarketingChannel;
  audience: MarketingAudience;
  templateId?: string;
  message: string;
  subject?: string;
  status: CampaignStatus;
  scheduledAt?: number;
  sentAt?: number;
  createdAt: number;
  stats: CampaignStats;
}

export type AutomationTrigger =
  | "first_order"
  | "order_completed"
  | "negative_feedback"
  | "customer_at_risk"
  | "customer_churned"
  | "customer_vip";

export interface MarketingAutomation {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  audience: MarketingAudience;
  channel: MarketingChannel;
  templateId: string;
  enabled: boolean;
  createdAt: number;
  runCount: number;
  lastRunAt?: number;
}

export type MessageStatus = "sent" | "delivered" | "opened" | "clicked" | "failed";

export interface MarketingMessageLog {
  id: string;
  campaignId?: string;
  automationId?: string;
  channel: MarketingChannel;
  recipientMobile: string;
  recipientName: string;
  message: string;
  status: MessageStatus;
  sentAt: number;
  openedAt?: number;
  clickedAt?: number;
}

export interface MarketingAnalytics {
  totals: CampaignStats & { openRate: number; clickRate: number };
  byChannel: Record<MarketingChannel, CampaignStats>;
  timeSeries: { date: string; sent: number; opened: number; clicked: number }[];
}

export interface MarketingService {
  getTemplates(): Promise<MarketingTemplate[]>;
  createTemplate(t: Omit<MarketingTemplate, "id" | "createdAt">): Promise<MarketingTemplate>;
  updateTemplate(id: string, patch: Partial<MarketingTemplate>): Promise<MarketingTemplate>;
  deleteTemplate(id: string): Promise<void>;

  getCampaigns(): Promise<MarketingCampaign[]>;
  createCampaign(c: Omit<MarketingCampaign, "id" | "createdAt" | "stats">): Promise<MarketingCampaign>;
  updateCampaign(id: string, patch: Partial<MarketingCampaign>): Promise<MarketingCampaign>;
  deleteCampaign(id: string): Promise<void>;
  sendCampaign(id: string): Promise<void>;
  getCampaignAudience(campaign: MarketingCampaign): Promise<CustomerProfile[]>;

  getAutomations(): Promise<MarketingAutomation[]>;
  createAutomation(a: Omit<MarketingAutomation, "id" | "createdAt" | "runCount" | "lastRunAt">): Promise<MarketingAutomation>;
  updateAutomation(id: string, patch: Partial<MarketingAutomation>): Promise<MarketingAutomation>;
  deleteAutomation(id: string): Promise<void>;
  runAutomation(id: string): Promise<void>;

  getLogs(limit?: number): Promise<MarketingMessageLog[]>;
  getAnalytics(): Promise<MarketingAnalytics>;
  optOut(mobile: string): Promise<void>;
  isOptedOut(mobile: string): Promise<boolean>;
}

// ─── AI Voice Outreach Types ────────────────────────────────────────

export type VoiceCallStatus = "queued" | "ringing" | "in_progress" | "completed" | "failed" | "no_answer";

export type VoiceCallOutcome =
  | "interested"
  | "not_interested"
  | "call_back_later"
  | "appointment_booked"
  | "wrong_number"
  | "voicemail";

export interface VoiceCallScript {
  id: string;
  name: string;
  prompt: string;
  createdAt: number;
}

export interface VoiceCallLog {
  id: string;
  customerName: string;
  mobile: string;
  scriptId: string;
  status: VoiceCallStatus;
  outcome?: VoiceCallOutcome;
  durationSeconds?: number;
  transcript?: string;
  appointmentId?: string;
  initiatedAt: number;
  completedAt?: number;
}

export interface VoiceCallService {
  getScripts(): Promise<VoiceCallScript[]>;
  createScript(s: Omit<VoiceCallScript, "id" | "createdAt">): Promise<VoiceCallScript>;
  updateScript(id: string, patch: Partial<VoiceCallScript>): Promise<VoiceCallScript>;
  deleteScript(id: string): Promise<void>;

  getCallLogs(): Promise<VoiceCallLog[]>;
  startCall(input: { customerName: string; mobile: string; scriptId: string }): Promise<VoiceCallLog>;
  getCall(id: string): Promise<VoiceCallLog | undefined>;
}

// ─── Appointment Booking Types ──────────────────────────────────────

export type AppointmentType =
  | "demo"
  | "callback"
  | "tasting"
  | "consultation"
  | "follow_up";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export interface Appointment {
  id: string;
  customerName: string;
  mobile: string;
  type: AppointmentType;
  dateTime: number;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  callId?: string;
  reservationId?: string;
  createdAt: number;
}

export interface AppointmentService {
  getAppointments(): Promise<Appointment[]>;
  createAppointment(a: Omit<Appointment, "id" | "createdAt">): Promise<Appointment>;
  updateAppointment(id: string, patch: Partial<Appointment>): Promise<Appointment>;
  cancelAppointment(id: string): Promise<void>;
  completeAppointment(id: string): Promise<void>;
  linkReservation(appointmentId: string, reservationId: string): Promise<Appointment>;
}
