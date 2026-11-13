import { getTranslations } from "next-intl/server";

import { buttonClassName } from "@/components/ui/Button";
import { ContactLink } from "@/components/ui/ContactLink";
import { Container } from "@/components/ui/Container";
import { CONTACT_OPTIONS } from "@/constants/contacts";
import { SECTION_ID_CONTACT, headingIdOf } from "@/constants/sections";
import { revealProps } from "@/lib/reveal";

import styles from "./FinalCta.module.scss";

export async function FinalCta() {
  const t = await getTranslations();
  const headingId = headingIdOf(SECTION_ID_CONTACT);

  return (
    <section
      id={SECTION_ID_CONTACT}
      aria-labelledby={headingId}
      className={styles.section}
    >
      <Container>
        <div className={styles.box} {...revealProps()}>
          <div className={styles.content}>
            <h2 id={headingId} className={styles.heading}>
              {t("final.heading")}
            </h2>
            <p className={styles.text}>{t("final.text")}</p>
          </div>
          {CONTACT_OPTIONS.length > 0 ? (
            <div className={styles.buttons}>
              {CONTACT_OPTIONS.map((contact, index) => (
                <ContactLink
                  key={contact.channel}
                  contact={contact}
                  className={buttonClassName(index === 0 ? "accent" : "outlineLight")}
                >
                  {t(`final.${contact.channel}`)}
                </ContactLink>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>{t("final.noContacts")}</p>
          )}
        </div>
      </Container>
    </section>
  );
}
