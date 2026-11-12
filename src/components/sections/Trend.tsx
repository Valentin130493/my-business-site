import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import { SECTION_ID_TREND, headingIdOf } from "@/constants/sections";
import { revealProps } from "@/lib/reveal";
import type { TrendStep, TrendTile } from "@/types/content";

import { AgentsChart, MarketChart, SmbChart } from "./TrendCharts";
import { TrendSourceLink as SourceLink } from "./TrendSourceLink";
import styles from "./Trend.module.scss";

export async function Trend() {
  const t = await getTranslations("trend");
  const locale = await getLocale();
  const headingId = headingIdOf(SECTION_ID_TREND);
  const tiles = t.raw("tiles") as TrendTile[];

  return (
    <section
      id={SECTION_ID_TREND}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <Container>
        <div className={styles.intro} {...revealProps()}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h2 id={headingId} className={styles.heading}>
            {t("heading")}
          </h2>
          <p className={styles.lead}>{t("lead")}</p>
        </div>

        <div className={styles.row}>
          <div className={styles.wide} {...revealProps(0)}>
            <MarketChart locale={locale} />
          </div>
          <div className={styles.tiles}>
            {tiles.map((tile, index) => (
              <div key={tile.id} className={styles.tile} {...revealProps(index + 1)}>
                <p className={styles.tileValue}>{tile.value}</p>
                <p className={styles.tileText}>{tile.text}</p>
                <p className={styles.source}>
                  <SourceLink id={tile.id} label={tile.source} />
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.half} {...revealProps(0)}>
            <SmbChart />
          </div>
          <div className={styles.half} {...revealProps(1)}>
            <AgentsChart />
          </div>
        </div>

        <h3 className={styles.timelineTitle}>{t("timelineLabel")}</h3>
        <Timeline steps={t.raw("timeline") as TrendStep[]} forecastLabel={t("forecast")} />
      </Container>
    </section>
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
