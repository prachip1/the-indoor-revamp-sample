"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

/**
 * Media tile. Two modes:
 *  • No `image` prop → renders the warm `.media-ph` placeholder gradient
 *    (used everywhere we don't have a real photo yet).
 *  • `image` URL prop → renders the actual image with next/image,
 *    keeping the same caption/chip overlay styling.
 *
 * When `expandable` is true, clicking the tile opens a centered dialog
 * lightbox showing the image at a much larger size. Click the X, click
 * the backdrop, or press Escape to close.
 */
export default function Media({
  label,
  chip,
  image,
  video,
  poster,
  className = "",
  rounded = "rounded-2xl",
  expandable = false,
}) {
  const [open, setOpen] = useState(false);

  const tileChildren = (
    <>
      {video ? (
        <video
          src={video}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
        />
      ) : (
        image && (
          <Image
            src={image}
            alt={label || ""}
            fill
            sizes="(max-width: 768px) 100vw, 60vw"
            className="object-cover"
            priority={false}
          />
        )
      )}
      {chip ? <span className="ph-chip">{chip}</span> : null}
    </>
  );

  // With a real image or video: a plain rounded container (no media-ph
  // pseudo elements painting dots / caption over the media). Without one:
  // keep the warm placeholder gradient.
  const tileClass = image || video
    ? `media-image relative overflow-hidden ${rounded} ${className} bg-[color:var(--card-3)]`
    : `media-ph ${rounded} ${className} relative overflow-hidden`;

  if (!expandable) {
    return (
      <div
        className={tileClass}
        data-label={label || "placeholder"}
        data-cursor="view"
      >
        {tileChildren}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${label || "image"} larger`}
        className={`${tileClass} block w-full text-left cursor-pointer p-0 border-0`}
        data-label={label || "placeholder"}
        data-cursor="view"
      >
        {tileChildren}
      </button>
      <AnimatePresence>
        {open && (
          <MediaLightbox
            label={label}
            chip={chip}
            image={image}
            onClose={() => setOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function MediaLightbox({ label, chip, image, onClose }) {
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

  // Portal into <body> so `position: fixed` is relative to the viewport
  // instead of any ancestor with `transform`/`filter`/`will-change`
  // (e.g. Framer Motion's `scale` on the parent service row, which
  // otherwise becomes the containing block and clips us to its column).
  if (!mounted) return null;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[200]"
      style={{ background: "rgba(15, 13, 11, 0.94)", backdropFilter: "blur(10px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        onClick={onClose}
        data-cursor="close"
        aria-label="Close image"
        className="fixed top-5 right-5 md:top-7 md:right-7 z-[210] inline-flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full text-xl transition-all duration-300 hover:scale-110"
        style={{
          background: "rgba(31, 28, 25, 0.55)",
          color: "#fbf5ec",
          border: "1px solid rgba(251, 245, 236, 0.28)",
          backdropFilter: "blur(8px)",
        }}
      >
        ✕
      </button>

      <motion.div
        className="absolute inset-0 flex items-center justify-center p-4 md:p-10"
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {image ? (
          <Image
            src={image}
            alt={label || ""}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
        ) : (
          <div
            className="media-ph w-full h-full"
            data-label={label || "placeholder"}
          >
            {chip ? <span className="ph-chip">{chip}</span> : null}
          </div>
        )}
      </motion.div>

      {label && (
        <div
          className="fixed bottom-0 inset-x-0 px-6 md:px-10 py-5 text-xs uppercase tracking-[0.22em] flex items-center justify-between z-[205] pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(15,13,11,0.85), transparent)",
            color: "#fbf5ec",
          }}
        >
          <span>{label}</span>
          {chip && <span style={{ color: "var(--clay)" }}>{chip}</span>}
        </div>
      )}
    </motion.div>,
    document.body
  );
}
