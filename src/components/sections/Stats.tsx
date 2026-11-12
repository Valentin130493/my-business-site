import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import { PLAN_PRICES, formatPrice } from "@/constants/pricing";
import { revealProps } from "@/lib/reveal";
import type { StatItem } from "@/types/content";

import styles from "./Stats.module.scss";

export async function Stats() {
  const t = await getTranslations("stats");
  const locale = await getLocale();
  const startPrice = formatPrice(PLAN_PRICES.start.amount, locale);
  const items = (t.raw("items") as StatItem[]).map((item) => ({
    ...item,
    value: item.value.replace("{startPrice}", startPrice),
  }));

  return (
    <section aria-label={t("label")} className={styles.section}>
      <Container>
        <ul className={styles.grid}>
          {items.map((item, index) => (
            <li key={item.text} className={styles.item} {...revealProps(index)}>
              <p className={styles.value}>{item.value}</p>
              <p className={styles.text}>{item.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
