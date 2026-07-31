import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { useWebsiteContent } from "./useWebsiteContent";

export function StorySection() {
  const content = useWebsiteContent();
  const story = content?.story ?? "";
  const storyImage = content?.storyImage ?? "";
  const name = content?.name ?? "Restaurant";

  return (
    <section id="story" className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <p className="mb-3 text-sm uppercase tracking-[0.25em] text-accent">
              Our Story
            </p>
            <h2 className="mb-6 font-serif text-4xl md:text-5xl">
              Rooted in Tradition,<br />Plated with Purpose
            </h2>
            <Separator className="mb-6 w-16 bg-accent/40" />
            <div className="space-y-4 text-muted leading-relaxed">
              {story
                ? story.split("\n\n").map((para, i) => <p key={i}>{para}</p>)
                : null}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <div className="relative">
              <img
                src={storyImage}
                alt={`${name} story`}
                className="aspect-[4/5] w-full rounded-2xl object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
