import type { Metadata } from "next";
import { Golos_Text, Unbounded } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing } from "@/i18n/routing";
import { SiteAnalytics } from "@/components/layout/SiteAnalytics";
import {
  DEFAULT_LOCALE,
  OG_LOCALES,
  SUPPORTED_LOCALES,
  localePath,
  type SiteLocale,
} from "@/constants/locales";
import { MAIN_CONTENT_ID } from "@/constants/sections";
import { SITE_URL } from "@/constants/site";
import { buildSiteJsonLd } from "@/seo/siteJsonLd";
import type { PlanText, SkillGroup } from "@/types/content";
import "@/styles/globals.scss";

// latin-ext — для черногорских букв: č, ć, š, ž, đ
const golos = Golos_Text({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "700"],
  variable: "--font-display",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "seo" });
  const tRoot = await getTranslations({ locale });
  const brand = tRoot("brand");
  const url = `${SITE_URL}${localePath(locale)}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    authors: [{ name: brand, url: SITE_URL }],
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          SUPPORTED_LOCALES.map((loc) => [loc, `${SITE_URL}${localePath(loc)}`]),
        ),
        "x-default": `${SITE_URL}${localePath(DEFAULT_LOCALE)}`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url,
      siteName: brand,
      locale: OG_LOCALES[locale as SiteLocale],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const t = await getTranslations({ locale });

  const jsonLd = buildSiteJsonLd({
    locale,
    pageUrl: `${SITE_URL}${localePath(locale)}`,
    name: t("brand"),
    jobTitle: t("about.jobTitle"),
    description: t("seo.description"),
    plans: t.raw("plans.items") as PlanText[],
    skills: t.raw("about.skills") as SkillGroup[],
  });

  return (
    <html lang={locale} className={`${golos.variable} ${unbounded.variable}`}>
      <body>
        <a href={`#${MAIN_CONTENT_ID}`} className="skip-link">
          {t("nav.skip")}
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
