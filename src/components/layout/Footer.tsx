import { getTranslations } from "next-intl/server";

import { ContactButton } from "@/components/ui/ContactButton";
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
            <ContactButton
              key={contact.channel}
              contact={contact}
              className={styles.link}
            >
              {contact.label}
            </ContactButton>
          ))}
        </address>
      </Container>
    </footer>
  );
}
