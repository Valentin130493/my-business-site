const BUBBLE_PATH =
  "M14 20a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H28l-9 8v-8h1a6 6 0 0 1-6-6z";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <rect width="64" height="64" rx="16" style={{ fill: "var(--color-brand-tile)" }} />
      <path d={BUBBLE_PATH} style={{ fill: "var(--color-mint)" }} />
      <circle cx="25" cy="28" r="3" style={{ fill: "var(--color-on-mint)" }} />
      <circle cx="32" cy="28" r="3" style={{ fill: "var(--color-on-mint)" }} />
      <circle cx="39" cy="28" r="3" style={{ fill: "var(--color-on-mint)" }} />
    </svg>
  );
}
