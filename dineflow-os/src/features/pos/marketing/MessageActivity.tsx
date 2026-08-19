import { useState } from "react";
import { Search, MessageSquare, Mail } from "lucide-react";
import { useMarketingStore } from "@/stores/marketing.store";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { MarketingChannel, MessageStatus } from "@/services/types";

const STATUS_BADGE: Record<MessageStatus, string> = {
  sent: "bg-surface-2 text-muted",
  delivered: "bg-blue-500/15 text-blue-400",
  opened: "bg-amber-500/15 text-amber-400",
  clicked: "bg-success/15 text-success",
  failed: "bg-danger/15 text-danger",
};

const CHANNELS: ("all" | MarketingChannel)[] = ["all", "whatsapp", "sms", "email"];

export function MessageActivity() {
  const logs = useMarketingStore((s) => s.logs);
  const [query, setQuery] = useState("");
  const [channel, setChannel] = useState<"all" | MarketingChannel>("all");

  const filtered = logs.filter((l) => {
    const matchesQuery =
      !query ||
      l.recipientName.toLowerCase().includes(query.toLowerCase()) ||
      l.recipientMobile.includes(query.trim());
    const matchesChannel = channel === "all" || l.channel === channel;
    return matchesQuery && matchesChannel;
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or mobile…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CHANNELS.map((c) => (
            <button
              key={c}
              onClick={() => setChannel(c)}
              className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                channel === c ? "border-accent text-accent" : "border-border text-muted hover:text-foreground"
              }`}
            >
              {c === "all" ? "All" : c}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2 text-left text-xs uppercase tracking-widest text-muted">
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Recipient</th>
              <th className="hidden px-4 py-3 md:table-cell">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Sent</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted">No messages found.</td>
              </tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-border/50 last:border-0 hover:bg-surface-2/50">
                <td className="px-4 py-3">
                  {l.channel === "email" ? (
                    <Mail className="h-4 w-4 text-amber-500" />
                  ) : (
                    <MessageSquare className={`h-4 w-4 ${l.channel === "whatsapp" ? "text-green-500" : "text-blue-500"}`} />
                  )}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{l.recipientName}</p>
                  <p className="text-xs text-muted">{l.recipientMobile}</p>
                </td>
                <td className="hidden max-w-md px-4 py-3 md:table-cell">
                  <p className="truncate text-muted">{l.message}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge className={STATUS_BADGE[l.status]}>{l.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right text-muted">
                  {new Date(l.sentAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
