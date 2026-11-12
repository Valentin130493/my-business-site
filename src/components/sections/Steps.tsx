import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import { SECTION_ID_STEPS, headingIdOf } from "@/constants/sections";
import { revealProps } from "@/lib/reveal";

import styles from "./Steps.module.scss";

type Step = { title: string; text: string };

export async function Steps() {
  const t = await getTranslations();
  const items = t.raw("steps.items") as Step[];
  const word = t("word");
  const headingId = headingIdOf(SECTION_ID_STEPS);

  return (
    <section
      id={SECTION_ID_STEPS}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <Container>
        <h2 id={headingId} {...revealProps()}>
          {t("steps.heading")}
        </h2>
        <ol className={styles.list}>
          {items.map((step, index) => (
            <li key={step.title} className={styles.step} {...revealProps(index)}>
              <h3 className={styles.title}>
                {step.title.replace("{word}", word)}
              </h3>
              <p className={styles.text}>{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
