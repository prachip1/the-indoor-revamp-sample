"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import Cursor from "../_components/Cursor";
import Nav from "../_components/Nav";

/**
 * Stacked state: every card sits at x:0 y:0 rotate:0 — perfect overlap,
 * so the deck visually reads as a single card.
 * Thrown state: four symmetric quadrant targets so the cards land in
 * predictable positions a user can comfortably reach to click.
 *
 * Images mirror the four case studies shown on the homepage (CASES in
 * `app/_HomeClient.js`). Order is intentional: card index → case index.
 */
const CARDS = [
  {
    id: 1,
    title: "Lorem Loft",
    image:
      "https://images.unsplash.com/photo-1615873968403-89e068629265?w=1000&q=80&auto=format&fit=crop",
    throw: { x: 380, y: -300, rotate: 12 },
  },
  {
    id: 2,
    title: "Dolor Studio",
    image:
      "https://images.unsplash.com/photo-1512972972907-6d71529c5e92?w=1000&q=80&auto=format&fit=crop",
    throw: { x: -380, y: -300, rotate: -12 },
  },
  {
    id: 3,
    title: "Amet Residence",
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1000&q=80&auto=format&fit=crop",
    throw: { x: -380, y: 300, rotate: 12 },
  },
  {
    id: 4,
    title: "Consectetur Bistro",
    image:
      "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?w=1000&q=80&auto=format&fit=crop",
    throw: { x: 380, y: 300, rotate: -12 },
  },
];

export default function CaseStudiesClient() {
  return (
    <>
      <Cursor />
      <main className="relative px-3 md:px-4 pt-3 md:pt-4 pb-4">
        <div className="card-shell relative">
          <Deck />
        </div>
      </main>
    </>
  );
}

function Deck() {
  const [thrown, setThrown] = useState(false);
  const toggle = () => setThrown((v) => !v);

  return (
    <section className="relative min-h-screen overflow-hidden">
      <Nav />
      {/* Single-cell grid: every card lives in row-start-1 / col-start-1
          and place-items-center centers them. They all share the exact
          same anchor point, so the deck reads as a single card until
          motion's x/y animates each one to its throw target. */}
      <div className="grid place-items-center h-screen">
        {CARDS.map((card, i) => {
          const isTop = i === 0;
          return (
            <motion.button
              key={card.id}
              type="button"
              onClick={toggle}
              aria-label={
                thrown
                  ? "Restack the cards"
                  : isTop
                  ? "Throw the deck"
                  : card.title
              }
              className="row-start-1 col-start-1 relative h-[440px] w-[320px] md:h-[520px] md:w-[380px] rounded-2xl overflow-hidden shadow-[0_30px_60px_-25px_rgba(63,78,79,0.45)] focus:outline-none bg-[color:var(--card-3)]"
              style={{ zIndex: CARDS.length - i }}
              initial={false}
              animate={
                thrown
                  ? { ...card.throw, scale: 1 }
                  : { x: 0, y: 0, rotate: 0, scale: 1 }
              }
              whileHover={
                !thrown && isTop ? { scale: 1.02, y: -4 } : undefined
              }
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 22,
                mass: 0.9,
                // Stagger: when throwing, top card leaves first; when
                // restacking, bottom returns first so the top lands last.
                delay: thrown ? i * 0.05 : (CARDS.length - 1 - i) * 0.04,
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
              {/* Caption strip — only readable once the cards are
                  thrown and visible individually. */}
              <span
                className="absolute bottom-0 inset-x-0 px-5 py-3 text-[11px] uppercase tracking-[0.22em] flex items-center justify-between pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(15,13,11,0.75), transparent)",
                  color: "#fbf5ec",
                }}
              >
                <span>{card.title}</span>
                <span style={{ color: "var(--clay)" }}>
                  {String(card.id).padStart(2, "0")}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
