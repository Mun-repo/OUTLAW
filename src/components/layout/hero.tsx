import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/logo";
import { HERO_IMAGE } from "@/lib/stock";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-dvh shrink-0 flex-col items-center justify-center overflow-hidden px-4 py-20 text-center md:px-8">
      <div className="hero-stage absolute inset-0 isolate overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt=""
          className="hero-bg-img event-stock size-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <div className="hero-vignette absolute inset-0" />
        <div className="hero-grain" />
      </div>

      <p
        aria-hidden="true"
        className="hero-ghost absolute inset-x-0 top-1/2 -translate-y-[58%] text-center"
      >
        OUTLAW
      </p>

      <motion.div
        className="relative z-10 flex w-full flex-col items-center"
        initial={reduce ? false : "hidden"}
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
        }}
      >
        <motion.p
          variants={copy}
          transition={{ duration: 0.9, ease }}
          className="max-w-xs text-2xs font-medium tracking-lux uppercase text-muted-foreground md:max-w-none md:text-xs"
        >
          Collectif Indépendant & Plateforme Culturelle
        </motion.p>

        <motion.div
          variants={logo}
          transition={{ duration: 1.15, ease }}
          className="mt-4 md:mt-6"
        >
          <Logo imgClassName="hero-logo mx-auto" />
        </motion.div>

        <motion.div
          variants={copy}
          transition={{ duration: 0.9, ease }}
          className="mx-auto mt-6 h-px w-16 bg-foreground/40 md:mt-8"
        />

        <motion.p
          variants={copy}
          transition={{ duration: 0.95, ease }}
          className="mt-6 max-w-2xl font-display text-xl font-semibold leading-snug tracking-display text-foreground md:mt-8 md:text-3xl lg:text-4xl"
        >
          Ceux qui tracent leur propre route.
        </motion.p>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8, ease }}
        className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3 md:bottom-10"
      >
        <span className="text-2xs tracking-lux uppercase text-muted-foreground">
          Explorer
        </span>
        <span className="scroll-cue h-10 w-px bg-foreground/50" />
      </motion.div>
    </section>
  );
}

const copy = {
  hidden: { opacity: 0, y: 22, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const logo = {
  hidden: { opacity: 0, y: 36, scale: 0.9, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
};
