import { motion } from "framer-motion";
import { useWebsiteContent } from "./useWebsiteContent";

export function GallerySection() {
  const content = useWebsiteContent();
  const gallery = content?.gallery ?? [];

  return (
    <section id="gallery" className="bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-accent">
            Ambiance
          </p>
          <h2 className="mb-4 font-serif text-4xl md:text-5xl">Gallery</h2>
          <p className="mx-auto max-w-lg text-muted">
            A peek into the experience — where every detail is curated with care.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`group overflow-hidden rounded-xl ${
                // Make first and last images span 2 rows for visual variety
                i === 0 || i === 5 ? "sm:row-span-2" : ""
              }`}
            >
              <div className="relative h-full min-h-[240px] overflow-hidden">
                <img
                  src={img.url}
                  alt={img.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-accent/0 transition-colors duration-300 group-hover:bg-accent/10" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
