import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import {
  SECTION_ID_CALC,
  SECTION_ID_CONTACT,
  headingIdOf,
} from "@/constants/sections";
import { classNames } from "@/lib/classNames";
import { revealProps } from "@/lib/reveal";

import { CalculatorWidget, type CalculatorLabels } from "./CalculatorWidget";
import styles from "./Calculator.module.scss";
import stylesDark from "./Calculator.dark.module.scss";

export async function Calculator() {
  const t = await getTranslations("calc");
  const locale = await getLocale();
  const headingId = headingIdOf(SECTION_ID_CALC);

  const labels: CalculatorLabels = {
    perDay: t("perDay"),
    offShare: t("offShare"),
    conversion: t("conversion"),
    check: t("check"),
    resultLabel: t("resultLabel"),
    perMonth: t("perMonth"),
    lostClients: t.raw("lostClients") as string,
    chartTitle: t("chartTitle"),
    now: t("now"),
    withBot: t("withBot"),
    note: t("note"),
    cta: t("cta"),
  };

  return (
    <section
      id={SECTION_ID_CALC}
      aria-labelledby={headingId}
      className={classNames(styles.section, stylesDark.section)}
    >
      <Container>
        <div className={styles.intro} {...revealProps()}>
          <h2 id={headingId}>{t("heading")}</h2>
          <p className={styles.lead}>{t("lead")}</p>
        </div>
        <CalculatorWidget
          labels={labels}
          locale={locale}
          ctaHref={`#${SECTION_ID_CONTACT}`}
        />
      </Container>
    </section>
  );
}
