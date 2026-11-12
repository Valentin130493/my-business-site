import { getTranslations } from "next-intl/server";

import { BrandMark } from "@/components/ui/BrandMark";
import { ContactMenu } from "@/components/ui/ContactMenu";
import { Container } from "@/components/ui/Container";
import { CONTACT_OPTIONS } from "@/constants/contacts";
import {
  SECTION_ID_ABOUT,
  SECTION_ID_CASES,
  SECTION_ID_FAQ,
  SECTION_ID_FEATURES,
  SECTION_ID_HERO,
  SECTION_ID_PLANS,
  SECTION_ID_STEPS,
} from "@/constants/sections";

import { LocaleSwitcher } from "./LocaleSwitcher";
import styles from "./Navbar.module.scss";

export async function Navbar() {
  const t = await getTranslations();

  const links = [
    { id: SECTION_ID_FEATURES, label: t("nav.features") },
    { id: SECTION_ID_CASES, label: t("nav.cases") },
    { id: SECTION_ID_PLANS, label: t("nav.plans") },
    { id: SECTION_ID_STEPS, label: t("nav.steps") },
    { id: SECTION_ID_ABOUT, label: t("nav.about") },
    { id: SECTION_ID_FAQ, label: t("nav.faq") },
  ];

  return (
    <header className={styles.header}>
      <Container className={styles.row}>
        <a
          href={`#${SECTION_ID_HERO}`}
          className={styles.brand}
          aria-label={t("nav.home")}
        >
          <BrandMark className={styles.brandMark} />
        </a>
        <nav aria-label={t("nav.label")}>
          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className={styles.link}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <LocaleSwitcher label={t("nav.languages")} />
        <ContactMenu
          label={t("nav.write")}
          caption={t("nav.chooseChannel")}
          options={CONTACT_OPTIONS}
          triggerClassName={styles.write}
          align="end"
        />
      </Container>
    </header>
  );
}
