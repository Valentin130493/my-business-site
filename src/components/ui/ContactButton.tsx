"use client";

import type { ReactNode } from "react";

import { openContact, type ContactOption } from "@/lib/contact";

type ContactButtonProps = {
  contact: Pick<ContactOption, "channel" | "code">;
  className?: string;
  children: ReactNode;
};

export function ContactButton({ contact, className, children }: ContactButtonProps) {
  return (
    <button type="button" className={className} onClick={() => openContact(contact)}>
      {children}
    </button>
  );
}
