import {
  MapPin,
  Phone,
  Mail,
  Clock,
  LogIn,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { useWebsiteContent } from "./useWebsiteContent";

export function ContactSection() {
  const content = useWebsiteContent();
  const name = content?.name ?? "Restaurant";
  const contact = content?.contact;
  const hours = content?.hours ?? [];
  const social = content?.social ?? [];

  return (
    <>
      <section id="contact" className="bg-surface py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-accent">
              Get in Touch
            </p>
            <h2 className="mb-4 font-serif text-4xl md:text-5xl">Visit Us</h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {/* Address */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 text-accent">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-serif text-xl">Location</h3>
              <p className="text-muted">{contact?.address}</p>
            </div>

            {/* Hours */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 text-accent">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-serif text-xl">Hours</h3>
              <div className="space-y-1 text-muted">
                {hours.map((h) => (
                  <div key={h.day} className="flex justify-between gap-6">
                    <span>{h.day}</span>
                    <span className="text-foreground">{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 text-accent">
                <Phone className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-serif text-xl">Contact</h3>
              <div className="space-y-1 text-muted">
                <p className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4" /> {contact?.phone}
                </p>
                <p className="flex items-center justify-center gap-2">
                  <Mail className="h-4 w-4" /> {contact?.email}
                </p>
              </div>
              {/* Social */}
              <div className="mt-4 flex gap-4">
                {social.map((s) => (
                  <a
                    key={s.platform}
                    href={s.url}
                    aria-label={s.platform}
                    className="text-muted transition-colors hover:text-accent"
                  >
                    <span className="text-sm font-medium">{s.platform}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 text-center text-sm text-muted">
          <Separator className="mb-4 w-16 bg-accent/30" />
          <p className="font-serif text-lg text-foreground">
            {name}
          </p>
          <p>
            © {new Date().getFullYear()} {name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <span>Crafted with care by DineFlow OS</span>
            <span className="text-border">•</span>
            <Link
              to="/pos"
              className="inline-flex items-center gap-1 text-muted hover:text-accent transition-colors"
            >
              <LogIn className="h-3 w-3" />
              <span>Staff Sign In (POS)</span>
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
