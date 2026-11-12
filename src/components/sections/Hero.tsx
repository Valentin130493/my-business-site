import { getTranslations } from "next-intl/server";

import { buttonClassName } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ContactMenu } from "@/components/ui/ContactMenu";
import { Container } from "@/components/ui/Container";
import { CONTACT_OPTIONS } from "@/constants/contacts";
import {
  SECTION_ID_HERO,
  SECTION_ID_PLANS,
  headingIdOf,
} from "@/constants/sections";

import { ChatDemo, type ChatMessage } from "./ChatDemo";
import styles from "./Hero.module.scss";

export async function Hero() {
  const t = await getTranslations();
  const word = t("word");
  const facts = t.raw("hero.facts") as string[];
  const headingId = headingIdOf(SECTION_ID_HERO);

  return (
    <section
      id={SECTION_ID_HERO}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <Container className={styles.grid}>
        <div>
          <h1 id={headingId} className={styles.title}>
            {t("hero.title")}
          </h1>
          <p className={styles.lead}>{t("hero.lead")}</p>
          <div className={styles.buttons}>
            <ContactMenu
              label={t("hero.ctaPrimary")}
              caption={t("nav.chooseChannel")}
              options={CONTACT_OPTIONS}
              triggerClassName={buttonClassName("primary")}
            />
            <ButtonLink href={`#${SECTION_ID_PLANS}`} variant="outline">
              {t("hero.ctaSecondary")}
            </ButtonLink>
          </div>
          <p className={styles.note}>{t("hero.note", { word })}</p>
          <ul className={styles.facts} aria-label={t("hero.factsLabel")}>
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>

        <ChatDemo
          label={t("chat.label")}
          business={t("chat.business")}
          status={t("chat.status")}
          day={t("chat.day")}
          result={t("chat.result")}
          messages={t.raw("chat.messages") as ChatMessage[]}
        />
      </Container>
    </section>
  );
}
