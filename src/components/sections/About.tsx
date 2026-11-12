import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import { SECTION_ID_ABOUT, headingIdOf } from "@/constants/sections";
import { revealProps } from "@/lib/reveal";

import { AboutDetails } from "./AboutDetails";
import styles from "./About.module.scss";

type AboutProps = {
  headingLevel?: 1 | 2;
};

export async function About({ headingLevel = 2 }: AboutProps) {
  const t = await getTranslations("about");
  const paragraphs = t.raw("paragraphs") as string[];
  const headingId = headingIdOf(SECTION_ID_ABOUT);
  const Heading = headingLevel === 1 ? "h1" : "h2";

  return (
    <section
      id={SECTION_ID_ABOUT}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <Container>
        <div {...revealProps()}>
          <Heading id={headingId} className={styles.heading}>
            {t("heading")}
          </Heading>
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
