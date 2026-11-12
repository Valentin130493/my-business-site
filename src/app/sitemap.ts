import type { MetadataRoute } from "next";

import { ABOUT_PATH, SUPPORTED_LOCALES, localePath } from "@/constants/locales";
import { SITE_URL } from "@/constants/site";

const PAGE_PATHS = ["", ABOUT_PATH];

// Каждая запись знает о соседних языках — так Google показывает человеку версию на его языке
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGE_PATHS.flatMap((path) => {
    const languages = Object.fromEntries(
      SUPPORTED_LOCALES.map((loc) => [loc, `${SITE_URL}${localePath(loc, path)}`]),
    );

    return SUPPORTED_LOCALES.map((locale) => ({
      url: `${SITE_URL}${localePath(locale, path)}`,
      lastModified: new Date(),
      alternates: { languages },
    }));
  });
}
