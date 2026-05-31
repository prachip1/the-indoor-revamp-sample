"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import Cursor from "../_components/Cursor";
import Nav from "../_components/Nav";
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
        <motion.div
          className="card-shell relative"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <Nav />
          <DeckSection />
        </motion.div>
      </main>
    </>
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
    restackX: 0,
    restackY: 0,
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
      const cardW = isMobile ? 280 : 440;
      const cardH = isMobile ? 380 : 600;
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
      // Section-space position of the first (leftmost) card so the
      // Restack pill can sit just above it. Card centres land at
      // (width/2 + p.x, height/2 + p.y); its top edge is half a
      // scaled card-height above that centre.
      const firstP = positions[0];
      const restackX = rowCx + firstP.x;
      const restackY = rowCy + firstP.y - (cardH * scale) / 2;
      setLayout({ throws, thrownScale: scale, restackX, restackY });
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
      className="relative min-h-[110svh] overflow-hidden flex items-center py-16 md:py-24"
    >
      <div className="w-full flex flex-row items-center justify-between gap-8 section-pad">
        {/* LEFT — written content. Fades and slides away once the deck
            is spread so the cards have the full width to open into. */}
        <motion.div
          className="relative w-[38%] shrink-0"
          initial={false}
          animate={
            thrown
              ? { opacity: 0, x: -40, pointerEvents: "none" }
              : { opacity: 1, x: 0, pointerEvents: "auto" }
          }
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden={thrown}
        >
          <h2 className="font-display text-[clamp(48px,7vw,104px)] leading-[0.98] tracking-tight">
            Four rooms,{" "}
            <span className="font-swash italic font-light">reshaped</span>.
          </h2>
          <p className="mt-6 text-sm leading-7 text-[color:var(--ink-dim)]">
            Each project began as a room that didn&rsquo;t quite work and
            ended as one that does. We handled every step — layout, light,
            material and finish — until the space felt unmistakably lived in.
          </p>
          <p className="mt-4 text-sm leading-7 text-[color:var(--ink-dim)]">
            The deck to the right holds our selected studies. Spread it open,
            then step inside any card to see the before, the thinking, and
            the after.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[color:var(--cta)]">
            <span aria-hidden>→</span> Click the deck to begin
          </div>
        </motion.div>

        {/* RIGHT — the deck. Its size is one card so we can measure its
            bounding box and translate cards from there. */}
        <div className="relative shrink-0 md:mr-[9%]">
        <div
          ref={deckRef}
          className="relative h-[380px] w-[280px] md:h-[600px] md:w-[440px]"
        >
          {CASES.map((card, i) => {
            const isTop = i === 0;
            const target = layout.throws[i] || { x: 0, y: 0 };
            // Stacked (un-thrown) offsets: each deeper card peeks out
            // down-right a few px, slightly rotated and scaled down, so
            // the pile clearly reads as a multi-card deck with depth.
            const stack = {
              x: i * 5,
              y: i * 7,
              rotate: i * 1.4,
              scale: 1 - i * 0.02,
            };
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
                className="absolute top-0 left-0 h-[380px] w-[280px] md:h-[600px] md:w-[440px] rounded-2xl overflow-hidden shadow-[0_4px_12px_-2px_rgba(31,28,25,0.28),0_30px_60px_-25px_rgba(63,78,79,0.45)] ring-1 ring-black/5 focus:outline-none bg-[color:var(--card-3)]"
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
                    : stack
                }
                whileHover={
                  thrown
                    ? { scale: layout.thrownScale * 1.04, y: target.y - 6 }
                    : isTop
                    ? { scale: 1.05, y: -10, rotate: 0 }
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
                  sizes="(max-width: 768px) 300px, 460px"
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
      </div>

      {/* Restack pill — only while thrown and modal isn't open. Sits just
          above the first (leftmost) card. Positioning lives on the wrapper
          (inline transform) so the motion fade doesn't override it. */}
      <AnimatePresence>
        {thrown && !selected && (
          <motion.div
            className="absolute z-30"
            style={{
              left: layout.restackX,
              top: layout.restackY,
              transform: "translate(-50%, calc(-100% - 8px))",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              onClick={() => setThrown(false)}
              data-cursor="none"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.22em]"
              style={{
                background: "rgba(255,255,255,0.7)",
                color: "var(--cta)",
                border: "1px solid var(--line)",
                backdropFilter: "blur(8px)",
              }}
            >
              <span aria-hidden>↺</span> Restack
            </button>
          </motion.div>
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

  const tones = ["--clay", "--sage", "--sky", "--mustard", "--blush"];
  const hidden = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  };

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-8"
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
      {/* Wrapper handles the entrance (scale/opacity) and holds the 3D
          perspective; the inner element does the actual Y-flip from the
          card image (front) to the wide info panel (back). */}
      <motion.div
        className="relative w-[min(980px,94vw)] h-[min(600px,86vh)]"
        style={{ perspective: 2000 }}
        initial={{ opacity: 0, scale: 0.9, y: 28 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 18 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 180 }}
          exit={{ rotateY: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* FRONT — the card image, mirroring the one that was clicked */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-[0_40px_90px_-40px_rgba(15,13,11,0.7)]"
            style={{ ...hidden, border: "1px solid var(--line)" }}
          >
            <Image
              src={data.image}
              alt={data.title}
              fill
              sizes="(max-width: 768px) 94vw, 980px"
              className="object-cover"
              priority
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.72) 100%)",
              }}
            />
            <span
              className="absolute top-5 left-5 text-[10px] uppercase tracking-[0.28em] px-3 py-1 rounded-full"
              style={{
                background: "rgba(15,13,11,0.55)",
                color: "#fbf5ec",
                backdropFilter: "blur(8px)",
              }}
            >
              [ {data.n} ] — Case Study
            </span>
            <div className="absolute bottom-0 inset-x-0 p-6 md:p-9">
              <h3
                className="font-display uppercase tracking-tight leading-[0.95] text-[clamp(30px,5vw,60px)]"
                style={{ color: "#fbf5ec" }}
              >
                {data.title}
              </h3>
              <p
                className="mt-2 text-[11px] uppercase tracking-[0.24em]"
                style={{ color: "#efe1c9" }}
              >
                {data.type} · {data.year}
              </p>
            </div>
          </div>

          {/* BACK — wide info panel revealed by the flip */}
          <div
            className="absolute inset-0 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_40px_90px_-40px_rgba(15,13,11,0.7)]"
            style={{
              ...hidden,
              transform: "rotateY(180deg)",
              background: "var(--card)",
              border: "1px solid var(--line)",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              data-cursor="close"
              aria-label="Close case"
              className="absolute top-4 right-4 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full text-lg transition-colors duration-300"
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

            <div className="relative w-full md:w-[42%] h-[30%] md:h-full shrink-0">
              <Image
                src={data.image}
                alt={data.title}
                fill
                sizes="(max-width: 768px) 94vw, 420px"
                className="object-cover"
              />
            </div>

            <div className="relative w-full md:w-[58%] h-full overflow-y-auto scrollbar-none p-6 md:p-9">
              <span className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--ink-dim)]">
                [ {data.n} ] — Case Study
              </span>
              <h3 className="mt-3 font-display uppercase tracking-tight leading-[0.95] text-[clamp(28px,4vw,52px)]">
                {data.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[color:var(--ink-dim)]">
                {data.summary}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-4 border-y border-[color:var(--line)] py-4 text-xs uppercase tracking-[0.16em] text-[color:var(--ink-dim)]">
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

              <div className="mt-5 space-y-4 text-sm leading-7 text-[color:var(--ink-dim)]">
                {data.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2.5">
                {data.tags.map((t, i) => (
                  <span
                    key={t}
                    className="chip-tone"
                    style={{ ["--tone"]: `var(${tones[i % tones.length]})` }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
