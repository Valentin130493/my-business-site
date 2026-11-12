import { Analytics } from "@vercel/analytics/next";

// VERCEL_ENV задаёт сам Vercel: production / preview / development.
// Превью-деплои и локальная разработка в статистику не попадают никогда.
const IS_PRODUCTION_DEPLOY = process.env.VERCEL_ENV === "production";

// Рубильник запуска: пока Production-деплой в Vercel — это стейдж,
// переменную не задаём. Ставим ANALYTICS_ENABLED=true, когда сайт выходит в прод.
const IS_LAUNCHED = process.env.ANALYTICS_ENABLED === "true";

const IS_ANALYTICS_ENABLED = IS_PRODUCTION_DEPLOY && IS_LAUNCHED;

export function SiteAnalytics() {
  if (!IS_ANALYTICS_ENABLED) {
    return null;
  }

  return <Analytics />;
}
