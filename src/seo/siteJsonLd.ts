import {
  PLAN_PRICES,
  PRICE_CURRENCY,
  type PlanPrice,
} from "@/constants/pricing";
import { SECTION_ID_PLANS } from "@/constants/sections";
import { GITHUB_URL, SITE_URL, SPOKEN_LANGUAGES } from "@/constants/site";
import type { PlanText, SkillGroup } from "@/types/content";

const PERSON_ID = `${SITE_URL}/#person`;
const SERVICE_ID = `${SITE_URL}/#service`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const AREA_SERVED = "Worldwide";
// код «месяц» из справочника UN/CEFACT — его ожидает schema.org unitCode
const MONTH_UNIT_CODE = "MON";

export type SiteJsonLdInput = {
  locale: string;
  pageUrl: string;
  name: string;
  jobTitle: string;
  description: string;
  plans: PlanText[];
  skills: SkillGroup[];
};

export function buildSiteJsonLd(input: SiteJsonLdInput) {
  return {
    "@context": "https://schema.org",
    "@graph": [buildPerson(input), buildService(input), buildWebsite(input)],
  };
}

function buildPerson({ name, jobTitle, pageUrl, skills }: SiteJsonLdInput) {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name,
    jobTitle,
    url: pageUrl,
    knowsAbout: skills.flatMap((group) => group.items),
    knowsLanguage: SPOKEN_LANGUAGES,
    sameAs: [GITHUB_URL],
  };
}

function buildService(input: SiteJsonLdInput) {
  return {
    "@type": "Service",
    "@id": SERVICE_ID,
    name: input.jobTitle,
    description: input.description,
    url: input.pageUrl,
    areaServed: AREA_SERVED,
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: input.pageUrl,
    },
    provider: { "@id": PERSON_ID },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      itemListElement: input.plans.map((plan) => buildOffer(plan, input.pageUrl)),
    },
  };
}

function buildOffer(plan: PlanText, pageUrl: string) {
  return {
    "@type": "Offer",
    name: plan.name,
    description: plan.what,
    url: `${pageUrl}#${SECTION_ID_PLANS}`,
    areaServed: AREA_SERVED,
    priceSpecification: buildPriceSpecifications(PLAN_PRICES[plan.id]),
  };
}

function buildPriceSpecifications({ amount, isFrom, monthlyAmount }: PlanPrice) {
  const oneTime = {
    "@type": "PriceSpecification",
    priceCurrency: PRICE_CURRENCY,
    ...(isFrom ? { minPrice: amount } : { price: amount }),
  };
  if (monthlyAmount === undefined) return [oneTime];

  const monthly = {
    "@type": "UnitPriceSpecification",
    priceCurrency: PRICE_CURRENCY,
    price: monthlyAmount,
    unitCode: MONTH_UNIT_CODE,
  };
  return [oneTime, monthly];
}

function buildWebsite({ name, locale }: SiteJsonLdInput) {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name,
    inLanguage: locale,
    publisher: { "@id": PERSON_ID },
  };
}
