import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { useChatStore } from "@/stores/chat.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuickReply } from "@/features/ai/nlp/QuickReply";
import { OrderSummary } from "@/features/ai/nlp/OrderSummary";
import { useCartStore } from "@/stores/cart.store";

export function ChatBot() {
  const { messages, isOpen, isProcessing, toggleChat, sendMessage } =
    useChatStore();
  const cartLineCount = useCartStore((s) =>
    s.lines.reduce((sum, l) => sum + l.quantity, 0)
  );
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    if (!input.trim() || isProcessing) return;
    sendMessage(input.trim());
    setInput("");
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-colors"
        onClick={toggleChat}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-surface p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
                <Bot className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="font-medium">Saffron & Smoke</p>
                <p className="text-xs text-muted">AI Ordering Assistant</p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20">
                      <Bot className="h-3.5 w-3.5 text-accent" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      msg.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-surface"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>

                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isProcessing && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20">
                    <Bot className="h-3.5 w-3.5 text-accent" />
                  </div>
                  <div className="bg-surface rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 rounded-full bg-muted animate-bounce" />
                      <span
                        className="h-2 w-2 rounded-full bg-muted animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <span
                        className="h-2 w-2 rounded-full bg-muted animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <QuickReply onSelect={sendMessage} />

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-border p-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your order..."
                className="flex-1"
                disabled={isProcessing}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Order Summary (when cart has items) */}
            {cartLineCount > 0 && <OrderSummary />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
