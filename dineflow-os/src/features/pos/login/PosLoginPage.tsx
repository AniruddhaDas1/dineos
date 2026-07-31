import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";
import { usePosAuthStore } from "@/stores/posAuth.store";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", ""];

export function PosLoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const login = usePosAuthStore((s) => s.login);
  const navigate = useNavigate();

  function handleKey(key: string) {
    if (!key) return;
    setError(false);
    setPin((prev) => (prev.length < 4 ? prev + key : prev));
  }

  function handleClear() {
    setPin("");
    setError(false);
  }

  async function handleSubmit() {
    if (pin.length !== 4) return;
    const ok = await login(pin);
    if (ok) {
      navigate("/pos/dashboard");
    } else {
      setError(true);
      setPin("");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-xs flex-col items-center gap-8"
      >
        {/* Brand */}
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="h-8 w-8 text-accent" />
          <span className="font-serif text-2xl">Saffron &amp; Smoke</span>
        </div>
        <p className="text-xs uppercase tracking-widest text-muted">
          POS Terminal — Enter PIN
        </p>

        {/* PIN display */}
        <div className="flex gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 text-2xl font-light transition-colors ${
                error
                  ? "border-danger text-danger"
                  : i < pin.length
                    ? "border-accent text-accent"
                    : "border-border text-transparent"
              }`}
            >
              •
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-danger">Incorrect PIN. Try again.</p>
        )}

        {/* Numeric pad */}
        <div className="grid grid-cols-3 gap-2">
          {KEYS.map((key, i) =>
            key === "" ? (
              <div key={`empty-${i}`} />
            ) : (
              <button
                key={key}
                onClick={() => handleKey(key)}
                className="flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-surface text-xl transition-colors hover:bg-surface-2"
              >
                {key}
              </button>
            )
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClear}
            className="rounded-lg border border-border px-6 py-2.5 text-sm text-muted transition-colors hover:bg-surface-2"
          >
            Clear
          </button>
          <button
            onClick={handleSubmit}
            disabled={pin.length !== 4}
            className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            Enter
          </button>
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs text-muted">
          Demo PINs: 1111 (Admin), 2222 (Executive), 1234 (Manager), 0000 (Captain), 9999 (Cashier), 3333 (User)
        </p>
      </motion.div>
    </div>
  );
}
