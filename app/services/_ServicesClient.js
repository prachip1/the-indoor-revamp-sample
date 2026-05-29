"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Cursor from "../_components/Cursor";
import Nav from "../_components/Nav";
import SectionLabel from "../_components/SectionLabel";
import Media from "../_components/Media";

const SERVICES = [
  {
    n: "01",
    title: "Lorem",
    desc:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.",
    cta: "Know More",
    href: "#service-01",
  },
  {
    n: "02",
    title: "Dolor",
    desc:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    cta: "Know More",
    href: "#service-02",
  },
  {
    n: "03",
    title: "Sit",
    desc:
      "Duis aute irure dolor in reprehenderit voluptate velit esse cillum.",
    cta: "Know More",
    href: "#service-03",
  },
  {
    n: "04",
    title: "Amet",
    desc:
      "Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia.",
    cta: "Know More",
    href: "#service-04",
  },
];

const PROCESS = [
  {
    n: "I",
    title: "Listen",
    desc: "We walk the space and learn how you actually live in it.",
  },
  {
    n: "II",
    title: "Sketch",
    desc: "Mood, palette, plan. A clear picture before a single nail.",
  },
  {
    n: "III",
    title: "Build",
    desc: "On-site execution with craftspeople we trust by name.",
  },
];

export default function ServicesClient() {
  return (
    <>
      <Cursor />
      <main className="relative px-3 md:px-4 pt-3 md:pt-4 pb-4">
        <div className="card-shell relative">
          <PageHero />
          <ServiceList />
          <Process />
          <ContactStrip />
        </div>
      </main>
    </>
  );
}

function PageHero() {
  return (
    <section className="relative min-h-[80svh] flex flex-col overflow-hidden">
      <div className="absolute inset-0 hero-ph" />
      <Nav />
      <div className="relative z-10 section-pad flex-1 flex flex-col justify-end pb-16 md:pb-24">
        <SectionLabel num="01">Services</SectionLabel>
        <h1 className="font-display text-[clamp(64px,13vw,200px)] leading-[0.9] uppercase tracking-tight max-w-[14ch]">
          What We <span className="font-swash italic font-light">Do</span>
        </h1>
        <p className="mt-8 max-w-md text-sm leading-7 text-[color:var(--ink-dim)]">
          Four ways we shape a space. Pick one, mix two, or hand us the whole
          room and we&rsquo;ll take it from there.
        </p>
      </div>
    </section>
  );
}

function ServiceList() {
  return (
    <section className="section-pad">
      <SectionLabel num="02">Offerings</SectionLabel>
      <div className="mt-12 space-y-20 md:space-y-32">
        {SERVICES.map((s, i) => (
          <ServiceRow key={s.n} {...s} imageRight={i % 2 === 0} />
        ))}
      </div>
    </section>
  );
}

function ServiceRow({ n, title, desc, cta, href, imageRight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center"
    >
      <div
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
      </div>
      <div
        className={`md:col-span-5 ${
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
        <div
          className={`mt-8 flex ${
            imageRight ? "justify-start" : "justify-end"
          }`}
        >
          <a
            href={href}
            data-cursor="none"
            className="inline-block text-xs uppercase tracking-[0.22em] text-[color:var(--cta)] transition-colors duration-300 hover:text-[color:var(--cta-hover)] hover-underline"
          >
            {cta}
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function Process() {
  return (
    <section className="section-pad pt-0">
      <SectionLabel num="03">How We Work</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mt-12">
        {PROCESS.map((p, i) => (
          <motion.div
            key={p.n}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.9,
              delay: i * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative pt-7"
            style={{
              borderTop: "1px solid transparent",
              borderImage:
                "linear-gradient(to right, var(--accent), transparent) 1",
              borderImageSlice: 1,
            }}
          >
            <span className="font-display text-[clamp(48px,7vw,96px)] italic text-[color:var(--accent)]/80">
              {p.n}
            </span>
            <h3 className="mt-2 font-display text-[clamp(28px,3.5vw,48px)] uppercase tracking-tight">
              {p.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-[color:var(--ink-dim)] max-w-xs">
              {p.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ContactStrip() {
  return (
    <section className="section-pad text-center">
      <SectionLabel num="04" className="mx-auto">
        Next
      </SectionLabel>
      <h2 className="font-display text-[clamp(48px,9vw,140px)] leading-[0.92] uppercase tracking-tight">
        Start Your{" "}
        <span className="font-swash italic font-light">Project</span>
      </h2>
      <p className="mt-6 mx-auto max-w-md text-sm leading-7 text-[color:var(--ink-dim)]">
        A short note is all we need to get going.
      </p>
      <Link
        href="/#contact"
        data-cursor="none"
        className="inline-block mt-10 text-xs uppercase tracking-[0.22em] text-[color:var(--cta)] hover-underline transition-colors hover:text-[color:var(--cta-hover)]"
      >
        Get In Touch →
      </Link>
    </section>
  );
}
