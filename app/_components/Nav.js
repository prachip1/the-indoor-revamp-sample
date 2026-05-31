"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Public site top navigation.
 *
 * Rendered inside each page's hero with `position: absolute; top: 0`. Padding
 * is intentionally tight (py-4/5) — the big `.section-pad` vertical inset is
 * meant for page sections, not a header. Active route is underlined.
 */
export default function Nav({ tone = "dark" }) {
  const pathname = usePathname() || "/";
  const light = tone === "light";
  // On dark backgrounds (e.g. the photo hero) links render cream; the
  // hover underline uses currentColor so it follows automatically.
  const linkStyle = light ? { color: "#f3e8d8" } : undefined;

  const middleLinks = [
    { l: "About", h: "/about" },
    { l: "Services", h: "/services" },
    { l: "FAQ", h: "/faq" },
  ];
  const rightLinks = [
    { l: "Cases", h: "/case-studies" },
    { l: "Contact Us", h: "/#contact" },
  ];

  // A link is "active" when its base path matches the current route
  // (ignore in-page hashes like /#faq so they don't claim activity on /).
  const isActive = (href) => {
    if (href.includes("#")) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const linkCls = (href) =>
    `nav-link hover-underline ${
      isActive(href) ? "underline underline-offset-4" : ""
    }`;

  return (
    <nav className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between gap-6 px-[clamp(20px,5vw,80px)] py-4 md:py-5">
      <Link
        href="/"
        aria-label="The Indoor Revamp — home"
        className="inline-flex items-center shrink-0"
      >
        <Image
          src="/logo-mark.png"
          alt="The Indoor Revamp"
          width={500}
          height={500}
          priority
          className={`h-20 w-20 md:h-28 md:w-28 object-contain ${
            light ? "drop-shadow-[0_2px_14px_rgba(0,0,0,0.6)]" : ""
          }`}
        />
      </Link>

      <div className="hidden md:flex items-center gap-10">
        {middleLinks.map((x) => (
          <Link key={x.l} className={linkCls(x.h)} href={x.h} style={linkStyle}>
            {x.l}
          </Link>
        ))}
      </div>

      <div className="hidden md:flex items-center gap-10">
        {rightLinks.map((x) => (
          <Link key={x.l} className={linkCls(x.h)} href={x.h} style={linkStyle}>
            {x.l}
          </Link>
        ))}
      </div>
    </nav>
  );
}
