import type { MetadataRoute } from "next";

import { SUPPORTED_LOCALES, localePath } from "@/constants/locales";
import { SITE_URL } from "@/constants/site";

// Одна страница на четырёх языках. Каждая запись знает о соседних языках —
// так Google показывает человеку версию на его языке
export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(
    SUPPORTED_LOCALES.map((loc) => [loc, `${SITE_URL}${localePath(loc)}`]),
  );

  return SUPPORTED_LOCALES.map((locale) => ({
    url: `${SITE_URL}${localePath(locale)}`,
    lastModified: new Date(),
    alternates: { languages },
  }));
}
