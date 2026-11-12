export const AI_AGENTS_MARKET = [
  { year: 2024, billionsUsd: 5.26, isForecast: false },
  { year: 2025, billionsUsd: 7.84, isForecast: false },
  { year: 2030, billionsUsd: 52.62, isForecast: true },
];

export const SMB_AI_USAGE = [
  { id: "growing", percent: 83, isHighlighted: true },
  { id: "all", percent: 75, isHighlighted: false },
  { id: "declining", percent: 55, isHighlighted: false },
] as const;

export const AGENTS_SCALING = [
  { id: "large", previous: 27, current: 40 },
  { id: "smaller", previous: 22, current: 22 },
] as const;

export const AGENTS_SCALING_YEARS = { previous: 2025, current: 2026 };
