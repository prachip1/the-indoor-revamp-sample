"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import Cursor from "../_components/Cursor";
import Nav from "../_components/Nav";
import SectionLabel from "../_components/SectionLabel";
import { CASES } from "../_data/cases";

/**
 * Lay N cards in one horizontal row that fits the viewport. Picks the
 * largest scale (≤1) where (n·cardW·scale + (n-1)·gap) fits the width.
 * Returns the scale and per-card x offsets measured from the row's centre.
 */
function fitRow(areaW, areaH, cardW, cardH, n, pad, gap) {
  const sFromW =
    (areaW - 2 * pad - (n - 1) * gap) / (n * cardW);
  const sFromH = (areaH - 2 * pad) / cardH;
  const scale = Math.max(0.4, Math.min(1, sFromW, sFromH));
  const stride = cardW * scale + gap;
  const positions = Array.from({ length: n }, (_, i) => ({
    x: (i - (n - 1) / 2) * stride,
    y: 0,
  }));
  return { scale, positions };
}

export default function CaseStudiesClient() {
  return (
    <>
      <Cursor />
      <main className="relative px-3 md:px-4 pt-3 md:pt-4 pb-4">
        <div className="card-shell relative">
          <PageHero />
          <DeckSection />
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
        <SectionLabel num="01">Selected Work</SectionLabel>
        <h1 className="font-display text-[clamp(64px,13vw,200px)] leading-[0.9] uppercase tracking-tight max-w-[14ch]">
          Case <span className="font-swash italic font-light">Studies</span>
        </h1>
        <p className="mt-8 max-w-md text-sm leading-7 text-[color:var(--ink-dim)]">
          Four rooms we&rsquo;ve reshaped, end to end. Tap the deck to
          spread it open, then pick a card to step inside.
        </p>
      </div>
    </section>
  );
}

function DeckSection() {
  const [thrown, setThrown] = useState(false);
  const [selected, setSelected] = useState(null);
  const sectionRef = useRef(null);
  const deckRef = useRef(null);
  const [layout, setLayout] = useState({
    throws: CASES.map(() => ({ x: 0, y: 0 })),
    thrownScale: 1,
  });

  useEffect(() => {
    const compute = () => {
      const section = sectionRef.current;
      const deck = deckRef.current;
      if (!section || !deck) return;
      const sectionRect = section.getBoundingClientRect();
      const deckRect = deck.getBoundingClientRect();
      const width = sectionRect.width;
      const height = sectionRect.height;
      const isMobile = width < 768;
      const cardW = isMobile ? 280 : 380;
      const cardH = isMobile ? 380 : 520;
      const pad = isMobile ? 16 : 32;
      const gap = isMobile ? 12 : 24;
      // Deck wrapper centre, in section coords.
      const deckCx = deckRect.left - sectionRect.left + deckRect.width / 2;
      const deckCy = deckRect.top - sectionRect.top + deckRect.height / 2;
      const { scale, positions } = fitRow(
        width,
        height,
        cardW,
        cardH,
        CASES.length,
        pad,
        gap
      );
      const rowCx = width / 2;
      const rowCy = height / 2;
      const dx = rowCx - deckCx;
      const dy = rowCy - deckCy;
      const throws = positions.map((p) => ({ x: dx + p.x, y: dy + p.y }));
      setLayout({ throws, thrownScale: scale });
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const handleCardClick = (card) => {
    if (!thrown) {
      setThrown(true);
      return;
    }
    setSelected(card);
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[110svh] overflow-hidden flex flex-col items-center justify-center py-16 md:py-24"
    >
      {/* Deck centred in the section — its size is one card so we can
          measure its bounding box and translate cards from there. */}
      <div className="relative shrink-0">
        <div
          ref={deckRef}
          className="relative h-[380px] w-[280px] md:h-[520px] md:w-[380px]"
        >
          {CASES.map((card, i) => {
            const isTop = i === 0;
            const target = layout.throws[i] || { x: 0, y: 0 };
            return (
              <motion.button
                key={card.n}
                type="button"
                onClick={() => handleCardClick(card)}
                aria-label={
                  thrown
                    ? `Open ${card.title} case study`
                    : isTop
                    ? "Distribute the deck"
                    : card.title
                }
                data-cursor={thrown ? "open" : undefined}
                className="absolute top-0 left-0 h-[380px] w-[280px] md:h-[520px] md:w-[380px] rounded-2xl overflow-hidden shadow-[0_30px_60px_-25px_rgba(63,78,79,0.45)] focus:outline-none bg-[color:var(--card-3)]"
                style={{ zIndex: CASES.length - i }}
                initial={false}
                animate={
                  thrown
                    ? {
                        x: target.x,
                        y: target.y,
                        rotate: 0,
                        scale: layout.thrownScale,
                      }
                    : { x: 0, y: 0, rotate: 0, scale: 1 }
                }
                whileHover={
                  thrown
                    ? { scale: layout.thrownScale * 1.04, y: target.y - 6 }
                    : isTop
                    ? { scale: 1.03, y: -6 }
                    : undefined
                }
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 22,
                  mass: 0.9,
                  delay: thrown
                    ? i * 0.06
                    : (CASES.length - 1 - i) * 0.04,
                }}
              >
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="380px"
                  className="object-cover pointer-events-none"
                  priority={isTop}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.55) 100%)",
                  }}
                />

                {/* Top meta strip */}
                <div
                  className="absolute top-0 inset-x-0 px-5 pt-4 pb-8 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(15,13,11,0.55), transparent)",
                    color: "#fbf5ec",
                  }}
                >
                  <span style={{ color: "var(--clay)" }}>[ {card.n} ]</span>
                  <span>{card.type}</span>
                </div>

                {/* Bottom caption */}
                <div
                  className="absolute bottom-0 inset-x-0 px-5 pt-12 pb-5 flex flex-col gap-3 text-left pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(15,13,11,0.92) 0%, rgba(15,13,11,0.55) 55%, transparent 100%)",
                    color: "#fbf5ec",
                  }}
                >
                  <h3 className="font-display uppercase leading-[0.95] tracking-tight text-[22px] md:text-[28px]">
                    {card.title}
                  </h3>
                  <p className="text-[12px] leading-5 text-[#efe1c9]/90 line-clamp-3">
                    {card.summary}
                  </p>
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.22em] text-[#efe1c9]/70 pt-1">
                    <span>{card.location}</span>
                    <span>{card.area}</span>
                    <span>{card.year}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Pulsing pill below the stacked deck inviting a click. Fades
            out as soon as the cards have been spread. */}
        <AnimatePresence>
          {!thrown && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="absolute left-1/2 -translate-x-1/2 -bottom-12 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.28em] pointer-events-none whitespace-nowrap"
              style={{
                background: "rgba(255,255,255,0.7)",
                color: "var(--cta)",
                border: "1px solid var(--line)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full rounded-full opacity-60"
                  style={{
                    background: "var(--clay)",
                    animation: "ping 1.6s cubic-bezier(0,0,0.2,1) infinite",
                  }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: "var(--clay)" }}
                />
              </span>
              Click the deck to spread
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Restack pill — only while thrown and modal isn't open */}
      <AnimatePresence>
        {thrown && !selected && (
          <motion.button
            type="button"
            onClick={() => setThrown(false)}
            data-cursor="none"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.22em]"
            style={{
              background: "rgba(255,255,255,0.7)",
              color: "var(--cta)",
              border: "1px solid var(--line)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span aria-hidden>↺</span> Restack
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected && (
          <CaseDetailModal
            data={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function CaseDetailModal({ data, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
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

  if (!mounted) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[200] flex items-start md:items-center justify-center p-3 md:p-8"
      style={{
        background: "rgba(15, 13, 11, 0.65)",
        backdropFilter: "blur(8px)",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={data.title}
    >
      <motion.div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-none rounded-3xl"
        style={{
          background: "var(--card)",
          border: "1px solid var(--line)",
        }}
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
          className="absolute top-5 right-5 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-lg transition-colors duration-300"
          style={{
            background: "var(--card)",
            color: "var(--ink)",
            border: "1px solid var(--line)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--cta)";
            e.currentTarget.style.color = "#fbf5ec";
            e.currentTarget.style.borderColor = "transparent";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--card)";
            e.currentTarget.style.color = "var(--ink)";
            e.currentTarget.style.borderColor = "var(--line)";
          }}
        >
          ✕
        </button>

        <div className="relative w-full aspect-[16/9]">
          <Image
            src={data.image}
            alt={data.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.25) 100%)",
            }}
          />
          <span
            className="absolute top-4 left-4 z-10 text-[10px] uppercase tracking-[0.28em] px-3 py-1 rounded-full"
            style={{
              background: "rgba(15,13,11,0.55)",
              color: "#fbf5ec",
              backdropFilter: "blur(8px)",
            }}
          >
            [ {data.n} ] — Case Study
          </span>
        </div>

        <div className="p-6 md:p-10">
          <h3 className="font-display uppercase tracking-tight leading-[0.95] text-[clamp(34px,6vw,72px)]">
            {data.title}
          </h3>
          <p className="mt-4 text-sm leading-7 text-[color:var(--ink-dim)] max-w-xl">
            {data.summary}
          </p>

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
            {data.tags.map((t, i) => {
              const tones = ["--clay", "--sage", "--sky", "--mustard", "--blush"];
              return (
                <span
                  key={t}
                  className="chip-tone"
                  style={{ ["--tone"]: `var(${tones[i % tones.length]})` }}
                >
                  {t}
                </span>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
