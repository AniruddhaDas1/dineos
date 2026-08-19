import { describe, it, expect, beforeEach } from "vitest";
import { mockMarketingService } from "./mockMarketingService";
import { mockCustomerService } from "./mockCustomerService";

describe("mockMarketingService", () => {
  beforeEach(() => {
    mockMarketingService.__reset();
    mockCustomerService.__reset();
  });

  describe("template CRUD", () => {
    it("creates and returns a template with an id", async () => {
      const created = await mockMarketingService.createTemplate({
        name: "Test SMS",
        channel: "sms",
        body: "Hi {{name}}",
      });

      expect(created.id).toMatch(/^tpl-/);
      expect(created.createdAt).toBeGreaterThan(0);

      const templates = await mockMarketingService.getTemplates();
      expect(templates).toContainEqual(created);
    });

    it("updates and deletes templates", async () => {
      const created = await mockMarketingService.createTemplate({
        name: "Test",
        channel: "email",
        subject: "Old",
        body: "Hello",
      });

      const updated = await mockMarketingService.updateTemplate(created.id, {
        subject: "New",
      });
      expect(updated.subject).toBe("New");

      await mockMarketingService.deleteTemplate(created.id);
      const templates = await mockMarketingService.getTemplates();
      expect(templates.find((t) => t.id === created.id)).toBeUndefined();
    });
  });

  describe("audience resolution", () => {
    it("excludes opted-out customers", async () => {
      const campaign = await mockMarketingService.createCampaign({
        name: "Opt-out test",
        channel: "sms",
        audience: { segment: "all", tier: "all" },
        message: "Hi {{name}}",
        status: "draft",
      });

      const audience = await mockMarketingService.getCampaignAudience(campaign);
      expect(audience.length).toBeGreaterThan(0);

      const first = audience[0];
      await mockMarketingService.optOut(first.mobile);

      const filtered = await mockMarketingService.getCampaignAudience(campaign);
      expect(filtered.find((p) => p.mobile === first.mobile)).toBeUndefined();
    });
  });

  describe("sendCampaign", () => {
    it("generates logs and updates stats", async () => {
      const campaign = await mockMarketingService.createCampaign({
        name: "VIP Blast",
        channel: "whatsapp",
        audience: { segment: "all", tier: "all" },
        message: "Hi {{name}}, you are {{tier}}!",
        status: "draft",
      });

      await mockMarketingService.sendCampaign(campaign.id);

      const campaigns = await mockMarketingService.getCampaigns();
      const updated = campaigns.find((c) => c.id === campaign.id);
      expect(updated?.status).toBe("completed");
      expect(updated?.stats.targeted).toBeGreaterThan(0);
      expect(updated?.stats.sent).toBe(updated?.stats.targeted);

      const logs = await mockMarketingService.getLogs();
      const campaignLogs = logs.filter((l) => l.campaignId === campaign.id);
      expect(campaignLogs).toHaveLength(updated?.stats.sent ?? 0);
    });

    it("interpolates variables in messages", async () => {
      const campaign = await mockMarketingService.createCampaign({
        name: "Interpolate",
        channel: "sms",
        audience: { segment: "all", tier: "all" },
        message: "Hi {{name}} at {{restaurant}}!",
        status: "draft",
      });

      await mockMarketingService.sendCampaign(campaign.id);

      const logs = await mockMarketingService.getLogs();
      const campaignLogs = logs.filter((l) => l.campaignId === campaign.id);
      expect(campaignLogs.length).toBeGreaterThan(0);
      campaignLogs.forEach((log) => {
        expect(log.message).toContain(log.recipientName);
        expect(log.message).toContain("Saffron & Smoke");
        expect(log.message).not.toContain("{{");
      });
    });
  });

  describe("getAnalytics", () => {
    it("returns consistent totals and rates", async () => {
      const analytics = await mockMarketingService.getAnalytics();

      expect(analytics.totals.sent).toBeGreaterThan(0);
      expect(analytics.totals.delivered + analytics.totals.failed).toBe(
        analytics.totals.sent
      );
      expect(analytics.totals.openRate).toBeGreaterThanOrEqual(0);
      expect(analytics.totals.clickRate).toBeLessThanOrEqual(100);
      expect(analytics.timeSeries).toHaveLength(7);
    });
  });

  describe("runAutomation", () => {
    it("increments runCount and creates automation logs", async () => {
      const automation = await mockMarketingService.createAutomation({
        name: "Auto VIP",
        trigger: "customer_vip",
        audience: { segment: "all", tier: "all" },
        channel: "whatsapp",
        templateId: "tpl-whatsapp-1",
        enabled: true,
      });

      await mockMarketingService.runAutomation(automation.id);

      const automations = await mockMarketingService.getAutomations();
      const updated = automations.find((a) => a.id === automation.id);
      expect(updated?.runCount).toBe(1);
      expect(updated?.lastRunAt).toBeGreaterThan(0);

      const logs = await mockMarketingService.getLogs();
      const autoLogs = logs.filter((l) => l.automationId === automation.id);
      expect(autoLogs.length).toBeGreaterThan(0);
    });
  });
});
