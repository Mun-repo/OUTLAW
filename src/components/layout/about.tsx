import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function About() {
  const reduce = useReducedMotion();

  return (
    <section id="a-propos" className="border-y border-border bg-background">
      <motion.div
        className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[auto_1fr] md:items-start md:gap-16 md:px-6 md:py-28"
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.14 } },
        }}
      >
        <motion.p
          variants={item}
          transition={{ duration: 1, ease }}
          className="section-index"
        >
          01
        </motion.p>
        <div>
          <motion.p
            variants={item}
            transition={{ duration: 0.75, ease }}
            className="text-2xs tracking-lux uppercase text-muted-foreground md:text-xs"
          >
            À propos
          </motion.p>
          <motion.h2
            variants={item}
            transition={{ duration: 0.95, ease }}
            className="mt-5 font-display text-5xl font-extrabold tracking-display md:text-7xl lg:text-8xl"
          >
            Collectif.
          </motion.h2>
          <motion.div
            variants={line}
            transition={{ duration: 1, ease }}
            className="hero-rule mt-8 origin-left"
          />
          <motion.p
            variants={item}
            transition={{ duration: 0.95, ease }}
            className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-xl md:leading-relaxed"
          >
            OUTLAW est un collectif indépendant dédié à la promotion de la
            culture underground, de la mode alternative et des événements
            immersifs. Nous créons des espaces d'expression uniques pour
            ceux qui tracent leur propre route.
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const line = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1 },
};
