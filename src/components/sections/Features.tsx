import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import { SECTION_ID_FEATURES, headingIdOf } from "@/constants/sections";
import { revealProps } from "@/lib/reveal";
import type { BotType } from "@/types/content";

import styles from "./Features.module.scss";

export async function Features() {
  const t = await getTranslations("features");
  const items = t.raw("items") as BotType[];
  const base = t.raw("base") as string[];
  const headingId = headingIdOf(SECTION_ID_FEATURES);

  return (
    <section
      id={SECTION_ID_FEATURES}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <Container>
        <div {...revealProps()}>
          <h2 id={headingId} className={styles.heading}>
            {t("heading")}
          </h2>
          <p className={styles.lead}>{t("lead")}</p>
        </div>
        <ul className={styles.grid}>
          {items.map((item, index) => (
            <li key={item.id} className={styles.card} {...revealProps(index)}>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.text}>{item.text}</p>
              <p className={styles.example}>
                <span className={styles.exampleLabel}>{t("exampleLabel")}</span>
                {item.example}
              </p>
            </li>
          ))}
        </ul>
        <div className={styles.base} {...revealProps()}>
          <h3 className={styles.baseTitle}>{t("baseLabel")}</h3>
          <ul className={styles.baseList}>
            {base.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
