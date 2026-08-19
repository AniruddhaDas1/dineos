import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionStore } from "@/stores/session.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WelcomePage() {
  const navigate = useNavigate();
  const setCustomer = useSessionStore((s) => s.setCustomer);
  const existing = useSessionStore((s) => s.customer);
  const [name, setName] = useState(existing?.name ?? "");
  const [mobile, setMobile] = useState(existing?.mobile ?? "");
  const [error, setError] = useState("");

  const valid = name.trim().length >= 2 && /^\d{10}$/.test(mobile);

  function begin() {
    if (!valid) {
      setError("Enter your name and a 10-digit mobile number.");
      return;
    }
    setCustomer({ name: name.trim(), mobile });
    navigate("/order/table/tbl-12"); // demo: default table; QR would encode this
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-end overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      <div className="relative z-10 p-6 pb-[max(2rem,env(safe-area-inset-bottom))] md:mx-auto md:max-w-xl md:p-10">
        <p className="font-serif text-3xl leading-tight text-foreground">
          Saffron &amp; Smoke
        </p>
        <p className="mt-1 text-sm text-muted">Modern Indian Fine Dining</p>
        <div className="mt-8 space-y-3">
          <div>
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ana"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="mobile">Mobile number</Label>
            <Input
              id="mobile"
              inputMode="numeric"
              value={mobile}
              maxLength={10}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="10-digit number"
              className="mt-1"
            />
          </div>
          {error && <p className="text-xs text-danger">{error}</p>}
          <Button
            className="w-full"
            size="lg"
            disabled={!valid}
            onClick={begin}
          >
            Begin
          </Button>
        </div>
      </div>
    </div>
  );
}
