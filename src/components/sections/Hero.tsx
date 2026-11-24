import type { ReactNode } from "react";
import { getLocale, getTranslations } from "next-intl/server";

import { buttonClassName } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ContactMenu } from "@/components/ui/ContactMenu";
import { Container } from "@/components/ui/Container";
import { ViewModeSwitch } from "@/components/ui/ViewModeSwitch";
import { BOT_API_URL } from "@/constants/bot";
import { CONTACT_OPTIONS } from "@/constants/contacts";
import { formatPrice, PLAN_PRICES } from "@/constants/pricing";
import {
  SECTION_ID_CALC,
  SECTION_ID_HERO,
  SECTION_ID_PLANS,
  headingIdOf,
} from "@/constants/sections";
import { classNames } from "@/lib/classNames";

import { AskBot, type AskBotItem, type AskBotLiveTexts } from "./AskBot";
import { ChatDemo, type ChatMessage } from "./ChatDemo";
import styles from "./Hero.module.scss";
import styles3d from "./Hero.3d.module.scss";
import stylesDark from "./Hero.dark.module.scss";
import { PneumoTube } from "./PneumoTube";

function askItemsWithPrices(items: AskBotItem[], locale: string): AskBotItem[] {
  const botPrice = formatPrice(PLAN_PRICES.standard.amount, locale);
  const startPrice = formatPrice(PLAN_PRICES.start.amount, locale);
  return items.map((item) => ({
    ...item,
    answer: item.answer.replace("{botPrice}", botPrice).replace("{startPrice}", startPrice),
  }));
}

export async function Hero() {
  const t = await getTranslations();
  const locale = await getLocale();
  const headingId = headingIdOf(SECTION_ID_HERO);
  const messages = t.raw("chat.messages") as ChatMessage[];
  const askItems = askItemsWithPrices(t.raw("hero.ask.items") as AskBotItem[], locale);

  return (
    <section
      id={SECTION_ID_HERO}
      aria-labelledby={headingId}
      className={classNames(styles.section, styles3d.section, stylesDark.section)}
    >
      <Container className={classNames(styles.grid, styles3d.grid)}>
        <div>
          <div className={styles.topline}>
            <p className={classNames(styles.badge, stylesDark.badge)}>{t("hero.badge")}</p>
            <ViewModeSwitch
              label={t("hero.view.label")}
              classicLabel={t("hero.view.classic")}
              sceneLabel={t("hero.view.scene")}
              className={styles.viewSwitch}
            />
          </div>
          <h1 id={headingId} className={styles.title}>
            {t.rich("hero.title", {
              mark: (chunks: ReactNode) => (
                <span className={classNames(styles.mark, stylesDark.mark)}>{chunks}</span>
              ),
            })}
          </h1>
          <p className={styles.lead}>{t("hero.lead")}</p>
          <AskBot
            status={t("hero.ask.status")}
            title={t("hero.ask.title")}
            items={askItems}
            liveUrl={BOT_API_URL || undefined}
            live={t.raw("hero.ask.live") as AskBotLiveTexts}
            className={styles.ask}
          />
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
          <a href={`#${SECTION_ID_CALC}`} className={classNames(styles.calcLink, stylesDark.calcLink)}>
            {t("hero.calcLink")}&nbsp;→
          </a>
          <p className={styles.founder}>{t("hero.founderLine")}</p>
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
