import { getTranslations } from "next-intl/server";

import {
  AGENTS_SCALING,
  AGENTS_SCALING_YEARS,
  AI_AGENTS_MARKET,
  SMB_AI_USAGE,
} from "@/constants/marketData";

import { TrendSourceLink } from "./TrendSourceLink";
import styles from "./Trend.module.scss";

const MARKET_PLOT_MAX = 60;
const MARKET_GRID_STEPS = [0, 20, 40, 60];

export async function MarketChart({ locale }: { locale: string }) {
  const t = await getTranslations("trend.market");
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  return (
    <figure className={styles.chart}>
      <figcaption className={styles.chartCaption}>
        <span className={styles.chartTitle}>{t("title")}</span>
        <span className={styles.chartUnit}>{t("unit")}</span>
      </figcaption>
      <div className={styles.plot} aria-hidden="true">
        {MARKET_GRID_STEPS.map((step) => (
          <div
            key={step}
            className={styles.gridLine}
            style={{ bottom: `${(step / MARKET_PLOT_MAX) * 100}%` }}
          >
            <span>{step}</span>
          </div>
        ))}
        <div className={styles.columns}>
          {AI_AGENTS_MARKET.map((point) => (
            <div key={point.year} className={styles.column}>
              <div
                className={`${styles.columnBar} ${point.isForecast ? styles.highlight : ""}`}
                style={{ height: `${(point.billionsUsd / MARKET_PLOT_MAX) * 100}%` }}
              >
                <span className={styles.columnValue}>{number.format(point.billionsUsd)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.columnLabels} aria-hidden="true">
        {AI_AGENTS_MARKET.map((point) => (
          <span key={point.year}>
            {point.year}
            {point.isForecast ? <em className={styles.forecastMark}>{t("forecast")}</em> : null}
          </span>
        ))}
      </div>
      <div className="sr-only">
        <table>
          <caption>
            {t("title")}, {t("unit")}
          </caption>
          <tbody>
            {AI_AGENTS_MARKET.map((point) => (
              <tr key={point.year}>
                <th scope="row">
                  {point.year}
                  {point.isForecast ? ` (${t("forecast")})` : ""}
                </th>
                <td>{number.format(point.billionsUsd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.source}>
        <TrendSourceLink id="market" label={t("source")} />
      </p>
    </figure>
  );
}

export async function SmbChart() {
  const t = await getTranslations("trend.smb");

  return (
    <figure className={styles.chart}>
      <figcaption className={styles.chartCaption}>
        <span className={styles.chartTitle}>{t("title")}</span>
      </figcaption>
      <ul className={styles.bars} aria-hidden="true">
        {SMB_AI_USAGE.map((row) => (
          <li key={row.id} className={styles.barRow}>
            <span className={styles.barLabel}>{t(row.id)}</span>
            <div className={styles.barArea}>
              <div
                className={`${styles.bar} ${row.isHighlighted ? styles.highlight : ""}`}
                style={{ width: `${row.percent}%` }}
              >
                <span className={styles.barValue}>{row.percent}%</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="sr-only">
        <table>
          <caption>{t("title")}</caption>
          <tbody>
            {SMB_AI_USAGE.map((row) => (
              <tr key={row.id}>
                <th scope="row">{t(row.id)}</th>
                <td>{row.percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.source}>
        <TrendSourceLink id="smb" label={t("source")} />
      </p>
    </figure>
  );
}

export async function AgentsChart() {
  const t = await getTranslations("trend.agents");
  const { previous, current } = AGENTS_SCALING_YEARS;

  return (
    <figure className={styles.chart}>
      <figcaption className={styles.chartCaption}>
        <span className={styles.chartTitle}>{t("title")}</span>
      </figcaption>
      <ul className={styles.legend} aria-hidden="true">
        <li>
          <span className={styles.swatch} />
          {previous}
        </li>
        <li>
          <span className={`${styles.swatch} ${styles.highlight}`} />
          {current}
        </li>
      </ul>
      <ul className={styles.bars} aria-hidden="true">
        {AGENTS_SCALING.map((group) => (
          <li key={group.id} className={styles.barRow}>
            <span className={styles.barLabel}>{t(group.id)}</span>
            <div className={styles.barPair}>
              <div className={styles.barArea}>
                <div className={styles.bar} style={{ width: `${group.previous}%` }}>
                  <span className={styles.barValue}>{group.previous}%</span>
                </div>
              </div>
              <div className={styles.barArea}>
                <div
                  className={`${styles.bar} ${styles.highlight}`}
                  style={{ width: `${group.current}%` }}
                >
                  <span className={styles.barValue}>{group.current}%</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="sr-only">
        <table>
          <caption>{t("title")}</caption>
          <thead>
            <tr>
              <th scope="col" />
              <th scope="col">{previous}</th>
              <th scope="col">{current}</th>
            </tr>
          </thead>
          <tbody>
            {AGENTS_SCALING.map((group) => (
              <tr key={group.id}>
                <th scope="row">{t(group.id)}</th>
                <td>{group.previous}%</td>
                <td>{group.current}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.source}>
        <TrendSourceLink id="agents" label={t("source")} />
      </p>
    </figure>
  );
}
