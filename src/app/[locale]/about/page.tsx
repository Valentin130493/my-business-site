import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { About } from "@/components/sections/About";
import { Cases } from "@/components/sections/Cases";
import { FinalCta } from "@/components/sections/FinalCta";
import { RevealObserver } from "@/components/ui/RevealObserver";
import {
  ABOUT_PATH,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  localePath,
} from "@/constants/locales";
import { MAIN_CONTENT_ID } from "@/constants/sections";
import { SITE_URL } from "@/constants/site";
import { routing } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: "aboutPage" });
  const url = `${SITE_URL}${localePath(locale, ABOUT_PATH)}`;

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(
          SUPPORTED_LOCALES.map((loc) => [loc, `${SITE_URL}${localePath(loc, ABOUT_PATH)}`]),
        ),
        "x-default": `${SITE_URL}${localePath(DEFAULT_LOCALE, ABOUT_PATH)}`,
      },
    },
    openGraph: { title: t("title"), description: t("description"), url },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar isHome={false} />
      <main id={MAIN_CONTENT_ID}>
        <About headingLevel={1} />
        <Cases />
        <FinalCta />
      </main>
      <Footer />
      <RevealObserver key={locale} />
    </>
  );
}
