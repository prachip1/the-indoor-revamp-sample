"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Nav from "./_components/Nav";
import Cursor from "./_components/Cursor";
import Media from "./_components/Media";
import { CASES } from "./_data/cases";
import {
  motion,
  AnimatePresence,
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
   Scroll-linked word reveal — each word brightens in turn as the
   container passes through the viewport, giving a smooth typewriter-
   style highlight wave. Word ranges overlap so the handover between
   neighboring words feels continuous, not stepped.
============================================================ */
function RevealWord({ text, start, end, progress }) {
  const opacity = useTransform(progress, [start, end], [0.18, 1]);
  return <motion.span style={{ opacity }}>{text}</motion.span>;
}

function ScrollWordReveal({ children, className = "" }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    // Start the wave the moment the block enters the viewport from
    // below, and finish only once it has scrolled most of the way up.
    // Wide range = slow, deliberate typewriter feel.
    offset: ["start 0.95", "end 0.15"],
  });

  // Preserve whitespace so layout is identical to a plain text node.
  const tokens = String(children).split(/(\s+)/).filter(Boolean);
  const wordCount = tokens.filter((t) => /\S/.test(t)).length || 1;
  let wordIdx = -1;

  return (
    <span ref={ref} className={className}>
      {tokens.map((tok, i) => {
        if (/^\s+$/.test(tok)) return <span key={i}>{tok}</span>;
        wordIdx++;
        const step = 1 / wordCount;
        // Each word's brightening overlaps slightly with its neighbors
        // (±30% of a step) so adjacent words fade together.
        const startP = Math.max(0, wordIdx * step - step * 0.3);
        const endP = Math.min(1, (wordIdx + 1) * step + step * 0.3);
        return (
          <RevealWord
            key={i}
            text={tok}
            start={startP}
            end={endP}
            progress={scrollYProgress}
          />
        );
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
   GLOBAL SPOTLIGHT
   A fixed, viewport-wide glow that follows the cursor across
   the whole page. Lives outside the Hero so it isn't clipped at
   the hero/about seam — instead it morphs from a soft warm halo
   into a defined circle as you scroll into About Us, then fades
   out by the time the next section arrives.
============================================================ */
function GlobalSpotlight() {
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const smx = useSpring(mx, { stiffness: 350, damping: 32, mass: 0.25 });
  const smy = useSpring(my, { stiffness: 350, damping: 32, mass: 0.25 });
  const [vh, setVh] = useState(800);

  useEffect(() => {
    const onMove = (e) => {
      mx.set((e.clientX / window.innerWidth) * 100);
      my.set((e.clientY / window.innerHeight) * 100);
    };
    const onResize = () => setVh(window.innerHeight);
    onResize();
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [mx, my]);

  const { scrollY } = useScroll();
  // Fully present across the hero, then fades out as the hero leaves the
  // viewport so the dark wash never bleeds onto the next section.
  const opacity = useTransform(scrollY, [0, vh * 0.55, vh * 0.95], [1, 1, 0]);
  // Radius (px) of the soft opening that reveals the photo; eases a touch
  // smaller as you start scrolling.
  const radius = useTransform(scrollY, [0, vh * 0.6], [140, 120], {
    clamp: true,
  });

  // A near-opaque dark veil over the whole hero, lifted at the cursor so
  // the photo shows through, like a torch. The opening carries a warm
  // brown tint in its centre that deepens into a glow ring, then falls
  // off into the dark veil that fills out to every screen edge.
  const torch = useMotionTemplate`radial-gradient(${radius}px circle at ${smx}% ${smy}%, rgba(150, 96, 58, 0.16) 0%, rgba(150, 96, 58, 0.3) 46%, rgba(16, 12, 9, 0.78) 100%)`;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[6]"
      style={{ background: torch, opacity }}
    />
  );
}

/* ============================================================
   Section eyebrow — colored dot + slate brackets on the number.
   `tone` accepts any CSS var name (e.g. "--clay") so each section
   can pick a different highlight color.
============================================================ */
function SectionLabel({ num, children, className = "", tone = "--cta" }) {
  const color = `var(${tone})`;
  return (
    <p
      className={`text-xs uppercase tracking-[0.32em] text-[color:var(--ink-dim)] mb-6 inline-flex items-center gap-3 ${className}`}
    >
      <span
        aria-hidden
        className="inline-block h-[7px] w-[7px] rounded-full"
        style={{ background: color, boxShadow: `0 0 14px ${color}` }}
      />
      <span>
        <span style={{ color }}>[ {num} ]</span>
        <span className="opacity-60"> — </span>
        {children}
      </span>
    </p>
  );
}

/* ============================================================
   HERO
============================================================ */
function Hero() {
  return (
    <section
      data-spotlight
      className="relative h-[100svh] min-h-[680px] w-full overflow-hidden"
    >
      {/* Background photo + cinematic dark scrim. The photo is dark and
          ornate, so the hero type, nav and captions render in cream/gold
          and the scrim darkens the top/bottom/edges to keep them legible. */}
      <Image
        src="https://images.unsplash.com/photo-1455593984172-9f753a2e1ebd?w=2400&q=80&auto=format&fit=crop"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden className="hero-photo-scrim" />
      <Nav tone="light" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 text-center">
        <h1 className="font-display text-[#f5ead9] drop-shadow-[0_4px_26px_rgba(0,0,0,0.8)]">
          <MaskRevealMixed
            onMount
            className="block text-[clamp(48px,9vw,148px)]"
            parts={[
              "Lorem ",
              <span
                key="n"
                className="font-swash italic font-light text-[#e6c79c]"
              >
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
              <span
                key="amp"
                className="font-swash italic font-light text-[#e6c79c]"
              >
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
        className="absolute bottom-10 left-0 right-0 z-10 grid grid-cols-1 md:grid-cols-2 gap-6 section-pad pb-10 text-xs md:text-sm leading-relaxed text-[#efe1c9] opacity-90"
      >
        <p className="max-w-xs">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </p>
        <div className="md:justify-self-end flex items-end gap-4">
          <span className="font-display text-2xl italic text-[#e6c79c] opacity-90">§</span>
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
    <section id="about" className="relative section-pad overflow-hidden">
      <span aria-hidden className="aura clay" style={{ width: 520, height: 520, top: "-120px", right: "-160px" }} />
      <span aria-hidden className="aura sage" style={{ width: 380, height: 380, bottom: "-100px", left: "-120px", animationDelay: "-6s" }} />
      <div className="relative">
      <SectionLabel num="01" tone="--clay">About</SectionLabel>
      <h2 className="font-display text-[clamp(54px,10vw,160px)] leading-[0.95] tracking-tight">
        About <span className="font-swash italic font-light">Us</span>
      </h2>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        <motion.div
          className="md:col-span-5"
          initial={{ x: -60, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="max-w-[480px] space-y-6 text-base md:text-lg leading-8 text-[color:var(--ink-dim)]">
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
            chip="02"
            video="https://videos.pexels.com/video-files/3982254/3982254-uhd_2560_1440_30fps.mp4"
            className="aspect-[4/5] md:aspect-auto md:h-[640px]"
          />
        </motion.div>
      </div>
      </div>
    </section>
  );
}

/* ============================================================
   STATS
============================================================ */
function Stats() {
  const rows = [
    { n: 12, label: "Lorem", tone: "--clay", gradient: "text-gradient-warm" },
    { n: 86, label: "Ipsum", tone: "--sky", gradient: "text-gradient-cool" },
    { n: 240, label: "Dolor", tone: "--mustard", gradient: "text-gradient-warm" },
  ];
  return (
    <section className="relative section-pad pt-0 overflow-hidden">
      <span aria-hidden className="aura sky" style={{ width: 460, height: 460, top: "10%", right: "-160px", animationDelay: "-3s" }} />
      <span aria-hidden className="aura mustard" style={{ width: 320, height: 320, bottom: "-80px", left: "30%", animationDelay: "-9s" }} />
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
        <div className="md:col-span-7">
          <div className="space-y-12">
            {rows.map((row, i) => (
              <motion.div
                key={row.label}
                className="relative grid grid-cols-2 gap-6 items-end pb-6"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.9,
                  delay: i * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <span
                  className="font-display text-[clamp(96px,15vw,220px)] leading-none"
                  style={{ color: `var(${row.tone})` }}
                >
                  <Odometer value={row.n} />
                </span>
                <span className="text-sm tracking-[0.18em] uppercase text-[color:var(--ink-dim)] pb-3 inline-flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ background: `var(${row.tone})`, boxShadow: `0 0 10px var(${row.tone})` }}
                  />
                  {row.label}
                </span>
                <span
                  aria-hidden
                  className="absolute left-0 bottom-0 h-px w-full"
                  style={{
                    background: `linear-gradient(to right, var(${row.tone}), color-mix(in srgb, var(${row.tone}) 30%, transparent) 60%, transparent)`,
                  }}
                />
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
      title: "Lorem",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      cta: "Know More",
      href: "#service-01",
      tone: "--clay",
    },
    {
      n: "02",
      title: "Dolor",
      desc: "Ut enim ad minim veniam, quis nostrud exercitation.",
      cta: "Know More",
      href: "#service-02",
      tone: "--sage",
    },
    {
      n: "03",
      title: "Sit",
      desc: "Duis aute irure dolor in reprehenderit voluptate.",
      cta: "Know More",
      href: "#service-03",
      tone: "--sky",
    },
    {
      n: "04",
      title: "Amet",
      desc: "Excepteur sint occaecat cupidatat non proident sunt.",
      cta: "Know More",
      href: "#service-04",
      tone: "--mustard",
    },
  ];
  return (
    <section id="services" className="relative section-pad overflow-hidden">
      <span aria-hidden className="aura sage" style={{ width: 520, height: 520, top: "8%", left: "-180px" }} />
      <span aria-hidden className="aura blush" style={{ width: 380, height: 380, bottom: "20%", right: "-120px", animationDelay: "-7s" }} />
      <div className="relative">
        <SectionLabel num="02" tone="--sage">Services</SectionLabel>
        <h2 className="font-display text-[clamp(56px,11vw,180px)] leading-[0.92] tracking-tight uppercase max-w-[14ch]">
          Our <span className="font-swash italic font-light">Services</span>
        </h2>
      </div>

      <div className="relative mt-24 space-y-24 md:space-y-40">
        {rows.map((r, i) => (
          <ServiceRow key={r.n} {...r} imageRight={i % 2 === 0} />
        ))}
      </div>
    </section>
  );
}

function ServiceRow({ n, title, desc, cta, href, imageRight, tone = "--cta" }) {
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
  const imageScale = useTransform(sp, [0, 0.5, 1], [1.15, 1, 0.78]);
  const imageOpacity = useTransform(sp, [0, 0.15, 0.85, 1], [0.6, 1, 1, 0.6]);
  const textScale = useTransform(sp, [0, 0.5, 1], [0.78, 1, 1.12]);
  const textY = useTransform(sp, [0, 1], ["8%", "-8%"]);

  const textOrigin = imageRight ? "left center" : "right center";
  const imageOrigin = imageRight ? "right center" : "left center";

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center min-h-[70vh]"
    >
      {/* Image — 7/12 columns, slightly landscape, no width cap so it
          takes the full column width. */}
      <motion.div
        style={{
          scale: imageScale,
          opacity: imageOpacity,
          transformOrigin: imageOrigin,
        }}
        className={`md:col-span-7 ${
          imageRight ? "md:order-2 md:justify-self-end" : "md:order-1 md:justify-self-start"
        } w-full`}
      >
        <Media
          label={title}
          chip={n}
          image="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80&auto=format&fit=crop"
          className="aspect-[5/4] w-full"
          expandable
        />
      </motion.div>

      {/* Text — 5/12 columns. CTA sits below the description. */}
      <motion.div
        style={{
          scale: textScale,
          y: textY,
          transformOrigin: textOrigin,
        }}
        className={`md:col-span-5 ${
          imageRight ? "md:order-1 text-left" : "md:order-2 text-right md:justify-self-end"
        }`}
      >
        <span
          className="block text-xs uppercase tracking-[0.28em] tabular-nums"
          style={{ color: `var(${tone})` }}
        >
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
        <div className={`mt-8 flex ${imageRight ? "justify-start" : "justify-end"}`}>
          {/* Caption-style CTA. data-cursor="none" suppresses the big
              link-mode circle on hover; the text gets the slate color
              shift + underline as its hover affordance instead. */}
          <a
            href={href}
            data-cursor="none"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] transition-colors duration-300 hover-underline"
            style={{ color: `var(${tone})` }}
          >
            {cta}
            <span aria-hidden>↗</span>
          </a>
        </div>
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
      className="relative section-pad min-h-screen flex flex-col justify-center overflow-hidden"
    >
      <span aria-hidden className="aura blush" style={{ width: 560, height: 560, top: "-100px", right: "-180px", animationDelay: "-2s" }} />
      <span aria-hidden className="aura sky" style={{ width: 360, height: 360, bottom: "-80px", left: "10%", animationDelay: "-11s" }} />
      <div className="relative">
      <SectionLabel num="03" tone="--blush">A Note From</SectionLabel>
      <h2 className="font-display text-[clamp(44px,8vw,128px)] leading-[0.95] tracking-tight mb-16">
        The <span className="font-swash italic font-light text-gradient-warm">Founder</span>
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
            image="https://images.unsplash.com/photo-1605884636476-ec4bd6c8d958?w=1200&q=80&auto=format&fit=crop"
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
          <blockquote className="relative font-display text-[clamp(22px,2.6vw,40px)] leading-[1.45] italic text-[color:var(--ink)] pl-8 md:pl-12">
            {/* Opening quote is absolutely positioned so its big font
                size doesn't stretch the first body line. */}
            <span
              aria-hidden
              className="absolute left-0 -top-3 md:-top-6 font-swash italic font-light text-[clamp(46px,6vw,90px)] leading-none text-[color:var(--accent)] opacity-70 select-none pointer-events-none"
            >
              “
            </span>
            <ScrollWordReveal>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim ad minim veniam quis nostrud exercitation.
            </ScrollWordReveal>
            {/* Closing quote inline, scaled relative to body text so the
                final line stays the same height as the rest. */}
            <span
              aria-hidden
              className="font-swash italic font-light text-[1.6em] leading-none text-[color:var(--accent)] opacity-70 select-none ml-1 align-middle"
            >
              ”
            </span>
          </blockquote>
        </motion.div>
      </div>
      </div>
    </section>
  );
}

/* ============================================================
   CASE STUDIES  — numbered list; each row opens its case
============================================================ */

function CaseRow({ data, index, tone = "--cta", onOpen }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.8, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group border-t border-[color:var(--line)] transition-colors duration-500"
      style={{ ["--row-tone"]: `var(${tone})` }}
    >
      <button
        type="button"
        onClick={onOpen}
        data-cursor="open"
        className="grid w-full grid-cols-[2rem_1fr_auto] md:grid-cols-[3rem_1fr_minmax(0,14rem)_auto] items-center gap-5 md:gap-10 py-7 md:py-9 text-left"
      >
        <span
          className="font-display text-base md:text-xl tabular-nums transition-colors duration-300"
          style={{ color: `var(${tone})` }}
        >
          {data.n}
        </span>

        <span className="min-w-0">
          <h3 className="font-display uppercase tracking-tight leading-[0.95] text-[clamp(24px,4vw,52px)] transition-transform duration-500 group-hover:translate-x-2">
            {data.title}
          </h3>
          <span className="mt-1 block text-xs uppercase tracking-[0.2em] text-[color:var(--ink-dim)]">
            {data.type} · {data.year}
          </span>
        </span>

        <span className="hidden md:block overflow-hidden rounded-xl">
          <span className="block transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105">
            <Media
              label={data.title}
              image={data.image}
              className="aspect-[16/10] w-full"
            />
          </span>
        </span>

        <span className="justify-self-end inline-flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[color:var(--ink)]">
          <span className="hidden sm:inline hover-underline">View Case</span>
          <span className="inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-[color:var(--line)] transition-colors duration-300 group-hover:bg-[color:var(--cta)] group-hover:text-[#fbf5ec] group-hover:border-transparent">
            ↗
          </span>
        </span>
      </button>
    </motion.div>
  );
}

function CaseModal({ data, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-start md:items-center justify-center p-3 md:p-8 bg-[rgba(31,28,25,0.55)] backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={data.title}
    >
      <motion.div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-none rounded-3xl border border-[color:var(--line)] bg-[color:var(--card)]"
        initial={{ y: 60, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          data-cursor="close"
          aria-label="Close case"
          className="absolute top-5 right-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--card)] text-lg text-[color:var(--ink)] transition-colors duration-300 hover:bg-[color:var(--cta)] hover:text-[#fbf5ec] hover:border-transparent"
        >
          ✕
        </button>

        <Media
          label={data.title}
          chip={data.n}
          image={data.image}
          className="aspect-[16/9] w-full"
        />

        <div className="p-6 md:p-10">
          <span className="text-xs uppercase tracking-[0.28em] text-[color:var(--ink-dim)]">
            [ {data.n} ] — Case Study
          </span>
          <h3 className="mt-4 font-display uppercase tracking-tight leading-[0.95] text-[clamp(34px,6vw,72px)]">
            {data.title}
          </h3>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-5 border-y border-[color:var(--line)] py-5 text-xs uppercase tracking-[0.16em] text-[color:var(--ink-dim)]">
            {[
              ["Type", data.type],
              ["Year", data.year],
              ["Location", data.location],
              ["Area", data.area],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="mb-1 opacity-70">{k}</p>
                <p className="text-[color:var(--ink)] tracking-[0.08em]">{v}</p>
              </div>
            ))}
          </div>

          <div className="mt-7 space-y-5 text-sm leading-7 text-[color:var(--ink-dim)] max-w-prose">
            {data.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {data.tags.map((t, i) => (
              <span
                key={t}
                className="chip-tone"
                style={{ ["--tone"]: `var(${CASE_TONES[i % CASE_TONES.length]})` }}
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Media label={`${data.title} — detail`} className="aspect-[4/3]" />
            <Media label={`${data.title} — detail`} className="aspect-[4/3]" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const CASE_TONES = ["--clay", "--sage", "--sky", "--mustard", "--blush"];

function CaseStudies() {
  const [openIndex, setOpenIndex] = useState(null);
  const active = openIndex !== null ? CASES[openIndex] : null;

  return (
    <section id="case-studies" className="relative section-pad overflow-hidden">
      <span aria-hidden className="aura mustard" style={{ width: 480, height: 480, top: "5%", right: "-160px" }} />
      <span aria-hidden className="aura clay" style={{ width: 360, height: 360, bottom: "10%", left: "-100px", animationDelay: "-8s" }} />
      <div className="relative">
        <SectionLabel num="04" tone="--mustard">Selected Work</SectionLabel>
        <h2 className="font-display text-[clamp(56px,11vw,180px)] leading-[0.92] tracking-tight uppercase max-w-[14ch]">
          Case <span className="font-swash italic font-light text-gradient-warm">Studies</span>
        </h2>
      </div>

      <div className="relative mt-16 md:mt-24">
        {CASES.map((c, i) => (
          <CaseRow
            key={c.title}
            data={c}
            index={i}
            tone={CASE_TONES[i % CASE_TONES.length]}
            onOpen={() => setOpenIndex(i)}
          />
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <CaseModal data={active} onClose={() => setOpenIndex(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

/* ============================================================
   FOOTER + GET IN TOUCH
============================================================ */
function FooterCTA() {
  const socials = [
    { l: "Instagram", h: "#", tone: "--clay" },
    { l: "Pinterest", h: "#", tone: "--sage" },
    { l: "LinkedIn", h: "#", tone: "--sky" },
    { l: "Houzz", h: "#", tone: "--mustard" },
  ];
  const cream = "#efe1c9";
  const creamDim = "rgba(239,225,201,0.6)";
  const lineDark = "rgba(239,225,201,0.14)";
  return (
    <section
      id="contact"
      className="relative -mt-32 md:-mt-48 overflow-hidden"
      style={{ background: "#2a1a0e" }}
    >
      {/* ── BEIGE COVER ──────────────────────────────────────────────
         The whole section sits on solid cocoa. This single overlay
         covers the upper portion with the exact page beige and fades
         to transparent at its lower edge, so the cocoa shows through
         continuously beneath. There is no separate "transition strip"
         and no rectangular ends to perceive as a line — the only edge
         is transparent, which is invisible. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[1100px] md:h-[1300px]"
        style={{
          background:
            "linear-gradient(in oklch to bottom, #dbc9b5 0%, #dbc9b5 52%, transparent 100%)",
        }}
      />

      {/* ── 1. CONTACT CTA — sits on the beige top portion ────────── */}
      <span
        aria-hidden
        className="aura still clay"
        style={{ width: 520, height: 520, top: "180px", left: "50%", transform: "translateX(-50%)" }}
      />
      <div className="relative section-pad pt-44 md:pt-64 pb-32 flex flex-col items-center text-center gap-12">
        <SectionLabel num="05" tone="--clay">Contact</SectionLabel>
        <h2 className="font-display text-[clamp(64px,12vw,200px)] leading-[0.92] tracking-tight uppercase">
          Get <span className="font-swash italic font-light text-gradient-warm">In</span> Touch
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

      {/* ── 2. DARK FOOTER — accent colors pop against the cocoa
            already painted by the section bg. ────────────────────── */}
      <div className="relative" style={{ color: cream }}>
        <span
          aria-hidden
          className="aura still on-dark clay"
          style={{ width: 360, height: 360, top: "-80px", left: "-100px" }}
        />
        <span
          aria-hidden
          className="aura still on-dark sky"
          style={{ width: 320, height: 320, top: "15%", right: "-80px" }}
        />
        <span
          aria-hidden
          className="aura still on-dark mustard"
          style={{ width: 280, height: 280, bottom: "10%", left: "35%" }}
        />

        <footer className="relative section-pad pt-20 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-10">
            {/* Brand column — logo + contact */}
            <div className="md:col-span-5 flex flex-col gap-8">
              <a
                href="/"
                aria-label="The Indoor Revamp — home"
                className="inline-flex items-center gap-4 shrink-0"
                data-cursor="none"
              >
                <Image
                  src="/logo-mark.png"
                  alt="The Indoor Revamp"
                  width={500}
                  height={500}
                  className="h-20 w-20 md:h-24 md:w-24 object-contain"
                />
                <span
                  className="font-display text-2xl md:text-3xl leading-[0.95] uppercase tracking-tight max-w-[10ch]"
                  style={{ color: cream }}
                >
                  The <span className="font-swash italic font-light" style={{ color: "var(--clay)" }}>Indoor</span>{" "}
                  Revamp
                </span>
              </a>

              <div className="flex flex-col gap-5 text-sm">
                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.28em] mb-2"
                    style={{ color: creamDim }}
                  >
                    Phone
                  </p>
                  <a
                    href="tel:+910000000000"
                    className="font-display text-2xl md:text-3xl leading-none hover-underline"
                    style={{ color: cream }}
                  >
                    +0 000 00 00 000
                  </a>
                </div>

                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.28em] mb-2"
                    style={{ color: creamDim }}
                  >
                    E-mail
                  </p>
                  <a
                    href="mailto:hello@theindoorrevamp.com"
                    className="font-display text-2xl md:text-3xl leading-none hover-underline"
                    style={{ color: "var(--clay)" }}
                  >
                    hello@theindoorrevamp.com
                  </a>
                </div>

                <div>
                  <p
                    className="text-[10px] uppercase tracking-[0.28em] mb-2"
                    style={{ color: creamDim }}
                  >
                    Studio
                  </p>
                  <p className="text-sm leading-7 max-w-xs" style={{ color: cream }}>
                    By appointment only.
                    <br />
                    Available pan-India for on-site visits.
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="md:col-span-3">
              <p
                className="text-[10px] uppercase tracking-[0.28em] mb-5"
                style={{ color: creamDim }}
              >
                Navigation
              </p>
              <ul className="space-y-3">
                {[
                  { l: "About", h: "/about" },
                  { l: "Services", h: "/services" },
                  { l: "Case Studies", h: "/case-studies" },
                  { l: "Journal", h: "/blog" },
                  { l: "FAQ", h: "/faq" },
                ].map((x) => (
                  <li key={x.l}>
                    <a
                      href={x.h}
                      className="hover-underline uppercase tracking-[0.16em] text-[11px]"
                      style={{ color: cream }}
                    >
                      {x.l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Social + back to top */}
            <div className="md:col-span-4 flex flex-col gap-10">
              <div>
                <p
                  className="text-[10px] uppercase tracking-[0.28em] mb-5"
                  style={{ color: creamDim }}
                >
                  Follow Along
                </p>
                <ul className="space-y-3">
                  {socials.map((x) => (
                    <li key={x.l}>
                      <a
                        href={x.h}
                        className="hover-underline uppercase tracking-[0.16em] text-[11px] inline-flex items-center gap-2 transition-colors duration-300"
                        style={{ color: `var(${x.tone})` }}
                      >
                        <span>{x.l}</span>
                        <span aria-hidden>↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:self-end">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  data-cursor="top"
                  className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.22em]"
                  style={{ color: cream }}
                >
                  <span className="hover-underline">Back to the top</span>
                  <span
                    className="inline-flex items-center justify-center h-9 w-9 rounded-full transition-all duration-500 group-hover:-translate-y-1"
                    style={{
                      border: `1px solid var(--clay)`,
                      color: "var(--clay)",
                    }}
                    aria-hidden
                  >
                    ↑
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Oversized closing statement — light gradient that reads on dark cocoa. */}
          <div className="relative mt-20 md:mt-28">
            <p
              className="font-display leading-[0.92] tracking-tight text-[clamp(36px,7vw,108px)] max-w-[14ch] md:max-w-none"
              style={{
                background:
                  "linear-gradient(135deg, #efe1c9 0%, #d8a87b 45%, #c97b54 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              We don&rsquo;t{" "}
              <span className="font-swash italic font-light">design</span> homes —
              <br className="hidden md:block" /> we{" "}
              <span className="font-swash italic font-light">transform</span>{" "}
              them.
            </p>
          </div>

          <div
            className="mt-10 pt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[10px] uppercase tracking-[0.22em]"
            style={{ borderTop: `1px solid ${lineDark}`, color: creamDim }}
          >
            <span>© 2026 The Indoor Revamp. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="hover-underline" style={{ color: cream }}>
                Privacy policy
              </a>
              <a href="/terms" className="hover-underline" style={{ color: cream }}>
                Terms
              </a>
            </div>
            <span>
              Built by{" "}
              <a
                href="https://byteyourweb.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover-underline"
                style={{ color: "var(--clay)" }}
              >
                ByteYourWeb
              </a>{" "}
              · Made in India
            </span>
          </div>
        </footer>
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
      <GlobalSpotlight />
      <main className="relative px-3 md:px-4 pt-3 md:pt-4 pb-4">
        <div className="card-shell relative">
          <Hero />
          <Cozy />
          <Stats />
          <Services />
          <FounderNote />
          <CaseStudies />
          <FooterCTA />
        </div>
      </main>
    </>
  );
}
