import { motion } from "framer-motion";
import { useWebsiteContent } from "./useWebsiteContent";

export function HeroSection() {
  const content = useWebsiteContent();
  const name = content?.name ?? "Restaurant";
  const tagline = content?.tagline ?? "";
  const description = content?.description ?? "";
  const heroImage = content?.heroImage ?? "";

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <img
        src={heroImage}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/50 to-background" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-4 text-sm uppercase tracking-[0.3em] text-accent"
        >
          {tagline}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mb-6 font-serif text-5xl leading-tight md:text-7xl"
        >
          {name}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mx-auto mb-10 max-w-xl text-lg text-muted md:text-xl"
        >
          {description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="#menu"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#menu")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-lg bg-accent px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-accent-foreground transition-transform hover:scale-105"
          >
            View Menu
          </a>
          <a
            href="#reserve"
            onClick={(e) => {
              e.preventDefault();
              document
                .querySelector("#reserve")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-lg border border-accent/40 px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-accent transition-colors hover:border-accent hover:bg-accent/10"
          >
            Reserve a Table
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border border-muted/40 p-1.5">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="h-2 w-1 rounded-full bg-muted"
          />
        </div>
      </motion.div>
    </section>
  );
}
