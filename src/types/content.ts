import type { PlanId } from "@/constants/pricing";

export type PlanText = {
  id: PlanId;
  name: string;
  what: string;
  plus: string;
  points: { title: string; benefit: string }[];
  note: string;
};

export type CaseModule = {
  title: string;
  text: string;
};

export type CaseStudy = {
  id: string;
  title: string;
  task: string;
  solution: string;
  result: string;
  modules?: CaseModule[];
};

export type Experience = {
  start: string;
  end: string;
  role: string;
  area: string;
  text: string;
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export type BotType = {
  id: string;
  title: string;
  text: string;
  example: string;
};

export type TrendStat = {
  id: string;
  value: string;
  text: string;
  source: string;
};

export type TrendStep = {
  id: string;
  period: string;
  text: string;
  isForecast: boolean;
  source: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};
