"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Cursor from "../_components/Cursor";
import Nav from "../_components/Nav";
import SectionLabel from "../_components/SectionLabel";
import Media from "../_components/Media";

export default function AboutClient() {
  return (
    <>
      <Cursor />
      <main className="relative px-3 md:px-4 pt-3 md:pt-4 pb-4">
        <div className="card-shell relative">
          <PageHero />
          <Story />
          <Values />
          <FounderQuote />
          <ContactStrip />
        </div>
      </main>
    </>
  );
}

function PageHero() {
  return (
    <section className="relative min-h-[88svh] flex flex-col overflow-hidden">
      <div className="absolute inset-0 hero-ph" />
      <Nav />
      <div className="relative z-10 section-pad flex-1 flex flex-col justify-start mt-24 md:mt-32 pb-16 md:pb-24">
        {/**<SectionLabel num="01">About</SectionLabel> */}
        <h1 className="font-display text-[clamp(64px,13vw,200px)] leading-[0.9] uppercase tracking-tight max-w-[14ch]">
          Our <span className="font-swash italic font-light">Story</span>
        </h1>
        <p className="mt-8 max-w-md text-sm leading-7 text-[color:var(--ink-dim)]">
          We don&rsquo;t design homes. We listen, we look, and we transform the
          space until it feels unmistakably yours.
        </p>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="section-pad">
      <SectionLabel num="02">Our Story</SectionLabel>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
        <motion.div
          className="md:col-span-7 md:col-start-1 space-y-6 text-sm leading-7 text-[color:var(--ink-dim)] max-w-md"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="font-display text-[clamp(28px,4vw,52px)] leading-[1.05] tracking-tight text-[color:var(--ink)] italic">
            Lorem ipsum, dolor{" "}
            <span className="font-swash font-light not-italic">sit amet</span>
            .
          </h2>
          <p>
         The Indoor Revamp is a boutique interior design firm dedicated to crafting thoughtful, holistic spaces that reflect each client’s personality,
lifestyle, and needs. We believe that good design goes beyond aesthetics it’s about creating environments that feel intuitive, functional, and deeply personal.
          </p>
          <p>
       With a strong focus on end-to-end service and consistent on-site involvement, we manage every stage of the process from concept
development and material selection to execution and final styling. Our hands-on approach ensures attention to detail, quality control, and
seamless coordination, allowing clients to experience a smooth, stress-free journey without having to worry about the complexities of the project.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Values() {
  const items = [
    {
      n: "01",
      title: "Crafted",
      desc: "Every surface, joint and seam is considered. Nothing accidental.",
    },
    {
      n: "02",
      title: "Honest",
      desc: "We pick materials that age with you instead of against you.",
    },
    {
      n: "03",
      title: "Patient",
      desc: "We design at the pace the room asks for — not the calendar's.",
    },
  ];

  return (
    <section className="section-pad pt-0">
      <SectionLabel num="03">What We Believe</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mt-12">
        {items.map((it, i) => (
          <motion.div
            key={it.n}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.9,
              delay: i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative border-t border-transparent pt-7"
            style={{
              borderImage:
                "linear-gradient(to right, var(--accent), transparent) 1",
              borderImageSlice: 1,
            }}
          >
            <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--cta)]">
              [ {it.n} ]
            </span>
            <h3 className="mt-4 font-display text-[clamp(36px,5vw,72px)] uppercase tracking-tight leading-[0.95]">
              {it.title}
            </h3>
            <p className="mt-4 text-sm leading-7 text-[color:var(--ink-dim)] max-w-xs">
              {it.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FounderQuote() {
  return (
    <section className="section-pad">
      <SectionLabel num="04">A Note From The Founder</SectionLabel>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center mt-8">
        <motion.div
          className="md:col-span-4"
          initial={{ scale: 1.2, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Media
            label="Founder portrait"
            chip="Founder"
            image="/founder.png"
            className="aspect-[4/5] w-full max-w-[420px]"
          />
        </motion.div>
        <motion.blockquote
          className="md:col-span-8 relative font-display text-[clamp(22px,2.6vw,38px)] leading-[1.45] italic text-[color:var(--ink)] pl-8 md:pl-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            aria-hidden
            className="absolute left-0 -top-3 md:-top-6 font-swash italic font-light text-[clamp(46px,6vw,90px)] leading-none text-[color:var(--accent)] opacity-70 select-none pointer-events-none"
          >
            “
          </span>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua, ut enim
          ad minim veniam quis nostrud exercitation ullamco laboris.
          <span
            aria-hidden
            className="font-swash italic font-light text-[1.6em] leading-none text-[color:var(--accent)] opacity-70 select-none ml-1 align-middle"
          >
            ”
          </span>
          <footer className="mt-8 text-xs uppercase tracking-[0.22em] text-[color:var(--ink-dim)] not-italic">
            — Nidhi Singh Rathore, Founder &amp; Creative Director
          </footer>
        </motion.blockquote>
      </div>
    </section>
  );
}

function ContactStrip() {
  return (
    <section className="section-pad text-center">
      <SectionLabel num="05" className="mx-auto">
        Next
      </SectionLabel>
      <h2 className="font-display text-[clamp(48px,9vw,140px)] leading-[0.92] uppercase tracking-tight">
        Let&rsquo;s{" "}
        <span className="font-swash italic font-light">Talk</span>
      </h2>
      <p className="mt-6 mx-auto max-w-md text-sm leading-7 text-[color:var(--ink-dim)]">
        Tell us about the room. We&rsquo;ll bring the rest.
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
