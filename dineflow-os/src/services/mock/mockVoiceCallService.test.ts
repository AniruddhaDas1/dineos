import { describe, it, expect, beforeEach } from "vitest";
import { mockVoiceCallService } from "./mockVoiceCallService";

describe("mockVoiceCallService", () => {
  beforeEach(() => {
    mockVoiceCallService.__reset();
  });

  it("seeds call logs and scripts", async () => {
    const scripts = await mockVoiceCallService.getScripts();
    const logs = await mockVoiceCallService.getCallLogs();
    expect(scripts.length).toBeGreaterThan(0);
    expect(logs.length).toBeGreaterThan(0);
  });

  it("creates and deletes scripts", async () => {
    const created = await mockVoiceCallService.createScript({
      name: "Test Script",
      prompt: "Say hello",
    });
    expect(created.id).toMatch(/^script-/);

    await mockVoiceCallService.deleteScript(created.id);
    const scripts = await mockVoiceCallService.getScripts();
    expect(scripts.find((s) => s.id === created.id)).toBeUndefined();
  });

  it("starts a call with ringing status and resolves to terminal", async () => {
    const script = (await mockVoiceCallService.getScripts())[0];
    const call = await mockVoiceCallService.startCall({
      customerName: "Test User",
      mobile: "9876543210",
      scriptId: script.id,
    });

    expect(call.status).toBe("ringing");
    expect(call.customerName).toBe("Test User");

    await new Promise((r) => setTimeout(r, 1000));
    const resolved = await mockVoiceCallService.getCall(call.id);
    expect(resolved?.status).not.toBe("ringing");
    expect(resolved?.outcome).toBeDefined();
  });
});
