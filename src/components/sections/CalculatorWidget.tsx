"use client";

import { useState, type CSSProperties } from "react";

import { ButtonLink } from "@/components/ui/ButtonLink";
import { RangeInput } from "@/components/ui/RangeInput";
import { currencySymbol, formatPrice } from "@/constants/pricing";
import { classNames } from "@/lib/classNames";

import styles from "./Calculator.module.scss";
import styles3d from "./Calculator.3d.module.scss";
import stylesDark from "./Calculator.dark.module.scss";
import { PressureGauge } from "./PressureGauge";

const DAYS_IN_MONTH = 30;
const PERCENT = 100;

type FieldKey = "perDay" | "offShare" | "conversion" | "check";
type FieldValues = Record<FieldKey, number>;

const DEFAULT_VALUES: FieldValues = { perDay: 20, offShare: 30, conversion: 20, check: 40 };

const FIELD_RANGES: Record<FieldKey, { min: number; max: number; step: number }> = {
  perDay: { min: 1, max: 100, step: 1 },
  offShare: { min: 0, max: 80, step: 5 },
  conversion: { min: 1, max: 60, step: 1 },
  check: { min: 10, max: 500, step: 5 },
};

const FIELD_ORDER: FieldKey[] = ["perDay", "offShare", "conversion", "check"];

export type CalculatorLabels = Record<FieldKey, string> & {
  resultLabel: string;
  perMonth: string;
  lostClients: string;
  chartTitle: string;
  now: string;
  withBot: string;
  note: string;
  cta: string;
};

type CalculatorWidgetProps = {
  labels: CalculatorLabels;
  locale: string;
  ctaHref: string;
};

function fillPercent(key: FieldKey, value: number): number {
  const { min, max } = FIELD_RANGES[key];
  return ((value - min) / (max - min)) * PERCENT;
}

function estimate({ perDay, offShare, conversion, check }: FieldValues) {
  const monthlyMessages = perDay * DAYS_IN_MONTH;
  const unansweredMessages = (monthlyMessages * offShare) / PERCENT;
  const lostClients = Math.round((unansweredMessages * conversion) / PERCENT);
  const lostRevenue = Math.round(((unansweredMessages * conversion) / PERCENT) * check);
  const botRevenue = Math.round(((monthlyMessages * conversion) / PERCENT) * check);
  return { lostClients, lostRevenue, botRevenue, nowRevenue: botRevenue - lostRevenue };
}

export function CalculatorWidget({ labels, locale, ctaHref }: CalculatorWidgetProps) {
  const [values, setValues] = useState(DEFAULT_VALUES);
  const result = estimate(values);
  const nowShare = result.botRevenue > 0 ? (result.nowRevenue / result.botRevenue) * PERCENT : 0;

  function displayValue(key: FieldKey): string {
    if (key === "check") return formatPrice(values.check, locale);
    if (key === "perDay") return String(values.perDay);
    return `${values[key]}%`;
  }

  function handleChange(key: FieldKey) {
    return (value: number) => setValues((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className={styles.widget}>
      <div className={styles.fields}>
        {FIELD_ORDER.map((key) => (
          <label key={key} className={styles.field}>
            <span className={styles.fieldHead}>
              <span>{labels[key]}</span>
              <output className={styles.fieldValue}>{displayValue(key)}</output>
            </span>
            <RangeInput
              className={styles.range}
              style={{ "--fill": `${fillPercent(key, values[key])}%` } as CSSProperties}
              min={FIELD_RANGES[key].min}
              max={FIELD_RANGES[key].max}
              step={FIELD_RANGES[key].step}
              value={values[key]}
              onValueChange={handleChange(key)}
            />
          </label>
        ))}
      </div>

      <div className={classNames(styles.result, stylesDark.result)} aria-live="polite">
        <PressureGauge
          value={result.lostRevenue}
          locale={locale}
          unit={`${currencySymbol(locale)} · ${labels.perMonth}`}
          className={classNames(styles.gauge, styles3d.gauge)}
        />
        <p className={styles.resultLabel}>{labels.resultLabel}</p>
        <p className={styles.resultValue}>
          {formatPrice(result.lostRevenue, locale)} <span>{labels.perMonth}</span>
        </p>
        <p className={styles.resultNote}>
          {labels.lostClients.replace("{count}", String(result.lostClients))}
        </p>

        <figure className={styles.chart}>
          <figcaption className={styles.chartTitle}>{labels.chartTitle}</figcaption>
          <div className={styles.barRow}>
            <span className={styles.barLabel}>{labels.now}</span>
            <div className={styles.barArea}>
              <div className={styles.bar} style={{ width: `${nowShare}%` }}>
                <span className={styles.barValue}>{formatPrice(result.nowRevenue, locale)}</span>
              </div>
            </div>
          </div>
          <div className={styles.barRow}>
            <span className={styles.barLabel}>{labels.withBot}</span>
            <div className={styles.barArea}>
              <div className={`${styles.bar} ${styles.barAccent}`} style={{ width: "100%" }}>
                <span className={styles.barValue}>{formatPrice(result.botRevenue, locale)}</span>
              </div>
            </div>
          </div>
        </figure>

        <ButtonLink href={ctaHref} className={styles.cta}>
          {labels.cta}
        </ButtonLink>
        <p className={styles.disclaimer}>{labels.note}</p>
      </div>
    </div>
  );
}
