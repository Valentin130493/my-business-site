import { getLocale, getTranslations } from "next-intl/server";

import { Container } from "@/components/ui/Container";
import {
  FEATURED_PLAN_ID,
  PLAN_PRICES,
  formatPrice,
} from "@/constants/pricing";
import { SECTION_ID_PLANS, headingIdOf } from "@/constants/sections";
import { classNames } from "@/lib/classNames";
import { revealProps } from "@/lib/reveal";
import type { PlanText } from "@/types/content";

import styles from "./Plans.module.scss";
import stylesDark from "./Plans.dark.module.scss";

export async function Plans() {
  const t = await getTranslations("plans");
  const items = t.raw("items") as PlanText[];
  const headingId = headingIdOf(SECTION_ID_PLANS);

  return (
    <section
      id={SECTION_ID_PLANS}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <Container>
        <h2 id={headingId} {...revealProps()}>
          {t("heading")}
        </h2>
        <div className={styles.grid}>
          {items.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

async function PlanCard({ plan, index }: { plan: PlanText; index: number }) {
  const t = await getTranslations("plans");
  const locale = await getLocale();
  const price = PLAN_PRICES[plan.id];
  const formattedPrice = formatPrice(price.amount, locale);
  const headingId = `plan-${plan.id}`;
  const isFeatured = plan.id === FEATURED_PLAN_ID;

  return (
    <article
      aria-labelledby={headingId}
      className={classNames(styles.plan, isFeatured && styles.featured, isFeatured && stylesDark.featured)}
      {...revealProps(index)}
    >
      <header className={styles.header}>
        <div className={styles.nameRow}>
          <h3 id={headingId} className={styles.name}>
            {plan.name}
          </h3>
          {isFeatured ? <span className={styles.badge}>{t("featured")}</span> : null}
        </div>
        <p className={styles.price}>
          {price.isFrom ? <small className={styles.from}>{t("from")} </small> : null}
          <data value={price.amount}>{formattedPrice}</data>
        </p>
        {price.monthlyAmount ? (
          <p className={styles.monthly}>
            {t("monthly", { price: formatPrice(price.monthlyAmount, locale) })}
          </p>
        ) : null}
        <p className={styles.what}>{plan.what}</p>
      </header>
      {plan.plus ? <p className={styles.plus}>{plan.plus}</p> : null}
      <ul className={styles.points}>
        {plan.points.map((point) => (
          <li key={point.title} className={styles.point}>
            <span className={styles.pointTitle}>{point.title}</span>
            <span className={styles.benefit}>{point.benefit}</span>
          </li>
        ))}
      </ul>
      {plan.note ? (
        <p className={styles.note}>{plan.note.replace("{price}", formattedPrice)}</p>
      ) : null}
    </article>
  );
}
