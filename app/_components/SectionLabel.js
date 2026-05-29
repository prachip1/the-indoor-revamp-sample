/**
 * Eyebrow label used at the top of every page section.
 * Example: `<SectionLabel num="01">About</SectionLabel>`
 * Renders: ● [ 01 ] — About
 *   with a slate dot and slate-colored brackets/number for brand color rhythm.
 */
export default function SectionLabel({ num, children, className = "" }) {
  return (
    <p
      className={`text-xs uppercase tracking-[0.32em] text-[color:var(--ink-dim)] mb-6 inline-flex items-center gap-3 ${className}`}
    >
      <span
        aria-hidden
        className="inline-block h-[7px] w-[7px] rounded-full bg-[color:var(--cta)]"
      />
      <span>
        <span className="text-[color:var(--cta)]">[ {num} ]</span>
        <span className="opacity-60"> — </span>
        {children}
      </span>
    </p>
  );
}
