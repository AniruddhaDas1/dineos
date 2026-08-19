import type { VoiceCallService } from "../index";
import type {
  VoiceCallLog,
  VoiceCallOutcome,
  VoiceCallScript,
} from "@/services/types";

let scripts: VoiceCallScript[] = [
  {
    id: "script-1",
    name: "VIP Tasting Invite",
    prompt: "Invite the customer to an exclusive tasting event and offer to book a table.",
    createdAt: Date.now() - 20 * 24 * 60 * 60_000,
  },
  {
    id: "script-2",
    name: "Win-back Call",
    prompt: "Check in with a lapsed customer and offer a 20% welcome-back discount.",
    createdAt: Date.now() - 10 * 24 * 60 * 60_000,
  },
  {
    id: "script-3",
    name: "New Menu Preview",
    prompt: "Tell the customer about new seasonal dishes and ask if they'd like a demo booking.",
    createdAt: Date.now() - 3 * 24 * 60 * 60_000,
  },
];

let logs: VoiceCallLog[] = [];

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now()}-${seq}`;
}

const OUTCOMES: VoiceCallOutcome[] = [
  "interested",
  "not_interested",
  "call_back_later",
  "appointment_booked",
  "wrong_number",
  "voicemail",
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function simulateOutcome(mobile: string): VoiceCallOutcome {
  return OUTCOMES[hashString(mobile) % OUTCOMES.length];
}

function seedLogs() {
  if (logs.length > 0) return;
  const now = Date.now();
  const seed = [
    { name: "Meera Nair", mobile: "9000011111" },
    { name: "Karthik Reddy", mobile: "9000022222" },
    { name: "Arjun Mehta", mobile: "9876543210" },
    { name: "Priya Sharma", mobile: "9123456789" },
  ];

  logs = seed.map((c, i) => {
    const outcome = simulateOutcome(c.mobile);
    const duration = 40 + (hashString(c.mobile) % 90);
    const startedAt = now - (i + 1) * 24 * 60 * 60_000;
    const status = outcome === "wrong_number" ? "failed" as const : "completed" as const;
    return {
      id: `call-seed-${i}`,
      customerName: c.name,
      mobile: c.mobile,
      scriptId: scripts[i % scripts.length].id,
      status,
      outcome,
      durationSeconds: duration,
      transcript:
        outcome === "voicemail"
          ? "No response. Left a voicemail with the restaurant details."
          : `AI: Hi ${c.name}, this is Saffron & Smoke calling. Customer: ... AI: Thank you for your time.`,
      appointmentId: outcome === "appointment_booked" ? `appt-seed-${i}` : undefined,
      initiatedAt: startedAt,
      completedAt: startedAt + duration * 1000,
    };
  }).sort((a, b) => b.initiatedAt - a.initiatedAt);
}

seedLogs();

export const mockVoiceCallService: VoiceCallService & {
  __reset: () => void;
} = {
  async getScripts() {
    return [...scripts].sort((a, b) => b.createdAt - a.createdAt);
  },

  async createScript(s) {
    const created: VoiceCallScript = { ...s, id: nextId("script"), createdAt: Date.now() };
    scripts.push(created);
    return created;
  },

  async updateScript(id, patch) {
    const idx = scripts.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error(`Script ${id} not found`);
    scripts[idx] = { ...scripts[idx], ...patch };
    return scripts[idx];
  },

  async deleteScript(id) {
    scripts = scripts.filter((s) => s.id !== id);
  },

  async getCallLogs() {
    return [...logs].sort((a, b) => b.initiatedAt - a.initiatedAt);
  },

  async startCall(input) {
    const script = scripts.find((s) => s.id === input.scriptId);
    if (!script) throw new Error(`Script ${input.scriptId} not found`);

    const now = Date.now();
    const call: VoiceCallLog = {
      id: nextId("call"),
      customerName: input.customerName,
      mobile: input.mobile,
      scriptId: input.scriptId,
      status: "ringing",
      initiatedAt: now,
    };

    logs.unshift(call);

    // Simulate async progression from ringing to a terminal status.
    setTimeout(() => {
      const outcome = simulateOutcome(input.mobile);
      const duration = 30 + (hashString(input.mobile) % 100);
      call.status = outcome === "wrong_number" ? "failed" : "completed";
      call.outcome = outcome;
      call.durationSeconds = duration;
      call.completedAt = Date.now();
      call.transcript = `AI: Hi ${input.customerName}, this is Saffron & Smoke calling about ${script.name}.`;
    }, 800);

    return call;
  },

  async getCall(id) {
    return logs.find((c) => c.id === id);
  },

  __reset() {
    scripts = [
      {
        id: "script-1",
        name: "VIP Tasting Invite",
        prompt: "Invite the customer to an exclusive tasting event and offer to book a table.",
        createdAt: Date.now(),
      },
      {
        id: "script-2",
        name: "Win-back Call",
        prompt: "Check in with a lapsed customer and offer a 20% welcome-back discount.",
        createdAt: Date.now(),
      },
    ];
    logs = [];
    seq = 0;
    seedLogs();
  },
};
