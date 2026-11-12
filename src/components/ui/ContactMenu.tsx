"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { openContact, type ContactOption } from "@/lib/contact";

import styles from "./ContactMenu.module.scss";

type ContactMenuProps = {
  label: ReactNode;
  caption: string;
  options: ContactOption[];
  triggerClassName?: string;
  align?: "start" | "end";
};

export function ContactMenu({
  label,
  caption,
  options,
  triggerClassName,
  align = "start",
}: ContactMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

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

  if (options.length === 0) return null;

  if (options.length === 1) {
    return (
      <button
        type="button"
        className={triggerClassName}
        onClick={() => openContact(options[0])}
      >
        {label}
      </button>
    );
  }

  function choose(option: ContactOption) {
    openContact(option);
    setIsOpen(false);
  }

  return (
    <div ref={rootRef} className={styles.root} data-open={isOpen || undefined}>
      <button
        type="button"
        className={triggerClassName}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        {label}
      </button>
      <div
        id={menuId}
        className={`${styles.menu} ${align === "end" ? styles.end : ""}`}
      >
        <p className={styles.caption}>{caption}</p>
        <ul className={styles.options}>
          {options.map((option) => (
            <li key={option.channel}>
              <button
                type="button"
                className={styles.option}
                onClick={() => choose(option)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
