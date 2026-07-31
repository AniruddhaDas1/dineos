import { motion } from "framer-motion";
import { Utensils, History, Star, HelpCircle, Package, Truck } from "lucide-react";

export interface QuickReplyOption {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  action: string;
}

interface QuickReplyProps {
  onSelect: (action: string) => void;
}

export const DEFAULT_QUICK_REPLIES: QuickReplyOption[] = [
  { label: "What's popular?", icon: Star, action: "query_popular" },
  { label: "I want to order", icon: Utensils, action: "order" },
  { label: "Show vegetarian", icon: Package, action: "query_veg" },
  { label: "Reorder my usual", icon: History, action: "reorder" },
  { label: "Track my order", icon: Truck, action: "query_status" },
  { label: "Help", icon: HelpCircle, action: "query_help" },
];

export function QuickReply({ onSelect }: QuickReplyProps) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 border-t border-border">
      {DEFAULT_QUICK_REPLIES.map((reply) => {
        const Icon = reply.icon;
        return (
          <motion.button
            key={reply.action}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(reply.label)}
            className="shrink-0 flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted hover:border-accent hover:text-accent transition-colors"
          >
            {Icon && <Icon className="h-3 w-3" />}
            {reply.label}
          </motion.button>
        );
      })}
    </div>
  );
}
