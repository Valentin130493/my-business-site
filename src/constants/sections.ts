export const MAIN_CONTENT_ID = "main";

export const SECTION_ID_HERO = "top";
export const SECTION_ID_NIGHT = "night";
export const SECTION_ID_TREND = "trend";
export const SECTION_ID_CALC = "calc";
export const SECTION_ID_FOUNDER = "founder";
export const SECTION_ID_FEATURES = "features";
export const SECTION_ID_CASES = "cases";
export const SECTION_ID_PLANS = "plans";
export const SECTION_ID_STEPS = "steps";
export const SECTION_ID_ABOUT = "about";
export const SECTION_ID_FAQ = "faq";
export const SECTION_ID_CONTACT = "contact";

export function headingIdOf(sectionId: string): string {
  return `${sectionId}-heading`;
}
