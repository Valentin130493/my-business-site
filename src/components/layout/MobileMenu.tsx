"use client";

import { useEffect, useId, useRef, useState } from "react";

import { ContactButton } from "@/components/ui/ContactButton";
import type { ContactOption } from "@/lib/contact";

import styles from "./MobileMenu.module.scss";

export type NavLink = {
  href: string;
  label: string;
  isCurrent?: boolean;
};

type MobileMenuProps = {
  links: NavLink[];
  contacts: ContactOption[];
  navLabel: string;
  openLabel: string;
  closeLabel: string;
  contactsLabel: string;
};

export function MobileMenu({
  links,
  contacts,
  navLabel,
  openLabel,
  closeLabel,
  contactsLabel,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function closeOnOutsidePointer(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setIsOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const close = () => setIsOpen(false);

  return (
    <div ref={rootRef} className={styles.root} data-open={isOpen || undefined}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={isOpen ? closeLabel : openLabel}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={styles.bars} aria-hidden="true" />
      </button>
      <div id={panelId} className={styles.panel}>
        <nav aria-label={navLabel}>
          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={styles.link}
                  aria-current={link.isCurrent ? "page" : undefined}
                  onClick={close}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {contacts.length > 0 ? (
          <div className={styles.contacts}>
            <p className={styles.contactsLabel}>{contactsLabel}</p>
            <div className={styles.contactButtons}>
              {contacts.map((contact) => (
                <ContactButton key={contact.channel} contact={contact} className={styles.contact}>
                  {contact.label}
                </ContactButton>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
