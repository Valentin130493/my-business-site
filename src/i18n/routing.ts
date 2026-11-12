import { defineRouting } from "next-intl/routing";

import {
  DEFAULT_LOCALE,
  LOCALE_PREFIXES,
  SUPPORTED_LOCALES,
} from "@/constants/locales";

export const routing = defineRouting({
  locales: SUPPORTED_LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: { mode: "always", prefixes: LOCALE_PREFIXES },
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];
