import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import { SECTION_ID_TREND, headingIdOf } from "@/constants/sections";
import { TREND_SOURCE_URLS } from "@/constants/site";
import { revealProps } from "@/lib/reveal";
import type { TrendStat, TrendStep } from "@/types/content";

import styles from "./Trend.module.scss";

export async function Trend() {
  const t = await getTranslations("trend");
  const headingId = headingIdOf(SECTION_ID_TREND);

  return (
    <section
      id={SECTION_ID_TREND}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <Container>
        <div {...revealProps()}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h2 id={headingId} className={styles.heading}>
            {t("heading")}
          </h2>
          <p className={styles.lead}>{t("lead")}</p>
        </div>
        <StatList label={t("statsLabel")} stats={t.raw("stats") as TrendStat[]} />
        <h3 className={styles.timelineTitle}>{t("timelineLabel")}</h3>
        <Timeline
          steps={t.raw("timeline") as TrendStep[]}
          forecastLabel={t("forecast")}
        />
      </Container>
    </section>
  );
}

function SourceLink({ id, label }: { id: string; label: string }) {
  const url = TREND_SOURCE_URLS[id];
  if (!url) return label;

  return (
    <a href={url} className={styles.sourceLink} target="_blank" rel="noopener">
      {label}
    </a>
  );
}

function StatList({ label, stats }: { label: string; stats: TrendStat[] }) {
  return (
    <ul className={styles.stats} aria-label={label}>
      {stats.map((stat, index) => (
        <li key={stat.id} className={styles.stat} {...revealProps(index)}>
          <p className={styles.value}>{stat.value}</p>
          <p className={styles.statText}>{stat.text}</p>
          <p className={styles.statSource}>
            <SourceLink id={stat.id} label={stat.source} />
          </p>
        </li>
      ))}
    </ul>
  );
}

function Timeline({
  steps,
  forecastLabel,
}: {
  steps: TrendStep[];
  forecastLabel: string;
}) {
  return (
    <ol className={styles.timeline}>
      {steps.map((step, index) => (
        <li
          key={step.id}
          className={`${styles.step} ${step.isForecast ? styles.forecast : ""}`}
          {...revealProps(index)}
        >
          <p className={styles.period}>
            {step.period}
            {step.isForecast ? (
              <span className={styles.badge}>{forecastLabel}</span>
            ) : null}
          </p>
          <p className={styles.stepText}>{step.text}</p>
          {step.source ? (
            <p className={styles.stepSource}>
              <SourceLink id={step.id} label={step.source} />
            </p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
