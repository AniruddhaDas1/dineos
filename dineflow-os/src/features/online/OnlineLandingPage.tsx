import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "@/stores/session.store";
import { useOnlineStore } from "@/stores/online.store";
import { SERVED_PINCODES } from "@/data/delivery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Bike,
  ShoppingBag,
  MapPin,
  Clock,
} from "lucide-react";

export function OnlineLandingPage() {
  const navigate = useNavigate();
  const setCustomer = useSessionStore((s) => s.setCustomer);
  const existing = useSessionStore((s) => s.customer);
  const orderType = useOnlineStore((s) => s.orderType);
  const setType = useOnlineStore((s) => s.setType);
  const setAddress = useOnlineStore((s) => s.setAddress);

  const [name, setName] = useState(existing?.name ?? "");
  const [mobile, setMobile] = useState(existing?.mobile ?? "");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("Hyderabad");
  const [pincode, setPincode] = useState("");
  const [landmark, setLandmark] = useState("");
  const [error, setError] = useState("");

  const identityValid = name.trim().length >= 2 && /^\d{10}$/.test(mobile);
  const addressValid =
    line1.trim().length >= 5 &&
    city.trim().length >= 2 &&
    SERVED_PINCODES.includes(pincode);
  const canProceed =
    identityValid &&
    (orderType === "pickup" || (orderType === "delivery" && addressValid));

  function proceed() {
    if (!identityValid || !orderType) return;
    setError("");

    setCustomer({ name: name.trim(), mobile });

    if (orderType === "delivery" && addressValid) {
      setAddress({
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        pincode,
        landmark: landmark.trim() || undefined,
      });
    } else if (orderType === "delivery") {
      setError("Please enter a valid delivery address in our service area.");
      return;
    }

    navigate("/order/online/menu");
  }

  return (
    <div className="pb-40">
      {/* Header */}
      <div className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="h-48 w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-serif text-2xl text-foreground">
            Order Online
          </p>
          <p className="text-sm text-muted">
            Pickup or delivery — same kitchen, same quality.
          </p>
        </div>
      </div>

      <div className="space-y-6 p-4">
        {/* Identity */}
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            Your Details
          </p>
          <div>
            <Label htmlFor="onl-name">Name</Label>
            <Input
              id="onl-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ana"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="onl-mobile">Mobile</Label>
            <Input
              id="onl-mobile"
              inputMode="numeric"
              value={mobile}
              maxLength={10}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="10-digit number"
              className="mt-1"
            />
          </div>
        </section>

        <Separator />

        {/* Order type selection */}
        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            How would you like to receive your order?
          </p>
          <div className="grid grid-cols-2 gap-3">
            <OptionCard
              icon={<ShoppingBag className="h-5 w-5" />}
              title="Pickup"
              subtitle="20 min avg."
              selected={orderType === "pickup"}
              onClick={() => setType("pickup")}
            />
            <OptionCard
              icon={<Bike className="h-5 w-5" />}
              title="Delivery"
              subtitle="35 min avg."
              selected={orderType === "delivery"}
              onClick={() => setType("delivery")}
            />
          </div>
        </section>

        {/* Delivery address form */}
        {orderType === "delivery" && (
          <>
            <Separator />
            <section className="space-y-3">
              <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                <MapPin className="h-3.5 w-3.5" />
                Delivery Address
              </p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="addr-line1">Address line 1</Label>
                  <Input
                    id="addr-line1"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="Flat / House no., Building"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="addr-line2">Address line 2 (optional)</Label>
                  <Input
                    id="addr-line2"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    placeholder="Street, Area"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="addr-city">City</Label>
                    <Input
                      id="addr-city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addr-pin">Pincode</Label>
                    <Input
                      id="addr-pin"
                      inputMode="numeric"
                      value={pincode}
                      maxLength={6}
                      onChange={(e) =>
                        setPincode(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="500033"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="addr-landmark">Landmark (optional)</Label>
                  <Input
                    id="addr-landmark"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near metro station, etc."
                    className="mt-1"
                  />
                </div>
                {pincode.length === 6 &&
                  !SERVED_PINCODES.includes(pincode) && (
                    <p className="text-xs text-danger">
                      Sorry, we don't deliver to this pincode yet.
                    </p>
                  )}
              </div>
            </section>
          </>
        )}

        {error && <p className="text-xs text-danger">{error}</p>}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button
          className="w-full"
          size="lg"
          disabled={!canProceed}
          onClick={proceed}
        >
          {orderType === "pickup" ? (
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Continue to Menu
            </span>
          ) : orderType === "delivery" ? (
            <span className="flex items-center gap-2">
              <Bike className="h-4 w-4" />
              Continue to Menu
            </span>
          ) : (
            "Select an option above"
          )}
        </Button>
      </div>
    </div>
  );
}

function OptionCard({
  icon,
  title,
  subtitle,
  selected,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
        selected
          ? "border-accent bg-accent/10"
          : "border-border bg-surface hover:border-accent/50"
      }`}
    >
      <span className={selected ? "text-accent" : "text-muted"}>
        {icon}
      </span>
      <span className="font-medium">{title}</span>
      <span className="flex items-center gap-1 text-xs text-muted">
        <Clock className="h-3 w-3" />
        {subtitle}
      </span>
    </button>
  );
}
