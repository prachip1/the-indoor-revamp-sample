"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Site-wide custom cursor. Renders a small slate disc that follows the
 * pointer, scales up into a solid 52 px click circle over links/buttons,
 * and expands into a 96 px text bubble over elements with `data-cursor="…"`.
 *
 * Opt-outs:
 *  • `data-cursor="none"` on an element hides the custom disc entirely and
 *    lets the native pointer cursor show (handled in globals.css).
 *  • `[data-spotlight]` ancestors hide the small default disc so the hero's
 *    slate glow can act as the cursor inside that zone.
 */
export default function Cursor() {
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
        if (label === "none") setState({ mode: "none", label: "" });
        else if (label) setState({ mode: "label", label });
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

  const size = state.mode === "label" ? 96 : state.mode === "link" ? 52 : 14;
  const showDisc =
    !hidden &&
    state.mode !== "none" &&
    !(overSpotlight && state.mode === "default");

  return (
    <motion.div
      style={{ x: sx, y: sy, opacity: showDisc ? 1 : 0 }}
      className="cursor-follower"
    >
      <motion.div
        animate={{ width: size, height: size }}
        transition={{ type: "spring", stiffness: 250, damping: 24 }}
        className={`cursor-disc ${state.mode}`}
        data-cursor-label={state.label || undefined}
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
