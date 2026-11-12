import { urlFromEnv } from "./env";

export const SITE_URL =
  urlFromEnv("SITE_URL") || "https://valentin-bots.vercel.app";

export const GITHUB_URL = "https://github.com/Valentin130493";

export const SPOKEN_LANGUAGES = ["uk", "ru", "en"];

export const CASE_URLS: Partial<Record<string, string>> = {
  "news-bot": "https://t.me/good5daily",
  dumza: "https://dumza.com",
};

const MCKINSEY_STATE_OF_AI_URL =
  "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai";

export const TREND_SOURCE_URLS: Partial<Record<string, string>> = {
  "mckinsey-large": MCKINSEY_STATE_OF_AI_URL,
  "mckinsey-small": MCKINSEY_STATE_OF_AI_URL,
  census: "https://www.census.gov/library/stories/2026/05/ai-use-businesses.html",
  klarna:
    "https://www.klarna.com/international/press/klarna-ai-assistant-handles-two-thirds-of-customer-service-chats-in-its-first-month/",
  forecast:
    "https://www.gartner.com/en/newsroom/press-releases/2025-03-05-gartner-predicts-agentic-ai-will-autonomously-resolve-80-percent-of-common-customer-service-issues-without-human-intervention-by-20290",
};
