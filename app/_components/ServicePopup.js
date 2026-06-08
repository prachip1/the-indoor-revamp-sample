"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import Magnetic from "./Magnetic";

// Shared gallery — the real per-service photography doesn't exist yet,
// so each popup carousel cycles through the same placeholder pool the
// rest of the site already draws on (service rows, founder note, cases).
export const SERVICE_GALLERY = [
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605884636476-ec4bd6c8d958?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1615873968403-89e068629265?w=1600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1600&q=80&auto=format&fit=crop",
];

/* ── Service detail popup ─────────────────────────────────────
   Title + description on the left with a "Book Call" CTA, an
   image carousel on the right. Portaled to <body> so it isn't
   clipped by the scaling/transformed service rows behind it.
   Shared between the homepage Services section and the Services
   page so both open the exact same dialog. */
export default function ServicePopup({ data, onClose }) {
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
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-8"
      style={{ background: "rgba(15, 13, 11, 0.7)", backdropFilter: "blur(10px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${data.title} — service details`}
    >
      <motion.div
        className="relative w-[min(1080px,96vw)] max-h-[90vh] rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_40px_90px_-40px_rgba(15,13,11,0.7)]"
        style={{ background: "var(--card)", border: "1px solid var(--line)" }}
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          data-cursor="close"
          aria-label="Close"
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

        {/* LEFT — title, description, Book Call CTA */}
        <div className="relative w-full md:w-[42%] shrink-0 p-8 md:p-12 flex flex-col justify-center gap-6 order-2 md:order-1">
          <span
            className="text-xs uppercase tracking-[0.28em] tabular-nums"
            style={{ color: `var(${data.tone || "--cta"})` }}
          >
            [ {data.n} ] — Service
          </span>
          <h3 className="font-display uppercase tracking-tight leading-[0.95] text-[clamp(36px,5vw,68px)] text-balance">
            {data.title}
          </h3>
          <p className="text-sm leading-7 text-[color:var(--ink-dim)] max-w-sm">
            {data.detail || data.desc}
          </p>
          <div>
            <Magnetic strength={16}>
              <Link
                href="/#contact"
                onClick={onClose}
                data-cursor="none"
                className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-xs uppercase tracking-[0.22em] transition-colors duration-300"
                style={{ background: "var(--cta)", color: "#fbf5ec" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cta-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--cta)")}
              >
                Book Call
                <span aria-hidden>↗</span>
              </Link>
            </Magnetic>
          </div>
        </div>

        {/* RIGHT — image carousel */}
        <div className="relative w-full md:w-[58%] h-[42vh] md:h-[78vh] order-1 md:order-2">
          <ServiceCarousel images={SERVICE_GALLERY} label={data.title} />
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function ServiceCarousel({ images, label }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (dir) => {
    setDirection(dir);
    setIndex((i) => (i + dir + images.length) % images.length);
  };

  useEffect(() => {
    const id = setInterval(() => go(1), 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[color:var(--card-3)]">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={index}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 60 : -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -60 : 60 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={images[index]}
            alt={`${label} — image ${index + 1} of ${images.length}`}
            fill
            sizes="(max-width: 768px) 96vw, 58vw"
            className="object-cover"
            priority={index === 0}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.4) 100%)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Prev / next */}
      <button
        type="button"
        onClick={() => go(-1)}
        data-cursor="none"
        aria-label="Previous image"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-lg transition-colors duration-300"
        style={{ background: "rgba(15,13,11,0.45)", color: "#fbf5ec", backdropFilter: "blur(8px)" }}
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        data-cursor="none"
        aria-label="Next image"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full text-lg transition-colors duration-300"
        style={{ background: "rgba(15,13,11,0.45)", color: "#fbf5ec", backdropFilter: "blur(8px)" }}
      >
        →
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-2.5 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              setIndex(i);
            }}
            aria-label={`Go to image ${i + 1}`}
            className="h-[7px] rounded-full transition-all duration-300"
            style={{
              width: i === index ? 22 : 7,
              background: i === index ? "#fbf5ec" : "rgba(251,245,236,0.45)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
