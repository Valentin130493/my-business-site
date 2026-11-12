import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import { ABOUT_PATH, localePath, type SiteLocale } from "@/constants/locales";
import { SECTION_ID_FOUNDER, headingIdOf } from "@/constants/sections";
import { revealProps } from "@/lib/reveal";

import styles from "./Founder.module.scss";

export async function Founder() {
  const t = await getTranslations("founder");
  const locale = (await getLocale()) as SiteLocale;
  const headingId = headingIdOf(SECTION_ID_FOUNDER);

  return (
    <section
      id={SECTION_ID_FOUNDER}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <Container>
        <div className={styles.card} {...revealProps()}>
          <span className={styles.avatar} aria-hidden="true">
            {t("initial")}
          </span>
          <div className={styles.content}>
            <h2 id={headingId} className={styles.heading}>
              {t("heading")}
            </h2>
            <p className={styles.text}>{t("text")}</p>
          </div>
          <a href={localePath(locale, ABOUT_PATH)} className={styles.link}>
            {t("link")} →
          </a>
        </div>
      </Container>
    </section>
  );
}
