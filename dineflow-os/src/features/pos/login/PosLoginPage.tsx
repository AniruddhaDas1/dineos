import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UtensilsCrossed,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Sparkles,
  CreditCard,
  Coffee,
  Zap,
  ArrowRight,
  Loader2,
  Lock,
  Delete,
  Globe,
  ExternalLink,
} from "lucide-react";
import { usePosAuthStore } from "@/stores/posAuth.store";
import type { StaffRole } from "@/services/types";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"];

interface DemoRole {
  role: StaffRole;
  title: string;
  name: string;
  pin: string;
  badge: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeColor: string;
}

const DEMO_ROLES: DemoRole[] = [
  {
    role: "admin",
    title: "Admin",
    name: "Priya Sharma",
    pin: "1111",
    badge: "Full System",
    tagline: "Settings, security & all system permissions",
    icon: ShieldCheck,
    accentColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  {
    role: "executive",
    title: "Executive",
    name: "Arjun Mehta",
    pin: "2222",
    badge: "Analytics & Growth",
    tagline: "Executive reports, revenue, CRM & marketing",
    icon: TrendingUp,
    accentColor: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    role: "manager",
    title: "Manager",
    name: "Vikram Rao",
    pin: "1234",
    badge: "Operations",
    tagline: "Staff scheduling, inventory, tables & menu",
    icon: UserCheck,
    accentColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    role: "captain",
    title: "Captain",
    name: "Anita Desai",
    pin: "0000",
    badge: "Floor Service",
    tagline: "Floor tables, live order management & KDS",
    icon: Sparkles,
    accentColor: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  },
  {
    role: "cashier",
    title: "Cashier",
    name: "Suresh Kumar",
    pin: "9999",
    badge: "Billing & POS",
    tagline: "Express checkout, invoice printing & payments",
    icon: CreditCard,
    accentColor: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
    badgeColor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  },
  {
    role: "user",
    title: "Server / Waiter",
    name: "Neha Gupta",
    pin: "3333",
    badge: "Table Service",
    tagline: "Fast order creation & table occupancy checks",
    icon: Coffee,
    accentColor: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
];

export function PosLoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loadingRolePin, setLoadingRolePin] = useState<string | null>(null);
  const login = usePosAuthStore((s) => s.login);
  const navigate = useNavigate();

  function handleKey(key: string) {
    setError(false);
    if (key === "C") {
      setPin("");
    } else if (key === "⌫") {
      setPin((prev) => prev.slice(0, -1));
    } else if (/^\d$/.test(key)) {
      setPin((prev) => (prev.length < 4 ? prev + key : prev));
    }
  }

  // Keyboard navigation support
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") {
        handleKey(e.key);
      } else if (e.key === "Backspace") {
        handleKey("⌫");
      } else if (e.key === "Escape") {
        handleKey("C");
      } else if (e.key === "Enter" && pin.length === 4) {
        handleSubmit();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pin]);

  async function handleSubmit(overridePin?: string) {
    const targetPin = overridePin || pin;
    if (targetPin.length !== 4) return;
    setLoadingRolePin(targetPin);
    const ok = await login(targetPin);
    if (ok) {
      navigate("/pos/dashboard");
    } else {
      setError(true);
      setPin("");
      setLoadingRolePin(null);
    }
  }

  async function handleInstantRoleLogin(rolePin: string) {
    setPin(rolePin);
    setError(false);
    await handleSubmit(rolePin);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border bg-surface-2/40 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-accent/30 bg-accent/15 text-accent shadow-inner">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Saffron &amp; Smoke
                </span>
                <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                  DineFlow OS
                </span>
              </div>
              <p className="text-xs text-muted">
                Restaurant Management &amp; POS Terminal
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-foreground transition-all duration-150 hover:border-accent/50 hover:bg-surface-2 hover:text-accent shadow-sm"
            >
              <Globe className="h-3.5 w-3.5 text-accent" />
              <span>Visit Website</span>
              <ExternalLink className="h-3 w-3 text-muted" />
            </Link>

            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs font-medium text-accent">
              <Zap className="h-3.5 w-3.5 animate-pulse" /> Instant Demo Mode
            </span>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Column 1: PIN Terminal Keypad (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 bg-surface/80">
            <div className="flex w-full max-w-[280px] flex-col items-center gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center p-2 rounded-full bg-surface-2 border border-border mb-2">
                  <Lock className="h-4 w-4 text-muted" />
                </div>
                <h2 className="font-serif text-lg font-semibold text-foreground">
                  Terminal Sign In
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Enter 4-digit PIN or use Instant Demo buttons
                </p>
              </div>

              {/* PIN display boxes */}
              <div className="flex gap-2.5">
                {[0, 1, 2, 3].map((i) => {
                  const isFilled = i < pin.length;
                  return (
                    <div
                      key={i}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-2xl font-mono transition-all duration-150 ${
                        error
                          ? "border-danger text-danger bg-danger/10"
                          : isFilled
                            ? "border-accent text-accent bg-accent/10 shadow-[0_0_12px_rgba(201,162,75,0.25)]"
                            : "border-border text-transparent bg-surface-2/60"
                      }`}
                    >
                      {isFilled ? "•" : ""}
                    </div>
                  );
                })}
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-center font-medium text-danger"
                >
                  Incorrect PIN. Please try again or select a demo role.
                </motion.p>
              )}

              {/* Numeric Keypad */}
              <div className="grid grid-cols-3 gap-2 w-full">
                {KEYS.map((key) => {
                  const isAction = key === "C" || key === "⌫";
                  return (
                    <button
                      key={key}
                      onClick={() => handleKey(key)}
                      type="button"
                      className={`flex h-13 w-full items-center justify-center rounded-xl border font-mono text-lg font-medium transition-all duration-150 active:scale-95 ${
                        isAction
                          ? "border-border/80 bg-surface-2/80 text-muted hover:bg-surface-2 hover:text-foreground"
                          : "border-border bg-surface text-foreground hover:border-accent/40 hover:bg-surface-2 hover:text-accent shadow-sm"
                      }`}
                    >
                      {key === "⌫" ? <Delete className="h-4 w-4" /> : key}
                    </button>
                  );
                })}
              </div>

              {/* Submit / Clear */}
              <div className="flex gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => {
                    setPin("");
                    setError(false);
                  }}
                  className="flex-1 rounded-xl border border-border bg-surface-2/60 py-2.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={pin.length !== 4 || !!loadingRolePin}
                  className="flex-2 flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-xs font-semibold text-accent-foreground shadow transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                >
                  {loadingRolePin && !DEMO_ROLES.some((r) => r.pin === loadingRolePin) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Enter PIN <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Column 2: Instant Demo Roles (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-surface-2/20">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4 text-accent" /> Instant Demo Access
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    Click any role below for 1-click instant login &amp; permission testing
                  </p>
                </div>
                <span className="text-[11px] font-mono text-muted bg-surface-2 px-2 py-1 rounded-md border border-border">
                  6 Roles Available
                </span>
              </div>

              {/* Role Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {DEMO_ROLES.map((item) => {
                  const Icon = item.icon;
                  const isLoading = loadingRolePin === item.pin;

                  return (
                    <motion.button
                      key={item.role}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInstantRoleLogin(item.pin)}
                      disabled={!!loadingRolePin}
                      className="group relative flex flex-col items-start p-3.5 rounded-xl border border-border bg-surface text-left transition-all duration-200 hover:border-accent/60 hover:shadow-lg hover:shadow-accent/5 focus:outline-none focus:ring-1 focus:ring-accent"
                    >
                      {/* Top Header of Card */}
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border ${item.accentColor}`}
                          >
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                              {item.title}
                            </span>
                            <p className="text-xs text-muted leading-tight">
                              {item.name}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                        >
                          PIN: {item.pin}
                        </span>
                      </div>

                      {/* Tagline / Permission Summary */}
                      <p className="text-[11px] text-muted line-clamp-1 mb-3">
                        {item.tagline}
                      </p>

                      {/* Action CTA Button */}
                      <div className="flex items-center justify-between w-full pt-2 border-t border-border/60 text-xs font-medium text-accent">
                        <span className="text-[11px] text-muted group-hover:text-foreground transition-colors flex items-center gap-1">
                          Role: <strong className="capitalize text-foreground">{item.role}</strong>
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold group-hover:translate-x-0.5 transition-transform">
                          {isLoading ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            <>
                              Instant Login <ArrowRight className="h-3 w-3" />
                            </>
                          )}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="mt-6 pt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted">
              <span>
                💡 All demo roles are pre-configured with realistic restaurant permissions and active shifts.
              </span>
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="text-muted hover:text-foreground inline-flex items-center gap-1 font-medium"
                >
                  <Globe className="h-3 w-3 text-accent" /> Public Website
                </Link>
                <span className="text-border">•</span>
                <button
                  type="button"
                  onClick={() => handleInstantRoleLogin("1111")}
                  className="text-accent hover:underline font-medium whitespace-nowrap"
                >
                  Quick Admin Login (PIN 1111) →
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
