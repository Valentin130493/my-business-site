"use client";

import { useEffect, useRef, useState } from "react";

import { classNames } from "@/lib/classNames";
import { prefersReducedMotion } from "@/lib/motion";

import styles from "./AskBot.module.scss";

export type AskBotItem = {
  question: string;
  answer: string;
};

type AskBotProps = {
  status: string;
  title: string;
  items: AskBotItem[];
  className?: string;
};

const TYPING_TIME = 700;

// Демо на первом экране: вопрос из кнопок → «печатает» → ответ. Ответы — факты с этой же страницы
export function AskBot({ status, title, items, className }: AskBotProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(typingTimer.current), []);

  function ask(index: number) {
    clearTimeout(typingTimer.current);
    setActiveIndex(index);
    if (prefersReducedMotion()) {
      setIsTyping(false);
      return;
    }
    setIsTyping(true);
    typingTimer.current = setTimeout(() => setIsTyping(false), TYPING_TIME);
  }

  const active = activeIndex === null ? null : items[activeIndex];

  return (
    <div className={classNames(styles.card, className)}>
      <p className={styles.status}>{status}</p>
      <p className={styles.title}>{title}</p>
      <div className={styles.chips}>
        {items.map((item, index) => (
          <button
            key={item.question}
            type="button"
            className={styles.chip}
            aria-pressed={index === activeIndex}
            onClick={() => ask(index)}
          >
            {item.question}
          </button>
        ))}
      </div>
      <div className={styles.dialog} aria-live="polite">
        {active ? (
          <>
            <p key={`q-${activeIndex}`} className={classNames(styles.bubble, styles.visitor)}>
              {active.question}
            </p>
            {isTyping ? (
              <div className={styles.typing} aria-hidden="true">
                <i />
                <i />
                <i />
              </div>
            ) : (
              <p key={`a-${activeIndex}`} className={classNames(styles.bubble, styles.bot)}>
                {active.answer}
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
