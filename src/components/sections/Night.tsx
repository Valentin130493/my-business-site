import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import { SECTION_ID_NIGHT, headingIdOf } from "@/constants/sections";
import { revealProps } from "@/lib/reveal";

import styles from "./Night.module.scss";

type NightItem = { time: string; text: string };

export async function Night() {
  const t = await getTranslations("night");
  const items = t.raw("items") as NightItem[];
  const headingId = headingIdOf(SECTION_ID_NIGHT);

  return (
    <section
      id={SECTION_ID_NIGHT}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <Container>
        <div {...revealProps()}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h2 id={headingId} className={styles.heading}>
            {t("heading")}
          </h2>
        </div>
        <ol className={styles.grid}>
          {items.map((item, index) => (
            <li key={item.time} className={styles.card} {...revealProps(index)}>
              <time className={styles.time}>{item.time}</time>
              <p className={styles.text}>{item.text}</p>
            </li>
          ))}
        </ol>
        <p className={styles.after} {...revealProps()}>
          {t("after")}
        </p>
      </Container>
    </section>
  );
}
