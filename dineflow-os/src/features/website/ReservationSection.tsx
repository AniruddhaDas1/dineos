import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";

export function ReservationSection() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="reserve" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-accent">
              Reservations
            </p>
            <h2 className="mb-6 font-serif text-4xl md:text-5xl">
              Book Your Table
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                Whether it's a romantic dinner for two or a celebration with
                friends, we'll make sure your evening at Saffron & Smoke is
                memorable.
              </p>
              <p>
                For parties of 8 or more, or special event bookings, please call
                us directly.
              </p>
            </div>
          </motion.div>

          {/* Right form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            {submitted ? (
              <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                  <Check className="h-8 w-8 text-success" />
                </div>
                <h3 className="mb-2 font-serif text-2xl">Reservation Confirmed!</h3>
                <p className="text-muted">
                  We'll send you a confirmation shortly. See you soon!
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => setSubmitted(false)}
                >
                  Make Another
                </Button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-5 rounded-2xl border border-border bg-surface p-8"
              >
                <div className="space-y-2">
                  <Label htmlFor="res-name">Name</Label>
                  <Input id="res-name" placeholder="Your full name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="res-phone">Phone</Label>
                  <Input
                    id="res-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="res-date">Date</Label>
                    <Input id="res-date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="res-time">Time</Label>
                    <Input id="res-time" type="time" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="res-guests">Guests</Label>
                  <Input
                    id="res-guests"
                    type="number"
                    min={1}
                    max={20}
                    placeholder="2"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  Reserve Table
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
