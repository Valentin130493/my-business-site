import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import { SECTION_ID_ABOUT, headingIdOf } from "@/constants/sections";
import { revealProps } from "@/lib/reveal";

import { AboutDetails } from "./AboutDetails";
import styles from "./About.module.scss";

export async function About() {
  const t = await getTranslations("about");
  const paragraphs = t.raw("paragraphs") as string[];
  const headingId = headingIdOf(SECTION_ID_ABOUT);

  return (
    <section
      id={SECTION_ID_ABOUT}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <Container>
        <div {...revealProps()}>
          <h2 id={headingId} className={styles.heading}>
            {t("heading")}
          </h2>
          <p className={styles.role}>{t("tagline")}</p>
          <div className={styles.text}>
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <AboutDetails />
      </Container>
    </section>
  );
}
