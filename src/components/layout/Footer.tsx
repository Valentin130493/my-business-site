import { getTranslations } from "next-intl/server";

import { ContactLink } from "@/components/ui/ContactLink";
import { Container } from "@/components/ui/Container";
import { CONTACT_OPTIONS } from "@/constants/contacts";

import styles from "./Footer.module.scss";

export async function Footer() {
  const t = await getTranslations("footer");

  return (
    <footer className={styles.footer}>
      <Container className={styles.row}>
        <small>{t("copyright", { year: new Date().getFullYear() })}</small>
        <p>{t("line")}</p>
        <address className={styles.contacts}>
          {CONTACT_OPTIONS.map((contact) => (
            <ContactLink
              key={contact.channel}
              contact={contact}
              className={styles.link}
            >
              {contact.label}
            </ContactLink>
          ))}
        </address>
      </Container>
    </footer>
  );
}
