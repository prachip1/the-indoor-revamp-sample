"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import Cursor from "../_components/Cursor";
import Nav from "../_components/Nav";
import SectionLabel from "../_components/SectionLabel";

const FAQS = [
  {
    q: "How long does a typical interior design project take?",
    a: "Most residential projects take between 8 to 16 weeks from concept to completion, depending on the scope, materials chosen, and site conditions. We'll give you a detailed timeline after the initial consultation.",
  },
  {
    q: "Do you work on both residential and commercial spaces?",
    a: "Yes — we work across homes, offices, retail, and hospitality spaces. Each project gets the same level of attention regardless of size.",
  },
  {
    q: "What is your design process like?",
    a: "We start with a site visit and consultation to understand how you use the space and what matters to you. From there we develop a concept, present mood boards and layouts, and move into execution once you're happy with the direction.",
  },
  {
    q: "Can I be involved in the decision-making?",
    a: "Absolutely — your involvement is the whole point. We present options at every key stage so nothing moves forward without your sign-off.",
  },
  {
    q: "Do you handle procurement and installation?",
    a: "Yes. We manage sourcing, vendor coordination, and on-site supervision so you don't have to chase anyone. You get a single point of contact from start to finish.",
  },
  {
    q: "How do you charge for your services?",
    a: "We offer a flat project fee for defined scopes and a retainer model for ongoing or phased work. Pricing is discussed transparently after the initial consultation — no surprises.",
  },
  {
    q: "Do you work outside your city?",
    a: "Yes, we take on projects across India. For outstation projects we schedule site visits at key milestones and coordinate closely with trusted local contractors.",
  },
  {
    q: "What if I already have furniture or pieces I want to keep?",
    a: "We design around what you love. Existing pieces often become the anchor of a room — we'll work them in rather than replace them.",
  },
];

export default function FaqClient() {
  return (
    <>
      <Cursor />
      <main className="relative px-3 md:px-4 pt-3 md:pt-4 pb-4">
        <div className="card-shell relative">
          <PageHero />
          <FaqList />
          <ContactStrip />
        </div>
      </main>
    </>
  );
}

function PageHero() {
  return (
    <section className="relative min-h-[60svh] flex flex-col overflow-hidden">
      <div className="absolute inset-0 hero-ph" />
      <Nav />
      <div className="relative z-10 section-pad flex-1 flex flex-col justify-end pb-16 md:pb-24">
        <SectionLabel num="01">FAQ</SectionLabel>
        <h1 className="font-display text-[clamp(64px,13vw,200px)] leading-[0.9] uppercase tracking-tight max-w-[14ch]">
          Questions{" "}
          <span className="font-swash italic font-light">Answered</span>
        </h1>
        <p className="mt-8 max-w-md text-sm leading-7 text-[color:var(--ink-dim)]">
          Everything you might want to know before we begin. If something
          isn&rsquo;t here, just ask.
        </p>
      </div>
    </section>
  );
}

function FaqList() {
  const [open, setOpen] = useState(null);

  return (
    <section className="section-pad">
      <SectionLabel num="02">Common Questions</SectionLabel>
      <div className="mt-12 divide-y divide-[color:var(--ink-dim)]/10">
        {FAQS.map((item, i) => (
          <FaqItem
            key={i}
            item={item}
            index={i}
            isOpen={open === i}
            onToggle={() => setOpen(open === i ? null : i)}
          />
        ))}
      </div>
    </section>
  );
}

function FaqItem({ item, index, isOpen, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start justify-between gap-6 py-7 text-left group"
      >
        <span className="font-display text-[clamp(18px,2vw,26px)] leading-[1.2] tracking-tight text-[color:var(--ink)] group-hover:text-[color:var(--cta)] transition-colors">
          {item.q}
        </span>
        <span
          className="mt-1 shrink-0 text-[color:var(--cta)] text-xl leading-none transition-transform duration-300"
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-7 text-sm leading-7 text-[color:var(--ink-dim)] max-w-2xl">
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ContactStrip() {
  return (
    <section className="section-pad text-center">
      <SectionLabel num="03" className="mx-auto">
        Still have questions?
      </SectionLabel>
      <h2 className="font-display text-[clamp(48px,9vw,140px)] leading-[0.92] uppercase tracking-tight">
        Let&rsquo;s{" "}
        <span className="font-swash italic font-light">Talk</span>
      </h2>
      <p className="mt-6 mx-auto max-w-md text-sm leading-7 text-[color:var(--ink-dim)]">
        We&rsquo;re happy to walk you through anything before you decide.
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
