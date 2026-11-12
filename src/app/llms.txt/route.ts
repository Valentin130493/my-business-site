import { getTranslations } from "next-intl/server";

import { DEFAULT_LOCALE } from "@/constants/locales";
import { buildLlmsTxt } from "@/seo/llmsTxt";

export const dynamic = "force-static";

export async function GET() {
  const t = await getTranslations({ locale: DEFAULT_LOCALE });

  return new Response(buildLlmsTxt(t, DEFAULT_LOCALE), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
