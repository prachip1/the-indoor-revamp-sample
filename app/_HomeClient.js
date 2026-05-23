"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useVelocity,
  useAnimationFrame,
  useInView,
  animate,
  wrap,
} from "motion/react";

/* ============================================================
   Custom cursor (spring-driven)
============================================================ */
function Cursor() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 500, damping: 50, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 500, damping: 50, mass: 0.6 });
  const [state, setState] = useState({ mode: "default", label: "" });
  const [hidden, setHidden] = useState(false);

  const [overSpotlight, setOverSpotlight] = useState(false);
  useEffect(() => {
    const onMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const spotlightZone = e.target.closest("[data-spotlight]");
      setOverSpotlight(!!spotlightZone);
      const t = e.target.closest("[data-cursor]");
      const linkish = e.target.closest("a, button");
      if (t) {
        const label = t.getAttribute("data-cursor");
        if (label) setState({ mode: "label", label });
        else if (linkish) setState({ mode: "link", label: "" });
        else setState({ mode: "default", label: "" });
      } else if (linkish) {
        setState({ mode: "link", label: "" });
      } else {
        setState({ mode: "default", label: "" });
      }
    };
    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);
    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
    };
  }, [x, y]);

  const size = state.mode === "label" ? 96 : state.mode === "link" ? 40 : 14;
  const showDisc = !hidden && !(overSpotlight && state.mode === "default");
  return (
    <motion.div
      style={{ x: sx, y: sy, opacity: showDisc ? 1 : 0 }}
      className="cursor-follower"
    >
      <motion.div
        animate={{ width: size, height: size }}
        transition={{ type: "spring", stiffness: 250, damping: 24 }}
        className={`cursor-disc ${state.mode}`}
      >
        <motion.span
          key={state.label}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: state.mode === "label" ? 1 : 0,
            scale: state.mode === "label" ? 1 : 0.6,
          }}
          transition={{ duration: 0.25 }}
        >
          {state.label}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   Magnetic wrapper
============================================================ */
function Magnetic({ children, strength = 28, className = "" }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 250, damping: 18, mass: 0.4 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const dist = Math.hypot(dx, dy);
      const max = Math.max(r.width, r.height) * 0.9;
      if (dist > max * 1.4) {
        x.set(0);
        y.set(0);
        return;
      }
      x.set((dx / max) * strength);
      y.set((dy / max) * strength);
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };
    window.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength, x, y]);

  return (
    <motion.span ref={ref} style={{ x: sx, y: sy }} className={className}>
      {children}
    </motion.span>
  );
}

/* ============================================================
   Mask letter reveal — characters rise from a mask, staggered
============================================================ */
function MaskReveal({ children, className = "", delay = 0, stagger = 0.045 }) {
  const text = String(children);
  const chars = Array.from(text);
  return (
    <span className={`mask-reveal ${className}`}>
      {chars.map((c, i) => (
        <span key={i} className="char-mask">
          <motion.span
            className="char"
            initial={{ y: "110%", rotate: 3 }}
            whileInView={{ y: "0%", rotate: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{
              duration: 1,
              delay: delay + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {c === " " ? " " : c}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* Render an array of nodes (string or JSX) with letter mask reveal per node */
function MaskRevealMixed({ parts, className = "", delay = 0, stagger = 0.045, onMount = false }) {
  const view = onMount
    ? { animate: { y: "0%", rotate: 0 } }
    : { whileInView: { y: "0%", rotate: 0 }, viewport: { once: true, amount: 0.35 } };
  let index = 0;
  return (
    <span className={`mask-reveal ${className}`}>
      {parts.map((part, pi) => {
        if (typeof part !== "string") {
          // wrap node in its own mask, treat as one "letter" slot
          const i = index++;
          return (
            <span key={pi} className="char-mask">
              <motion.span
                className="char"
                initial={{ y: "110%", rotate: 3 }}
                {...view}
                transition={{
                  duration: 1.1,
                  delay: delay + i * stagger,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {part}
              </motion.span>
            </span>
          );
        }
        return Array.from(part).map((c, ci) => {
          const i = index++;
          return (
            <span key={`${pi}-${ci}`} className="char-mask">
              <motion.span
                className="char"
                initial={{ y: "110%", rotate: 3 }}
                {...view}
                transition={{
                  duration: 1,
                  delay: delay + i * stagger,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {c === " " ? " " : c}
              </motion.span>
            </span>
          );
        });
      })}
    </span>
  );
}

/* ============================================================
   Odometer-style rolling digit
============================================================ */
function Digit({ value }) {
  // value: 0-9
  return (
    <span className="digit">
      <motion.span
        className="digit-track"
        animate={{ y: `-${value * 10}%` }}
        transition={{ type: "spring", stiffness: 90, damping: 18, mass: 0.9 }}
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="digit-slot">
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Odometer({ value, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 2.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setCurrent(Math.floor(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  const str = String(current);
  return (
    <span ref={ref} className={`odometer ${className}`}>
      {str.split("").map((d, i) => (
        <Digit key={`${str.length}-${i}`} value={parseInt(d, 10)} />
      ))}
    </span>
  );
}

/* ============================================================
   Scroll-linked big text band that translates Y as you scroll
============================================================ */
function ScrollBand({ parts, className = "", height = "120vh" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["18%", "-22%"]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0]
  );

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ height }}
    >
      <motion.div
        style={{ y, opacity }}
        className={`absolute inset-x-0 flex flex-col items-center justify-center text-center ${className}`}
      >
        {parts.map((p, i) => (
          <span
            key={i}
            className="font-display block text-[clamp(56px,11vw,180px)] leading-[0.95]"
          >
            {p}
          </span>
        ))}
      </motion.div>
    </section>
  );
}

/* ============================================================
   Velocity-driven marquee
============================================================ */
function ParallaxMarquee({ children, baseVelocity = 60 }) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], {
    clamp: false,
  });

  const x = useTransform(baseX, (v) => `${wrap(-25, -75, v)}%`);

  const directionFactor = useRef(1);
  useAnimationFrame((t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get() * 0.3;
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="parallax-marquee">
      <motion.div className="scroller" style={{ x }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i}>{children}</span>
        ))}
      </motion.div>
    </div>
  );
}

/* ============================================================
   Placeholder media block
============================================================ */
function Media({ label, chip, className = "", rounded = "rounded-2xl" }) {
  return (
    <div
      className={`media-ph ${rounded} ${className}`}
      data-label={label || "placeholder"}
      data-cursor="view"
    >
      {chip ? <span className="ph-chip">{chip}</span> : null}
    </div>
  );
}

/* ============================================================
   Nav
============================================================ */
function Nav() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between section-pad py-6 md:py-7">
      <a
        href="#"
        className="font-display text-sm tracking-[0.32em] uppercase text-[color:var(--ink)]"
      >
        <span className="italic font-light">The </span>
        <span className="font-medium">Indoor Revamp</span>
      </a>
      <div className="hidden md:flex items-center gap-10">
        {[
          { l: "About", h: "#about" },
          { l: "Services", h: "#services" },
          { l: "FAQ", h: "#faq" },
        ].map((x) => (
          <a key={x.l} className="nav-link hover-underline" href={x.h}>
            {x.l}
          </a>
        ))}
      </div>
      <div className="hidden md:flex items-center gap-10">
        <a className="nav-link hover-underline" href="#cases">
          Cases
        </a>
        <a
          className="nav-link hover-underline underline underline-offset-4"
          data-cursor="contact"
          href="#contact"
        >
          Contact Us
        </a>
      </div>
    </nav>
  );
}

/* ============================================================
   HERO
============================================================ */
function Hero() {
  const heroRef = useRef(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const smx = useSpring(mx, { stiffness: 350, damping: 32, mass: 0.25 });
  const smy = useSpring(my, { stiffness: 350, damping: 32, mass: 0.25 });
  const [lit, setLit] = useState(false);

  const spotlight = useMotionTemplate`radial-gradient(360px circle at ${smx}% ${smy}%, rgba(168, 126, 83, 0.55), rgba(168, 126, 83, 0.3) 32%, rgba(168, 126, 83, 0.12) 58%, transparent 75%)`;

  const handleMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 100);
    my.set(((e.clientY - r.top) / r.height) * 100);
  };

  return (
    <section
      ref={heroRef}
      data-spotlight
      onMouseMove={handleMove}
      onMouseEnter={() => setLit(true)}
      onMouseLeave={() => setLit(false)}
      className="relative h-[100svh] min-h-[680px] w-full overflow-hidden"
    >
      <div className="absolute inset-0 hero-ph" />
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: spotlight }}
        transition={{ opacity: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
        animate={{ opacity: lit ? 1 : 0 }}
      />
      <Nav />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
        <h1 className="font-display text-[color:var(--ink)]">
          <MaskRevealMixed
            onMount
            className="block text-[clamp(48px,9vw,148px)]"
            parts={[
              "Lorem ",
              <span key="n" className="font-swash italic font-light">
                Ipsum
              </span>,
            ]}
            stagger={0.05}
            delay={0.3}
          />
          <MaskRevealMixed
            onMount
            className="block mt-2 text-[clamp(40px,8vw,128px)]"
            parts={[
              <span key="amp" className="font-swash italic font-light">
                Dolor
              </span>,
              " Sit Amet",
            ]}
            stagger={0.05}
            delay={0.9}
          />
        </h1>

      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-10 left-0 right-0 z-10 grid grid-cols-1 md:grid-cols-2 gap-6 section-pad pb-10 text-xs md:text-sm leading-relaxed text-[color:var(--ink)] opacity-85"
      >
        <p className="max-w-xs">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div className="md:justify-self-end flex items-end gap-4">
          <span className="font-display text-2xl italic opacity-80">§</span>
          <p className="max-w-xs md:text-right">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
            nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

/* ============================================================
   COZY (About)
============================================================ */
function Cozy() {
  return (
    <section id="about" className="relative section-pad">
      <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--ink-dim)] mb-6">
        [ 01 ] — About
      </p>
      <h2 className="font-display text-[clamp(54px,10vw,160px)] leading-[0.95] tracking-tight">
        About <span className="font-swash italic font-light">Us</span>
      </h2>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-10">
        <motion.div
          className="md:col-span-5"
          initial={{ x: -60, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Media
            label="Lorem"
            chip="01"
            className="aspect-[4/5] max-w-[360px]"
          />
          <div className="mt-5 flex items-center justify-between max-w-[360px] text-sm">
            <span className="font-display text-base">Lorem Ipsum</span>
            <span className="text-[color:var(--ink-dim)] uppercase tracking-[0.18em] text-xs">
              Dolor
            </span>
          </div>
          <div className="mt-12 max-w-[420px] space-y-5 text-sm leading-7 text-[color:var(--ink-dim)]">
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="md:col-span-7"
          initial={{ scale: 0.92, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Media
            label="Lorem ipsum"
            chip="Studio · 24"
            className="aspect-[4/5] md:aspect-auto md:h-[640px]"
          />
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   STATS
============================================================ */
function Stats() {
  return (
    <section className="relative section-pad pt-0">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
        <div className="md:col-span-7">
          <div className="space-y-12">
            {[
              { n: 5, label: "Lorem" },
              { n: 12, label: "Ipsum" },
              { n: 187, label: "Dolor" },
            ].map((row, i) => (
              <motion.div
                key={row.label}
                className="grid grid-cols-2 gap-6 items-end border-b border-[color:var(--line)] pb-6"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.9,
                  delay: i * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <span className="font-display text-[clamp(72px,12vw,168px)] leading-none">
                  <Odometer value={row.n} />
                </span>
                <span className="text-sm tracking-[0.18em] uppercase text-[color:var(--ink-dim)] pb-3">
                  {row.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="md:col-span-5 md:pl-8 space-y-6"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--ink-dim)]">
            Lorem ipsum dolor sit amet
            <br />
            consectetur adipiscing elit.
          </p>
          <p className="font-display text-[clamp(20px,1.8vw,30px)] leading-[1.3] max-w-md">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua, ut
            enim ad minim veniam quis nostrud.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   STICKY HORIZONTAL PROJECTS
============================================================ */
function StickyProjects() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  // 4 panels — translate -75% so last panel ends at viewport right edge
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  const projects = [
    { name: "Lorem Ipsum", type: "Dolor" },
    { name: "Sit Amet", type: "Dolor" },
    { name: "Consectetur", type: "Adipiscing" },
    { name: "Eiusmod Tempor", type: "Incididunt" },
  ];

  return (
    <section
      id="cases"
      ref={ref}
      className="relative"
      style={{ height: "320vh" }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        <div className="section-pad pt-12 pb-6">
          <h2 className="font-display text-[clamp(40px,7vw,110px)] leading-[0.92] tracking-tight">
            <MaskRevealMixed
              parts={[
                "Lorem Ipsum ",
                <span key="i" className="font-swash italic font-light">
                  Dolor
                </span>,
              ]}
            />
          </h2>
        </div>

        <div className="flex-1 flex items-center overflow-hidden">
          <motion.div
            style={{ x }}
            className="flex gap-10 px-[5vw] will-change-transform"
          >
            {projects.map((p, i) => (
              <figure
                key={p.name}
                className="shrink-0 w-[80vw] md:w-[60vw] lg:w-[48vw]"
              >
                <div className="overflow-hidden rounded-2xl">
                  <Media
                    label={p.name}
                    chip={String(i + 1).padStart(2, "0")}
                    className="aspect-[16/10]"
                  />
                </div>
                <figcaption className="mt-4 flex items-center justify-between text-xs tracking-[0.16em] uppercase text-[color:var(--ink-dim)]">
                  <span>{p.name}</span>
                  <span>{p.type}</span>
                </figcaption>
              </figure>
            ))}
          </motion.div>
        </div>

        <div className="section-pad py-6 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[color:var(--ink-dim)]">
          <span>Lorem ipsum dolor</span>
          <ProgressBar progress={scrollYProgress} />
          <span>{projects.length} ipsum</span>
        </div>
      </div>
    </section>
  );
}

function ProgressBar({ progress }) {
  const scaleX = useSpring(progress, { stiffness: 200, damping: 30 });
  return (
    <div className="h-px w-40 bg-[color:var(--line)] overflow-hidden">
      <motion.div
        className="h-full bg-[color:var(--accent)] origin-left"
        style={{ scaleX }}
      />
    </div>
  );
}

/* ============================================================
   BIG CTA: Check All Our Works
============================================================ */
function CTABig() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.15, 1.05, 1.15]);

  return (
    <section
      ref={ref}
      className="relative h-[95svh] min-h-[600px] overflow-hidden"
    >
      <motion.div
        style={{ y: bgY, scale: bgScale }}
        className="absolute inset-0 hero-ph"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/0 to-black/70" />

      <div className="absolute top-8 left-0 right-0 section-pad py-0 flex items-center justify-between text-xs tracking-[0.18em] uppercase text-white/80">
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Lorem ipsum dolor sit amet
        </motion.span>
        <motion.span
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          Consectetur adipiscing
        </motion.span>
      </div>

      <div className="relative z-10 flex h-full items-center justify-center text-center px-8">
        <h2 className="font-display text-white text-[clamp(56px,11vw,180px)] leading-[0.92] tracking-tight">
          <MaskRevealMixed
            parts={[
              "Lorem ",
              <span key="a" className="font-swash italic font-light">
                Ipsum
              </span>,
            ]}
          />
          <br />
          <MaskRevealMixed
            delay={0.35}
            parts={[
              "Dolor ",
              <span key="w" className="font-swash italic font-light">
                Sit
              </span>,
            ]}
          />
        </h2>
        <Magnetic strength={26} className="absolute">
          <motion.a
            href="#cases"
            data-cursor="check"
            className="btn-circle h-[150px] w-[150px] md:h-[180px] md:w-[180px] float-anim"
            aria-label="Check our works"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{
              type: "spring",
              stiffness: 130,
              damping: 14,
              delay: 0.7,
            }}
          >
            Check
          </motion.a>
        </Magnetic>
      </div>

      <div className="absolute bottom-10 left-0 right-0 section-pad py-0 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm text-white/80">
        <motion.p
          className="max-w-xs"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do
          eiusmod tempor.
        </motion.p>
        <motion.p
          className="md:justify-self-end md:text-right max-w-xs"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.55 }}
        >
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
          nisi ut aliquip.
        </motion.p>
      </div>
    </section>
  );
}

/* ============================================================
   SERVICES
============================================================ */
function Services() {
  const rows = [
    {
      n: "01",
      title: "Lorem Ipsum",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      n: "02",
      title: "Dolor Sit",
      desc: "Ut enim ad minim veniam, quis nostrud exercitation.",
    },
    {
      n: "03",
      title: "Consectetur",
      desc: "Duis aute irure dolor in reprehenderit voluptate.",
    },
    {
      n: "04",
      title: "Adipiscing",
      desc: "Excepteur sint occaecat cupidatat non proident sunt.",
    },
  ];
  return (
    <section id="services" className="relative section-pad">
      <div className="flex items-end justify-between gap-8">
        <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--ink-dim)] mb-6">
          [ 02 ] — Services
        </p>
        <h2 className="font-display text-right text-[clamp(56px,11vw,180px)] leading-[0.92] tracking-tight uppercase max-w-[10ch]">
          Our <span className="font-swash italic font-light">Services</span>
        </h2>
      </div>

      <div className="mt-24 space-y-24 md:space-y-40">
        {rows.map((r, i) => (
          <ServiceRow key={r.n} {...r} imageRight={i % 2 === 0} />
        ))}
      </div>
    </section>
  );
}

function ServiceRow({ n, title, desc, imageRight }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const sp = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 28,
    mass: 0.5,
  });
  const imageScale = useTransform(sp, [0, 0.5, 1], [1.2, 1, 0.72]);
  const imageOpacity = useTransform(sp, [0, 0.15, 0.85, 1], [0.6, 1, 1, 0.6]);
  const textScale = useTransform(sp, [0, 0.5, 1], [0.72, 1, 1.18]);
  const textY = useTransform(sp, [0, 1], ["8%", "-8%"]);

  const textOrigin = imageRight ? "left center" : "right center";
  const imageOrigin = imageRight ? "right center" : "left center";

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center min-h-[70vh]"
    >
      <motion.div
        style={{
          scale: imageScale,
          opacity: imageOpacity,
          transformOrigin: imageOrigin,
        }}
        className={`md:col-span-6 ${
          imageRight ? "md:order-2 md:justify-self-end" : "md:order-1 md:justify-self-start"
        } w-full`}
      >
        <Media
          label={title}
          chip={n}
          className="aspect-[4/5] w-full max-w-[520px]"
        />
      </motion.div>

      <motion.div
        style={{
          scale: textScale,
          y: textY,
          transformOrigin: textOrigin,
        }}
        className={`md:col-span-6 ${
          imageRight ? "md:order-1 text-left" : "md:order-2 text-right md:justify-self-end"
        }`}
      >
        <span className="block text-xs uppercase tracking-[0.28em] text-[color:var(--ink-dim)] tabular-nums">
          [ {n} ]
        </span>
        <h3 className="mt-4 font-display uppercase tracking-tight leading-[0.95] text-[clamp(40px,7.5vw,112px)]">
          {title}
        </h3>
        <p
          className={`mt-6 text-sm leading-7 text-[color:var(--ink-dim)] max-w-sm ${
            imageRight ? "" : "ml-auto"
          }`}
        >
          {desc}
        </p>
      </motion.div>
    </div>
  );
}

/* ============================================================
   FOUNDER NOTE
============================================================ */
function FounderNote() {
  return (
    <section
      id="founder"
      className="relative section-pad min-h-screen flex flex-col justify-center"
    >
      <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--ink-dim)] mb-6">
        [ 03 ] — A Note From
      </p>
      <h2 className="font-display text-[clamp(44px,8vw,128px)] leading-[0.95] tracking-tight mb-16">
        The <span className="font-swash italic font-light">Founder</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
        {/* LEFT: founder image zooms OUT (starts big, settles to natural) */}
        <motion.div
          className="md:col-span-5 w-full flex flex-col items-start"
          initial={{ scale: 1.3, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "center center" }}
        >
          <Media
            label="Founder portrait"
            chip="Founder"
            className="aspect-[4/5] w-full max-w-[560px]"
          />
          <span className="font-swash italic font-light text-3xl md:text-5xl mt-8 text-[color:var(--ink)]">
            — Lorem Ipsum
          </span>
          <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--ink-dim)] mt-3">
            Founder &amp; Creative Director
          </span>
        </motion.div>

        {/* RIGHT: content zooms IN (starts small + faded, grows to natural) */}
        <motion.div
          className="md:col-span-7 md:pl-6 flex flex-col gap-8 max-w-[640px]"
          initial={{ scale: 0.82, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
            delay: 0.25,
          }}
          style={{ transformOrigin: "left center" }}
        >
          <blockquote className="font-display text-[clamp(22px,2.6vw,40px)] leading-[1.35] italic text-[color:var(--ink)]">
            <span
              aria-hidden
              className="font-swash italic font-light text-[clamp(46px,6vw,90px)] leading-none text-[color:var(--accent)] opacity-70 align-top mr-2"
            >
              “
            </span>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua, ut
            enim ad minim veniam quis nostrud exercitation.
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
}

/* ============================================================
   FOOTER + GET IN TOUCH
============================================================ */
function FooterCTA() {
  return (
    <section id="contact" className="relative pt-20 pb-10 overflow-hidden">
      <div className="section-pad py-20 flex flex-col items-center text-center gap-12">
        <p className="text-xs uppercase tracking-[0.32em] text-[color:var(--ink-dim)]">
          [ 04 ] — Contact
        </p>
        <h2 className="font-display text-[clamp(64px,12vw,200px)] leading-[0.92] tracking-tight uppercase">
          Get <span className="font-swash italic font-light">In</span> Touch
        </h2>
        <p className="max-w-md text-sm leading-7 text-[color:var(--ink-dim)]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <Magnetic strength={28}>
          <motion.a
            href="mailto:hello@theindoorrevamp.com"
            data-cursor="say hello"
            className="btn-circle h-[160px] w-[160px] md:h-[190px] md:w-[190px] float-anim"
            aria-label="Contact"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ type: "spring", stiffness: 150, damping: 14 }}
          >
            Say Hello
          </motion.a>
        </Magnetic>
      </div>

      <div className="section-pad pt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--ink-dim)] mb-3">
              Phone
            </p>
            <p className="mb-6">+0 000 00 00 000</p>
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--ink-dim)] mb-3">
              E-mail
            </p>
            <p>lorem@ipsum.com</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--ink-dim)] mb-3">
              Navigation
            </p>
            <ul className="space-y-2">
              {["About", "Services", "FAQ", "Cases"].map((l) => (
                <li key={l}>
                  <a
                    href={`#${l.toLowerCase()}`}
                    className="hover-underline uppercase tracking-[0.12em] text-xs"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--ink-dim)] mb-3">
              Social Media
            </p>
            <ul className="space-y-2">
              {["Telegram", "Instagram", "LinkedIn", "Facebook"].map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="hover-underline uppercase tracking-[0.12em] text-xs"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:text-right md:self-end">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              data-cursor="top"
              className="hover-underline uppercase tracking-[0.18em] text-xs"
            >
              Back to the top ↑
            </button>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-[color:var(--line)] flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[color:var(--ink-dim)]">
          <span>The Indoor Revamp © 2026</span>
          <a href="#" className="hover-underline">
            Privacy policy
          </a>
          <span>Lorem Ipsum Dolor</span>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   PAGE
============================================================ */
export default function Home() {
  return (
    <>
      <Cursor />
      <main className="relative px-3 md:px-4 pt-3 md:pt-4 pb-4">
        <div className="card-shell relative">
          <Hero />
          <Cozy />
          <Stats />
          <Services />
          <FounderNote />
          <FooterCTA />
        </div>
      </main>
    </>
  );
}
