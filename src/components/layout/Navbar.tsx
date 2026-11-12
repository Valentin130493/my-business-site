import { getLocale, getTranslations } from "next-intl/server";

import { BrandMark } from "@/components/ui/BrandMark";
import { ContactMenu } from "@/components/ui/ContactMenu";
import { Container } from "@/components/ui/Container";
import { CONTACT_OPTIONS } from "@/constants/contacts";
import { ABOUT_PATH, localePath, type SiteLocale } from "@/constants/locales";
import {
  SECTION_ID_CALC,
  SECTION_ID_FAQ,
  SECTION_ID_FEATURES,
  SECTION_ID_HERO,
  SECTION_ID_PLANS,
  SECTION_ID_STEPS,
} from "@/constants/sections";

import { LocaleSwitcher } from "./LocaleSwitcher";
import { MobileMenu, type NavLink } from "./MobileMenu";
import styles from "./Navbar.module.scss";

type NavbarProps = {
  isHome?: boolean;
};

export async function Navbar({ isHome = true }: NavbarProps) {
  const t = await getTranslations();
  const locale = (await getLocale()) as SiteLocale;
  const sectionHref = (id: string) => (isHome ? `#${id}` : `${localePath(locale)}#${id}`);

  const links: NavLink[] = [
    { href: sectionHref(SECTION_ID_CALC), label: t("nav.calc") },
    { href: sectionHref(SECTION_ID_FEATURES), label: t("nav.features") },
    { href: sectionHref(SECTION_ID_PLANS), label: t("nav.plans") },
    { href: sectionHref(SECTION_ID_STEPS), label: t("nav.steps") },
    { href: sectionHref(SECTION_ID_FAQ), label: t("nav.faq") },
    { href: localePath(locale, ABOUT_PATH), label: t("nav.about"), isCurrent: !isHome },
  ];

  return (
    <header className={styles.header}>
      <Container className={styles.row}>
        <a
          href={isHome ? `#${SECTION_ID_HERO}` : localePath(locale)}
          className={styles.brand}
          aria-label={t("nav.home")}
        >
          <BrandMark className={styles.brandMark} />
        </a>
        <nav aria-label={t("nav.label")} className={styles.desktopNav}>
          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={styles.link}
                  aria-current={link.isCurrent ? "page" : undefined}
                >
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
        <MobileMenu
          links={links}
          contacts={CONTACT_OPTIONS}
          navLabel={t("nav.label")}
          openLabel={t("nav.menu")}
          closeLabel={t("nav.closeMenu")}
          contactsLabel={t("nav.chooseChannel")}
        />
      </Container>
    </header>
  );
}
