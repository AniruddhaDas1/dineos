import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, LogIn } from "lucide-react";
import { HeroSection } from "./HeroSection";
import { StorySection } from "./StorySection";
import { MenuPreviewSection } from "./MenuPreviewSection";
import { ReservationSection } from "./ReservationSection";
import { GallerySection } from "./GallerySection";
import { ReviewsSection } from "./ReviewsSection";
import { ContactSection } from "./ContactSection";
import { ChatBot } from "@/features/ai/nlp/ChatBot";
import { useWebsiteStore } from "@/stores/website.store";
import { applyWebsiteTheme, clearWebsiteTheme } from "@/lib/websiteTheme";

const NAV_LINKS = [
  { label: "Story", href: "#story" },
  { label: "Menu", href: "#menu" },
  { label: "Gallery", href: "#gallery" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
];

function scrollToHash(hash: string) {
  const el = document.querySelector(hash);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const name = useWebsiteStore((s) =>
    s.configs.find((c) => c.id === s.activeId)?.content.name ?? "Restaurant"
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function handleNav(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    setMobileOpen(false);
    scrollToHash(href);
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="font-serif text-xl tracking-wide text-accent"
        >
          {name}
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 lg:gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              className="text-sm uppercase tracking-widest text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
          <div className="flex items-center gap-3">
            <Link
              to="/pos"
              className="flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface/50 px-3.5 py-2 text-xs uppercase tracking-widest text-muted transition-colors hover:border-accent/40 hover:bg-surface hover:text-foreground"
            >
              <LogIn className="h-3.5 w-3.5 text-accent" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/order"
              className="rounded-lg border border-accent bg-accent/10 px-4 py-2 text-sm uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Order Now
            </Link>
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className="text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 top-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/98 px-6 md:hidden"
        >
          <button
            className="absolute top-4 right-6 text-foreground"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
          <span className="font-serif text-2xl text-accent mb-2">
            {name}
          </span>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNav(e, link.href)}
              className="text-base uppercase tracking-widest text-foreground hover:text-accent"
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-3 w-full max-w-xs mt-4">
            <Link
              to="/order"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center rounded-lg bg-accent px-6 py-3 text-sm uppercase tracking-widest font-semibold text-accent-foreground shadow"
            >
              Order Now
            </Link>
            <Link
              to="/pos"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-border bg-surface px-6 py-2.5 text-sm uppercase tracking-widest text-muted hover:text-foreground hover:border-accent/40"
            >
              <LogIn className="h-4 w-4 text-accent" />
              Sign In (POS)
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

export function WebsiteLayout() {
  const location = useLocation();
  const theme = useWebsiteStore((s) =>
    s.configs.find((c) => c.id === s.activeId)?.theme
  );

  useEffect(() => {
    if (theme) {
      applyWebsiteTheme(theme);
    } else {
      clearWebsiteTheme();
    }
    return () => clearWebsiteTheme();
  }, [theme]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Marketing sections — only shown on root */}
      {location.pathname === "/" && (
        <>
          <HeroSection />
          <StorySection />
          <MenuPreviewSection />
          <ReservationSection />
          <GallerySection />
          <ReviewsSection />
          <ContactSection />
        </>
      )}

      {/* Nested route outlet (for future sub-pages if needed) */}
      <Outlet />

      {/* AI Chatbot */}
      <ChatBot />
    </div>
  );
}
