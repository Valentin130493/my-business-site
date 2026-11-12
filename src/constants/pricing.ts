export const PRICE_CURRENCY = "EUR";

export type PlanId = "start" | "startPlus" | "standard" | "vip";

export type PlanPrice = {
  amount: number;
  isFrom: boolean;
  monthlyAmount?: number;
};

export const PLAN_PRICES: Record<PlanId, PlanPrice> = {
  start: { amount: 100, isFrom: false },
  startPlus: { amount: 200, isFrom: false },
  standard: { amount: 600, isFrom: true },
  vip: { amount: 1200, isFrom: true, monthlyAmount: 150 },
};

export const FEATURED_PLAN_ID: PlanId = "standard";

export function formatPrice(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: PRICE_CURRENCY,
    // без narrowSymbol uk показывает «1 200 EUR» вместо «1 200 €»
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(amount);
}
