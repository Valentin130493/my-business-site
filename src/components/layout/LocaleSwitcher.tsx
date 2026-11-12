"use client";

import { useLocale } from "next-intl";

import { LOCALE_LABELS, SUPPORTED_LOCALES } from "@/constants/locales";
import { Link, usePathname } from "@/i18n/navigation";

import styles from "./LocaleSwitcher.module.scss";

// Обычные ссылки, а не кнопки: поисковик видит все языковые версии
export function LocaleSwitcher({ label }: { label: string }) {
  const activeLocale = useLocale();
  const pathname = usePathname();

  return (
    <nav className={styles.switcher} aria-label={label}>
      {SUPPORTED_LOCALES.map((locale) => {
        const isActive = locale === activeLocale;

        return (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            hrefLang={locale}
            className={`${styles.option} ${isActive ? styles.active : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {LOCALE_LABELS[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
