import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/format";
import { useWebsiteContent } from "./useWebsiteContent";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function MenuPreviewSection() {
  const content = useWebsiteContent();
  const items = content?.menuItems ?? [];

  return (
    <section id="menu" className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-accent">
            Curated Selection
          </p>
          <h2 className="mb-4 font-serif text-4xl md:text-5xl">Our Menu</h2>
          <p className="mx-auto max-w-lg text-muted">
            A glimpse into our kitchen — where tradition meets imagination on
            every plate.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((it, i) => (
            <motion.div
              key={i}
              variants={item}
              className="group overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-lg hover:shadow-accent/5"
            >
              <div className="relative h-48 overflow-hidden">
                {it.image && (
                  <img
                    src={it.image}
                    alt={it.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
              </div>
              <div className="p-5">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="font-serif text-lg">{it.name}</h3>
                  {it.badge && (
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-tight text-accent">
                      {it.badge}
                    </span>
                  )}
                </div>
                <p className="mb-3 line-clamp-2 text-sm text-muted">
                  {it.description}
                </p>
                <p className="font-serif text-lg text-accent">
                  {formatCurrency(it.price)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/order"
            className="inline-block rounded-lg border border-accent/40 px-8 py-3.5 text-sm uppercase tracking-widest text-accent transition-colors hover:border-accent hover:bg-accent/10"
          >
            Explore Full Menu
          </Link>
          <Link
            to="/order/online"
            className="inline-block rounded-lg bg-accent px-8 py-3.5 text-sm uppercase tracking-widest text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Order Online
          </Link>
        </div>
      </div>
    </section>
  );
}
