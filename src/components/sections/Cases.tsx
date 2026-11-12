import { getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import { SECTION_ID_CASES, headingIdOf } from "@/constants/sections";
import { CASE_URLS } from "@/constants/site";
import { revealProps } from "@/lib/reveal";
import type { CaseModule, CaseStudy } from "@/types/content";

import styles from "./Cases.module.scss";

export async function Cases() {
  const t = await getTranslations("cases");
  const items = t.raw("items") as CaseStudy[];
  const headingId = headingIdOf(SECTION_ID_CASES);

  return (
    <section
      id={SECTION_ID_CASES}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <Container>
        <div {...revealProps()}>
          <h2 id={headingId}>{t("heading")}</h2>
          <p className={styles.lead}>{t("lead")}</p>
        </div>
        <ul className={styles.grid}>
          {items.map((item, index) => (
            <li
              key={item.id}
              className={item.modules ? styles.wideItem : undefined}
              {...revealProps(index)}
            >
              <CaseCard item={item} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

async function CaseCard({ item }: { item: CaseStudy }) {
  const t = await getTranslations("cases");
  const headingId = `case-${item.id}`;
  const url = CASE_URLS[item.id];

  return (
    <article
      aria-labelledby={headingId}
      className={`${styles.card} ${item.modules ? styles.wide : ""}`}
    >
      <div className={styles.main}>
        <h3 id={headingId}>{item.title}</h3>
        <dl className={styles.facts}>
          <div>
            <dt>{t("task")}</dt>
            <dd>{item.task}</dd>
          </div>
          <div>
            <dt>{t("solution")}</dt>
            <dd>{item.solution}</dd>
          </div>
          {item.result ? (
            <div>
              <dt>{t("result")}</dt>
              <dd>{item.result}</dd>
            </div>
          ) : null}
        </dl>
        {url ? (
          <a href={url} className={styles.link} target="_blank" rel="noopener">
            {t("link")}
          </a>
        ) : null}
      </div>
      {item.modules ? (
        <ModuleList label={t("modules")} modules={item.modules} />
      ) : null}
    </article>
  );
}

function ModuleList({ label, modules }: { label: string; modules: CaseModule[] }) {
  return (
    <ul className={styles.modules} aria-label={label}>
      {modules.map((module) => (
        <li key={module.title} className={styles.module}>
          <h4 className={styles.moduleTitle}>{module.title}</h4>
          <p>{module.text}</p>
        </li>
      ))}
    </ul>
  );
}
