import type { MarketingService } from "../index";
import type {
  CampaignStats,
  CustomerProfile,
  MarketingAnalytics,
  MarketingAudience,
  MarketingAutomation,
  MarketingCampaign,
  MarketingChannel,
  MarketingMessageLog,
  MarketingTemplate,
  MessageStatus,
} from "@/services/types";
import { segmentCustomer } from "@/lib/segments";
import { restaurant } from "@/data/restaurant";
import { mockCustomerService } from "./mockCustomerService";

let templates: MarketingTemplate[] = [];
let campaigns: MarketingCampaign[] = [];
let automations: MarketingAutomation[] = [];
let logs: MarketingMessageLog[] = [];
const optedOut = new Set<string>();

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now()}-${seq}`;
}

function emptyStats(): CampaignStats {
  return { targeted: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, failed: 0 };
}

// Deterministic hash so delivery simulation is stable per recipient + run.
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function simulateDelivery(seed: string): MessageStatus {
  const hash = hashString(seed);
  if (hash % 20 === 0) return "failed";
  if (hash % 100 < 40) {
    if (hash % 100 < 6) return "clicked";
    return "opened";
  }
  return "delivered";
}

function interpolate(message: string, profile: CustomerProfile): string {
  return message
    .replaceAll("{{name}}", profile.name)
    .replaceAll("{{points}}", String(profile.points))
    .replaceAll("{{tier}}", profile.tier)
    .replaceAll("{{restaurant}}", restaurant.name);
}

async function resolveAudience(
  audience: MarketingAudience
): Promise<CustomerProfile[]> {
  const profiles = await mockCustomerService.getAllProfiles();
  return profiles.filter((p) => {
    if (optedOut.has(p.mobile)) return false;
    if (audience.segment !== "all" && segmentCustomer(p) !== audience.segment) {
      return false;
    }
    if (audience.tier !== "all" && p.tier !== audience.tier) return false;
    if (audience.minVisits != null && p.visits < audience.minVisits) return false;
    if (audience.minSpend != null && p.totalSpend < audience.minSpend) return false;
    return true;
  });
}

function buildLog(
  profile: CustomerProfile,
  channel: MarketingChannel,
  message: string,
  opts: { campaignId?: string; automationId?: string; sentAt: number; seed: string }
): MarketingMessageLog {
  const status = simulateDelivery(`${opts.seed}-${profile.mobile}`);
  const sentAt = opts.sentAt;
  const openedAt = status === "opened" || status === "clicked" ? sentAt + 60_000 : undefined;
  const clickedAt = status === "clicked" ? sentAt + 120_000 : undefined;
  return {
    id: nextId("msg"),
    campaignId: opts.campaignId,
    automationId: opts.automationId,
    channel,
    recipientMobile: profile.mobile,
    recipientName: profile.name,
    message: interpolate(message, profile),
    status,
    sentAt,
    openedAt,
    clickedAt,
  };
}

function seedLogs() {
  const profiles = [
    { name: "Meera Nair", mobile: "9000011111", points: 1180, tier: "platinum" as const },
    { name: "Karthik Reddy", mobile: "9000022222", points: 598, tier: "gold" as const },
    { name: "Arjun Mehta", mobile: "9876543210", points: 158, tier: "silver" as const },
    { name: "Priya Sharma", mobile: "9123456789", points: 92, tier: "bronze" as const },
    { name: "Rohan Kapoor", mobile: "9988776655", points: 105, tier: "silver" as const },
    { name: "Anita Desai", mobile: "9876501234", points: 59, tier: "bronze" as const },
  ];

  for (let i = 0; i < 22; i++) {
    const profile = profiles[i % profiles.length];
    const channel: MarketingChannel = i % 3 === 0 ? "email" : i % 3 === 1 ? "sms" : "whatsapp";
    const daysAgo = i % 7;
    const sentAt = Date.now() - daysAgo * 24 * 60 * 60_000 - (i % 5) * 3_600_000;
    const status = simulateDelivery(`seed-${i}-${profile.mobile}`);
    logs.push({
      id: `seed-msg-${i}`,
      channel,
      recipientMobile: profile.mobile,
      recipientName: profile.name,
      message: `Hi ${profile.name}, enjoy a special offer at ${restaurant.name}!`,
      status,
      sentAt,
      openedAt: status === "opened" || status === "clicked" ? sentAt + 60_000 : undefined,
      clickedAt: status === "clicked" ? sentAt + 120_000 : undefined,
    });
  }
  logs.sort((a, b) => b.sentAt - a.sentAt);
}

function seedData() {
  if (templates.length > 0) return;

  const now = Date.now();
  templates = [
    {
      id: "tpl-whatsapp-1",
      name: "WhatsApp Welcome",
      channel: "whatsapp",
      body: "Hi {{name}}, welcome to {{restaurant}}! You have {{points}} loyalty points.",
      createdAt: now - 30 * 24 * 60 * 60_000,
    },
    {
      id: "tpl-sms-1",
      name: "SMS Win-back",
      channel: "sms",
      body: "We miss you, {{name}}! Enjoy 20% off your next order at {{restaurant}}.",
      createdAt: now - 20 * 24 * 60 * 60_000,
    },
    {
      id: "tpl-email-1",
      name: "Email Newsletter",
      channel: "email",
      subject: "This week at {{restaurant}}",
      body: "Hello {{name}}, as a {{tier}} member you get exclusive access to new dishes.",
      createdAt: now - 10 * 24 * 60 * 60_000,
    },
  ];

  campaigns = [
    {
      id: "camp-1",
      name: "VIP Weekend Offer",
      channel: "whatsapp",
      audience: { segment: "all", tier: "platinum" },
      templateId: "tpl-whatsapp-1",
      message: "Hi {{name}}, a special weekend menu awaits you at {{restaurant}}!",
      status: "completed",
      sentAt: now - 3 * 24 * 60 * 60_000,
      createdAt: now - 4 * 24 * 60 * 60_000,
      stats: { targeted: 2, sent: 2, delivered: 2, opened: 1, clicked: 0, failed: 0 },
    },
    {
      id: "camp-2",
      name: "At-risk Win-back",
      channel: "sms",
      audience: { segment: "at-risk", tier: "all" },
      templateId: "tpl-sms-1",
      message: "We miss you, {{name}}! Enjoy 20% off your next order at {{restaurant}}.",
      status: "draft",
      createdAt: now - 2 * 24 * 60 * 60_000,
      stats: emptyStats(),
    },
  ];

  automations = [
    {
      id: "auto-1",
      name: "Welcome first-time guests",
      trigger: "first_order",
      audience: { segment: "new", tier: "all" },
      channel: "whatsapp",
      templateId: "tpl-whatsapp-1",
      enabled: true,
      createdAt: now - 15 * 24 * 60 * 60_000,
      runCount: 4,
      lastRunAt: now - 24 * 60 * 60_000,
    },
    {
      id: "auto-2",
      name: "Win back at-risk customers",
      trigger: "customer_at_risk",
      audience: { segment: "at-risk", tier: "all" },
      channel: "sms",
      templateId: "tpl-sms-1",
      enabled: true,
      createdAt: now - 12 * 24 * 60 * 60_000,
      runCount: 2,
      lastRunAt: now - 2 * 24 * 60 * 60_000,
    },
  ];

  seedLogs();
}

// Auto-seed on first import
seedData();

export const mockMarketingService: MarketingService & {
  __reset: () => void;
} = {
  async getTemplates() {
    return [...templates].sort((a, b) => b.createdAt - a.createdAt);
  },

  async createTemplate(t) {
    const created: MarketingTemplate = { ...t, id: nextId("tpl"), createdAt: Date.now() };
    templates.push(created);
    return created;
  },

  async updateTemplate(id, patch) {
    const idx = templates.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error(`Template ${id} not found`);
    templates[idx] = { ...templates[idx], ...patch };
    return templates[idx];
  },

  async deleteTemplate(id) {
    templates = templates.filter((t) => t.id !== id);
  },

  async getCampaigns() {
    return [...campaigns].sort((a, b) => b.createdAt - a.createdAt);
  },

  async createCampaign(c) {
    const created: MarketingCampaign = {
      ...c,
      id: nextId("camp"),
      createdAt: Date.now(),
      stats: emptyStats(),
    };
    campaigns.push(created);
    return created;
  },

  async updateCampaign(id, patch) {
    const idx = campaigns.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Campaign ${id} not found`);
    campaigns[idx] = { ...campaigns[idx], ...patch };
    return campaigns[idx];
  },

  async deleteCampaign(id) {
    campaigns = campaigns.filter((c) => c.id !== id);
  },

  async getCampaignAudience(campaign) {
    return resolveAudience(campaign.audience);
  },

  async sendCampaign(id) {
    const campaign = campaigns.find((c) => c.id === id);
    if (!campaign) throw new Error(`Campaign ${id} not found`);

    const audience = await resolveAudience(campaign.audience);
    const sentAt = Date.now();
    const seed = `${id}-${sentAt}`;
    const generated = audience.map((profile) =>
      buildLog(profile, campaign.channel, campaign.message, {
        campaignId: id,
        sentAt,
        seed,
      })
    );

    logs.unshift(...generated);
    const delivered = generated.filter((g) => g.status !== "failed").length;
    const opened = generated.filter((g) => g.status === "opened" || g.status === "clicked").length;
    const clicked = generated.filter((g) => g.status === "clicked").length;
    const failed = generated.length - delivered;

    campaign.stats = {
      targeted: audience.length,
      sent: generated.length,
      delivered,
      opened,
      clicked,
      failed,
    };
    campaign.status = "completed";
    campaign.sentAt = sentAt;
  },

  async getAutomations() {
    return [...automations].sort((a, b) => b.createdAt - a.createdAt);
  },

  async createAutomation(a) {
    const created: MarketingAutomation = {
      ...a,
      id: nextId("auto"),
      createdAt: Date.now(),
      runCount: 0,
    };
    automations.push(created);
    return created;
  },

  async updateAutomation(id, patch) {
    const idx = automations.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`Automation ${id} not found`);
    automations[idx] = { ...automations[idx], ...patch };
    return automations[idx];
  },

  async deleteAutomation(id) {
    automations = automations.filter((a) => a.id !== id);
  },

  async runAutomation(id) {
    const automation = automations.find((a) => a.id === id);
    if (!automation) throw new Error(`Automation ${id} not found`);
    const template = templates.find((t) => t.id === automation.templateId);
    if (!template) throw new Error(`Template ${automation.templateId} not found`);

    const audience = await resolveAudience(automation.audience);
    const sentAt = Date.now();
    const seed = `${id}-${sentAt}`;
    const generated = audience.map((profile) =>
      buildLog(profile, automation.channel, template.body, {
        automationId: id,
        sentAt,
        seed,
      })
    );

    logs.unshift(...generated);
    automation.runCount += 1;
    automation.lastRunAt = sentAt;
  },

  async getLogs(limit = 200) {
    return logs.slice(0, limit);
  },

  async getAnalytics(): Promise<MarketingAnalytics> {
    const totals = { ...emptyStats() };
    const byChannel: Record<MarketingChannel, CampaignStats> = {
      whatsapp: emptyStats(),
      sms: emptyStats(),
      email: emptyStats(),
    };

    for (const log of logs) {
      const channelStats = byChannel[log.channel];
      channelStats.sent += 1;
      totals.sent += 1;
      if (log.status === "failed") {
        channelStats.failed += 1;
        totals.failed += 1;
      } else {
        channelStats.delivered += 1;
        totals.delivered += 1;
      }
      if (log.status === "opened" || log.status === "clicked") {
        channelStats.opened += 1;
        totals.opened += 1;
      }
      if (log.status === "clicked") {
        channelStats.clicked += 1;
        totals.clicked += 1;
      }
    }

    const delivered = totals.delivered || 1;
    const openRate = Math.round((totals.opened / delivered) * 100);
    const clickRate = Math.round((totals.clicked / delivered) * 100);

    const days: { date: string; sent: number; opened: number; clicked: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(Date.now() - i * 24 * 60 * 60_000);
      const key = day.toISOString().split("T")[0];
      const dayLogs = logs.filter((l) => l.sentAt >= day.getTime() && l.sentAt < day.getTime() + 24 * 60 * 60_000);
      days.push({
        date: key,
        sent: dayLogs.length,
        opened: dayLogs.filter((l) => l.status === "opened" || l.status === "clicked").length,
        clicked: dayLogs.filter((l) => l.status === "clicked").length,
      });
    }

    return { totals: { ...totals, openRate, clickRate }, byChannel, timeSeries: days };
  },

  async optOut(mobile) {
    optedOut.add(mobile);
  },

  async isOptedOut(mobile) {
    return optedOut.has(mobile);
  },

  __reset() {
    templates = [];
    campaigns = [];
    automations = [];
    logs = [];
    optedOut.clear();
    seq = 0;
    seedData();
  },
};
