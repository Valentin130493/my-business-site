import { setRequestLocale } from "next-intl/server";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Calculator } from "@/components/sections/Calculator";
import { Faq } from "@/components/sections/Faq";
import { Features } from "@/components/sections/Features";
import { FinalCta } from "@/components/sections/FinalCta";
import { Founder } from "@/components/sections/Founder";
import { Hero } from "@/components/sections/Hero";
import { Night } from "@/components/sections/Night";
import { Plans } from "@/components/sections/Plans";
import { Stats } from "@/components/sections/Stats";
import { Steps } from "@/components/sections/Steps";
import { Trend } from "@/components/sections/Trend";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { MAIN_CONTENT_ID } from "@/constants/sections";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main id={MAIN_CONTENT_ID}>
        <Hero />
        <Stats />
        <Night />
        <Calculator />
        <Features />
        <Trend />
        <Plans />
        <Steps />
        <Founder />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <RevealObserver key={locale} />
    </>
  );
}
