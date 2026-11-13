"use client";

import type { ReactNode, SyntheticEvent } from "react";

import { SECTION_ID_CONTACT } from "@/constants/sections";
import { decodeContactUrl, type ContactOption } from "@/lib/contact";

type ContactLinkProps = {
  contact: Pick<ContactOption, "code">;
  className?: string;
  children: ReactNode;
  onOpen?: () => void;
};

// Настоящая ссылка, а не window.open: iOS открывает по ней приложение Instagram/Telegram,
// а встроенные браузеры соцсетей не блокируют переход
export function ContactLink({ contact, className, children, onOpen }: ContactLinkProps) {
  function revealHref(event: SyntheticEvent<HTMLAnchorElement>) {
    event.currentTarget.href = decodeContactUrl(contact.code);
  }

  return (
    <a
      href={`#${SECTION_ID_CONTACT}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onPointerDown={revealHref}
      onFocus={revealHref}
      onClick={(event) => {
        revealHref(event);
        onOpen?.();
      }}
    >
      {children}
    </a>
  );
}
