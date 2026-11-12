import { getTranslations } from "next-intl/server";

import { yearOf } from "@/lib/dates";
import { revealProps } from "@/lib/reveal";
import type { Experience, SkillGroup } from "@/types/content";

import styles from "./About.module.scss";

export async function AboutDetails() {
  const t = await getTranslations("about");

  return (
    <div className={styles.details}>
      <div {...revealProps(0)}>
        <h3 className={styles.blockTitle}>{t("experienceHeading")}</h3>
        <ExperienceList items={t.raw("experience") as Experience[]} />
      </div>
      <div {...revealProps(1)}>
        <h3 className={styles.blockTitle}>{t("skillsHeading")}</h3>
        <SkillList groups={t.raw("skills") as SkillGroup[]} />
      </div>
      <div {...revealProps(2)}>
        <h3 className={styles.blockTitle}>{t("languagesHeading")}</h3>
        <p className={styles.muted}>{t("languages")}</p>
      </div>
    </div>
  );
}

function ExperienceList({ items }: { items: Experience[] }) {
  return (
    <ol className={styles.timeline}>
      {items.map((job) => (
        <li key={job.start}>
          <h4 className={styles.jobTitle}>
            {job.role} · {job.area}
          </h4>
          <p className={styles.period}>
            <time dateTime={job.start}>{yearOf(job.start)}</time>
            {" — "}
            <time dateTime={job.end}>{yearOf(job.end)}</time>
          </p>
          <p className={styles.muted}>{job.text}</p>
        </li>
      ))}
    </ol>
  );
}

function SkillList({ groups }: { groups: SkillGroup[] }) {
  return (
    <dl className={styles.skills}>
      {groups.map((group) => (
        <div key={group.title}>
          <dt>{group.title}</dt>
          <dd className={styles.muted}>{group.items.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}
