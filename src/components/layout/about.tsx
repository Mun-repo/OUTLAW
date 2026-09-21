import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

export function About() {
  const reduce = useReducedMotion();

  return (
    <section
      id="a-propos"
      className="border-y border-border bg-background"
    >
      <motion.div
        className="mx-auto max-w-4xl px-4 py-20 md:px-6 md:py-28"
        initial={reduce ? false : "hidden"}
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.14 } },
        }}
      >
        <motion.p
          variants={item}
          transition={{ duration: 0.7, ease }}
          className="text-2xs tracking-lux uppercase text-muted-foreground md:text-xs"
        >
          À propos
        </motion.p>
        <motion.h2
          variants={item}
          transition={{ duration: 0.8, ease }}
          className="mt-5 font-display text-4xl font-extrabold tracking-display md:text-6xl"
        >
          Collectif.
        </motion.h2>
        <motion.p
          variants={item}
          transition={{ duration: 0.85, ease }}
          className="mt-8 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-xl md:leading-relaxed"
        >
          OUTLAW est un collectif indépendant dédié à la promotion de la
          culture underground, de la mode alternative et des événements
          immersifs. Nous créons des espaces d'expression uniques pour
          ceux qui tracent leur propre route.
        </motion.p>
      </motion.div>
    </section>
  );
}

const item = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};
