import { urlFromEnv } from "./env";

const LOCAL_SITE_URL = "http://localhost:3000";

// Vercel сам передаёт продакшен-домен проекта (без протокола) — и в продакшене, и в превью
function vercelProductionUrl(): string {
  const domain = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  return domain ? `https://${domain}` : "";
}

// Свой домен задаётся через SITE_URL; без него — продакшен-домен проекта на Vercel, локально — localhost.
// Адрес попадает в canonical, sitemap, robots и llms.txt, поэтому чужой домен-заглушка здесь недопустим
export const SITE_URL = urlFromEnv("SITE_URL") || vercelProductionUrl() || LOCAL_SITE_URL;

export const GITHUB_URL = "https://github.com/Valentin130493";

export const SPOKEN_LANGUAGES = ["uk", "ru", "en"];

export const CASE_URLS: Partial<Record<string, string>> = {
  "news-bot": "https://t.me/good5daily",
  dumza: "https://dumza.com",
};

const MCKINSEY_STATE_OF_AI_URL =
  "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai";
const GARTNER_CUSTOMER_SERVICE_URL =
  "https://www.gartner.com/en/newsroom/press-releases/2025-03-05-gartner-predicts-agentic-ai-will-autonomously-resolve-80-percent-of-common-customer-service-issues-without-human-intervention-by-20290";

export const TREND_SOURCE_URLS: Partial<Record<string, string>> = {
  market: "https://www.marketsandmarkets.com/Market-Reports/ai-agents-market-15761548.html",
  smb: "https://www.salesforce.com/uk/news/stories/smbs-ai-trends-2025/",
  agents: MCKINSEY_STATE_OF_AI_URL,
  klarna:
    "https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/",
  gartner: GARTNER_CUSTOMER_SERVICE_URL,
  forecast: GARTNER_CUSTOMER_SERVICE_URL,
};
