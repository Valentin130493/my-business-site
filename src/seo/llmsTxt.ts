import type { getTranslations } from "next-intl/server";

import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  localePath,
  type SiteLocale,
} from "@/constants/locales";
import { PLAN_PRICES, formatPrice } from "@/constants/pricing";
import { SECTION_ID_CONTACT } from "@/constants/sections";
import { CASE_URLS, SITE_URL, TREND_SOURCE_URLS } from "@/constants/site";
import { yearOf } from "@/lib/dates";
import type {
  CaseStudy,
  Experience,
  FaqItem,
  PlanText,
  SkillGroup,
  TrendStat,
  TrendStep,
  BotType,
} from "@/types/content";

type Translator = Awaited<ReturnType<typeof getTranslations>>;
type TitledText = { title: string; text: string };

const BLOCK_SEPARATOR = "\n\n";

export function buildLlmsTxt(t: Translator, locale: SiteLocale): string {
  const blocks = [
    `# ${t("seo.title")}`,
    `> ${t("seo.description")}`,
    buildAbout(t),
    buildCases(t),
    buildPlans(t, locale),
    buildFeatures(t),
    buildTrend(t),
    buildSteps(t),
    buildFaq(t),
    buildContacts(t, locale),
    buildLanguageVersions(t),
  ];
  return `${blocks.join(BLOCK_SEPARATOR)}\n`;
}

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function buildAbout(t: Translator): string {
  const experience = t.raw("about.experience") as Experience[];
  const skills = t.raw("about.skills") as SkillGroup[];

  return [
    `## ${t("nav.about")}`,
    `${t("brand")}: ${t("about.jobTitle")}.`,
    ...(t.raw("about.paragraphs") as string[]),
    `### ${t("about.experienceHeading")}`,
    bulletList(
      experience.map(
        (job) =>
          `${yearOf(job.start)}–${yearOf(job.end)}: ${job.role}, ${job.area}. ${job.text}`,
      ),
    ),
    `### ${t("about.skillsHeading")}`,
    bulletList(skills.map((group) => `${group.title}: ${group.items.join(", ")}`)),
    `### ${t("about.languagesHeading")}`,
    t("about.languages"),
  ].join(BLOCK_SEPARATOR);
}

function buildCases(t: Translator): string {
  const items = t.raw("cases.items") as CaseStudy[];
  return [`## ${t("nav.cases")}`, ...items.map((item) => buildCase(t, item))].join(
    BLOCK_SEPARATOR,
  );
}

function buildCase(t: Translator, item: CaseStudy): string {
  const url = CASE_URLS[item.id];
  const facts = [
    `${t("cases.task")}: ${item.task}`,
    `${t("cases.solution")}: ${item.solution}`,
    ...(item.result ? [`${t("cases.result")}: ${item.result}`] : []),
    ...(url ? [url] : []),
  ];
  const modules = (item.modules ?? []).map((module) => `${module.title}: ${module.text}`);

  return [
    `### ${item.title}`,
    bulletList(facts),
    ...(modules.length > 0 ? [`${t("cases.modules")}:`, bulletList(modules)] : []),
  ].join(BLOCK_SEPARATOR);
}

function buildPlans(t: Translator, locale: string): string {
  const items = t.raw("plans.items") as PlanText[];
  return [
    `## ${t("nav.plans")}`,
    ...items.map((plan) => buildPlan(t, plan, locale)),
  ].join(BLOCK_SEPARATOR);
}

function buildPlan(t: Translator, plan: PlanText, locale: string): string {
  const price = PLAN_PRICES[plan.id];
  const formatted = formatPrice(price.amount, locale);
  const oneTime = price.isFrom ? `${t("plans.from")} ${formatted}` : formatted;
  const monthly = price.monthlyAmount
    ? ` ${t("plans.monthly", { price: formatPrice(price.monthlyAmount, locale) })}`
    : "";

  return [
    `### ${plan.name} — ${oneTime}${monthly}`,
    plan.what,
    bulletList(plan.points.map((point) => `${point.title} — ${point.benefit}`)),
    ...(plan.note ? [plan.note.replace("{price}", formatted)] : []),
  ].join(BLOCK_SEPARATOR);
}

function buildTitledList(heading: string, items: TitledText[]): string {
  return [
    `## ${heading}`,
    bulletList(items.map((item) => `${item.title}: ${item.text}`)),
  ].join(BLOCK_SEPARATOR);
}

function buildFeatures(t: Translator): string {
  const items = t.raw("features.items") as BotType[];
  const exampleLabel = t("features.exampleLabel");
  const base = t.raw("features.base") as string[];

  return [
    `## ${t("features.heading")}`,
    t("features.lead"),
    bulletList(
      items.map((item) => `${item.title}: ${item.text} ${exampleLabel}: ${item.example}`),
    ),
    `${t("features.baseLabel")}: ${base.join("; ")}.`,
  ].join(BLOCK_SEPARATOR);
}

function buildTrend(t: Translator): string {
  const stats = t.raw("trend.stats") as TrendStat[];
  const timeline = t.raw("trend.timeline") as TrendStep[];
  const forecast = t("trend.forecast");

  return [
    `## ${t("trend.heading")}`,
    t("trend.lead"),
    bulletList(
      stats.map((stat) => `${stat.value} — ${stat.text} (${citation(stat.id, stat.source)})`),
    ),
    `### ${t("trend.timelineLabel")}`,
    bulletList(
      timeline.map((step) => {
        const label = step.isForecast ? ` (${forecast})` : "";
        const source = step.source ? ` (${citation(step.id, step.source)})` : "";
        return `${step.period}${label}: ${step.text}${source}`;
      }),
    ),
  ].join(BLOCK_SEPARATOR);
}

function citation(id: string, label: string): string {
  const url = TREND_SOURCE_URLS[id];
  return url ? `${label}: ${url}` : label;
}

function buildSteps(t: Translator): string {
  const word = t("word");
  const steps = (t.raw("steps.items") as TitledText[]).map((step) => ({
    ...step,
    title: step.title.replace("{word}", word),
  }));
  return buildTitledList(t("steps.heading"), steps);
}

function buildFaq(t: Translator): string {
  const items = t.raw("faq.items") as FaqItem[];
  return [
    `## ${t("faq.heading")}`,
    ...items.map((item) => `### ${item.question}${BLOCK_SEPARATOR}${item.answer}`),
  ].join(BLOCK_SEPARATOR);
}

function buildContacts(t: Translator, locale: SiteLocale): string {
  return [
    `## ${t("nav.contacts")}`,
    `${t("nav.write")}: ${SITE_URL}${localePath(locale)}#${SECTION_ID_CONTACT}`,
  ].join(BLOCK_SEPARATOR);
}

function buildLanguageVersions(t: Translator): string {
  const links = SUPPORTED_LOCALES.map(
    (locale) => `[${LOCALE_LABELS[locale]}](${SITE_URL}${localePath(locale)})`,
  );
  return [`## ${t("nav.languages")}`, bulletList(links)].join(BLOCK_SEPARATOR);
}
