import { setRequestLocale } from "next-intl/server";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { Night } from "@/components/sections/Night";
import { Trend } from "@/components/sections/Trend";
import { Features } from "@/components/sections/Features";
import { Cases } from "@/components/sections/Cases";
import { Plans } from "@/components/sections/Plans";
import { RevealObserver } from "@/components/ui/RevealObserver";
import { MAIN_CONTENT_ID } from "@/constants/sections";
import { Steps } from "@/components/sections/Steps";
import { About } from "@/components/sections/About";
import { Faq } from "@/components/sections/Faq";
import { FinalCta } from "@/components/sections/FinalCta";

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
        <Night />
        <Trend />
        <Features />
        <Cases />
        <Plans />
        <Steps />
        <About />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <RevealObserver key={locale} />
    </>
  );
}
