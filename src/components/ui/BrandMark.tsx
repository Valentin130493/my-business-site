const GRADIENT_ID = "brand-mark-gradient";
const BUBBLE_PATH =
  "M14 20a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H28l-9 8v-8h1a6 6 0 0 1-6-6z";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-mint)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-butter)" }} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${GRADIENT_ID})`} />
      <path d={BUBBLE_PATH} style={{ fill: "var(--color-ink)" }} />
      <circle cx="25" cy="28" r="3" style={{ fill: "var(--color-mint)" }} />
      <circle cx="32" cy="28" r="3" style={{ fill: "var(--color-mint)" }} />
      <circle cx="39" cy="28" r="3" style={{ fill: "var(--color-butter)" }} />
    </svg>
  );
}
