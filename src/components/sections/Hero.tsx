import { getTranslations } from "next-intl/server";

import { buttonClassName } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ContactMenu } from "@/components/ui/ContactMenu";
import { Container } from "@/components/ui/Container";
import { ViewModeSwitch } from "@/components/ui/ViewModeSwitch";
import { CONTACT_OPTIONS } from "@/constants/contacts";
import {
  SECTION_ID_CALC,
  SECTION_ID_HERO,
  SECTION_ID_PLANS,
  headingIdOf,
} from "@/constants/sections";
import { classNames } from "@/lib/classNames";

import { ChatDemo, type ChatMessage } from "./ChatDemo";
import styles from "./Hero.module.scss";
import styles3d from "./Hero.3d.module.scss";
import { PneumoTube } from "./PneumoTube";

export async function Hero() {
  const t = await getTranslations();
  const headingId = headingIdOf(SECTION_ID_HERO);
  const messages = t.raw("chat.messages") as ChatMessage[];

  return (
    <section
      id={SECTION_ID_HERO}
      aria-labelledby={headingId}
      className={classNames(styles.section, styles3d.section)}
    >
      <Container className={classNames(styles.grid, styles3d.grid)}>
        <div>
          <div className={styles.topline}>
            <p className={classNames(styles.badge, styles3d.badge)}>{t("hero.badge")}</p>
            <ViewModeSwitch
              label={t("hero.view.label")}
              classicLabel={t("hero.view.classic")}
              sceneLabel={t("hero.view.scene")}
              className={styles.viewSwitch}
            />
          </div>
          <h1 id={headingId} className={styles.title}>
            {t("hero.title")}
          </h1>
          <p className={classNames(styles.lead, styles3d.lead)}>{t("hero.lead")}</p>
          <p className={classNames(styles.founder, styles3d.founder)}>
            {t("hero.founderLine")}
          </p>
          <div className={styles.buttons}>
            <ContactMenu
              label={t("hero.ctaPrimary")}
              caption={t("nav.chooseChannel")}
              options={CONTACT_OPTIONS}
              triggerClassName={buttonClassName("primary", styles3d.primaryCta)}
            />
            <ButtonLink
              href={`#${SECTION_ID_PLANS}`}
              variant="outline"
              className={styles3d.secondaryCta}
            >
              {t("hero.ctaSecondary")}
            </ButtonLink>
          </div>
          <a href={`#${SECTION_ID_CALC}`} className={classNames(styles.calcLink, styles3d.calcLink)}>
            {t("hero.calcLink")}&nbsp;→
          </a>
        </div>

        <PneumoTube
          tagTime={messages[0]?.time ?? ""}
          className={classNames(styles.tube, styles3d.tube)}
        />

        <ChatDemo
          label={t("chat.label")}
          business={t("chat.business")}
          status={t("chat.status")}
          day={t("chat.day")}
          result={t("chat.result")}
          messages={messages}
        />
      </Container>
    </section>
  );
}
