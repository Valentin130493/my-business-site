import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import { SECTION_ID_FAQ, headingIdOf } from "@/constants/sections";
import { revealProps } from "@/lib/reveal";
import type { FaqItem } from "@/types/content";

import styles from "./Faq.module.scss";

export async function Faq() {
  const t = await getTranslations("faq");
  const items = t.raw("items") as FaqItem[];
  const headingId = headingIdOf(SECTION_ID_FAQ);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <section
      id={SECTION_ID_FAQ}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Container>
        <h2 id={headingId} {...revealProps()}>
          {t("heading")}
        </h2>
        <div className={styles.list} {...revealProps(1)}>
          {items.map((item) => (
            <details key={item.question} className={styles.item}>
              <summary className={styles.question}>{item.question}</summary>
              <p className={styles.answer}>{item.answer}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
