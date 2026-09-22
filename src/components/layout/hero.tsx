import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/logo";
import { HERO_IMAGE, HERO_PUBLIC } from "@/lib/stock";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative flex min-h-dvh shrink-0 flex-col items-center justify-center overflow-hidden px-4 py-16 text-center md:px-8 md:py-20">
      <div
        className="hero-stage absolute inset-0 overflow-hidden"
        style={{
          backgroundImage: `url(${HERO_PUBLIC}), url(${HERO_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      >
        <img
          src={HERO_PUBLIC}
          alt=""
          className="hero-bg-img size-full object-cover"
          fetchPriority="high"
          decoding="async"
          onError={(e) => {
            if (e.currentTarget.src.endsWith(HERO_PUBLIC)) {
              e.currentTarget.src = HERO_IMAGE;
            }
          }}
        />
        <div className="hero-vignette absolute inset-0" />
        <div className="hero-grain" />
      </div>

      <div className="hero-frame" aria-hidden="true">
        <span className="hero-corner hero-corner-tl" />
        <span className="hero-corner hero-corner-tr" />
        <span className="hero-corner hero-corner-bl" />
        <span className="hero-corner hero-corner-br" />
      </div>

      <p
        aria-hidden="true"
        className="hero-ghost pointer-events-none absolute inset-x-0 top-[16%] text-center md:top-[12%]"
      >
        OUTLAW
      </p>

      <motion.div
        className="relative z-10 flex w-full max-w-6xl flex-col items-center"
        initial={reduce ? false : "hidden"}
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.14, delayChildren: 0.12 } },
        }}
      >
        <motion.p
          variants={copy}
          transition={{ duration: 1, ease }}
          className="max-w-xs text-2xs font-medium tracking-lux uppercase text-muted-foreground md:max-w-none md:text-xs"
        >
          Collectif indépendant · Plateforme culturelle
        </motion.p>

        <motion.div
          variants={logo}
          transition={{ duration: 1.35, ease }}
          className="mt-5 md:mt-7"
        >
          <Logo imgClassName="hero-logo mx-auto" />
        </motion.div>

        <motion.div
          variants={line}
          transition={{ duration: 1.1, ease }}
          className="hero-rule mx-auto mt-6 md:mt-8"
        />

        <motion.p
          variants={copy}
          transition={{ duration: 1.05, ease }}
          className="mt-6 max-w-2xl font-display text-xl font-semibold leading-snug tracking-display text-foreground md:mt-8 md:text-3xl lg:text-4xl"
        >
          Ceux qui tracent leur propre route.
        </motion.p>

        <motion.a
          href="/#a-propos"
          variants={copy}
          transition={{ duration: 0.9, ease }}
          className="relative z-10 mt-10 flex shrink-0 flex-col items-center gap-3 md:mt-12"
        >
          <span className="text-2xs tracking-lux uppercase text-muted-foreground">
            Explorer
          </span>
          <span className="scroll-cue h-12 w-px bg-foreground/50" />
        </motion.a>
      </motion.div>
    </section>
  );
}

const copy = {
  hidden: { opacity: 0, y: 28, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const logo = {
  hidden: { opacity: 0, y: 48, scale: 0.92, filter: "blur(18px)" },
  visible: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
};

const line = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: { opacity: 1, scaleX: 1 },
};
