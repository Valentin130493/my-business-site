"use client";

import { useEffect, useState } from "react";

import { prefersReducedMotion } from "@/lib/motion";

import styles from "./ChatDemo.module.scss";

export type ChatMessage = {
  from: "client" | "bot";
  time: string;
  text: string;
};

type ChatDemoProps = {
  label: string;
  business: string;
  status: string;
  day: string;
  result: string;
  messages: ChatMessage[];
};

const START_DELAY = 500;
const TYPING_TIME = 1100;
const BOT_PAUSE = 1200;
const CLIENT_PAUSE = 1400;

// Переписка проигрывается один раз при загрузке. Без JS и при «уменьшить движение»
// видна сразу целиком. Текст сообщений всегда есть в HTML — его видит поисковик
export function ChatDemo({
  label,
  business,
  status,
  day,
  result,
  messages,
}: ChatDemoProps) {
  const [shown, setShown] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    // При «уменьшить движение» всё видно сразу через CSS
    if (reduce) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    let at = START_DELAY;
    messages.forEach((message, index) => {
      const isBot = message.from === "bot";
      if (isBot) {
        timers.push(setTimeout(() => setIsTyping(true), at));
        at += TYPING_TIME;
      }
      timers.push(
        setTimeout(() => {
          setIsTyping(false);
          setShown(index + 1);
        }, at),
      );
      at += isBot ? BOT_PAUSE : CLIENT_PAUSE;
    });

    return () => timers.forEach(clearTimeout);
  }, [messages]);

  const isDone = shown === messages.length;

  return (
    <div className={styles.phone} role="group" aria-label={label}>
      <noscript>
        <style>{`.${styles.msg},.${styles.result}{display:block!important;visibility:visible!important}`}</style>
      </noscript>
      <div className={styles.screen}>
        <div className={styles.head}>
          <div className={styles.avatar} aria-hidden="true">
            {business.charAt(0)}
          </div>
          <div>
            <b className={styles.business}>{business}</b>
            <span className={styles.status}>{status}</span>
          </div>
        </div>
        <div className={styles.messages}>
          <span className={styles.day}>{day}</span>
          {messages.map((message, index) => (
            <div
              key={index}
              className={[
                styles.msg,
                message.from === "bot" ? styles.bot : styles.client,
                index < shown ? styles.visible : "",
              ].join(" ")}
            >
              {message.text}
              <time className={styles.time}>{message.time}</time>
            </div>
          ))}
          {isTyping ? (
            <div className={styles.typing} aria-hidden="true">
              <i />
              <i />
              <i />
            </div>
          ) : null}
          <span className={`${styles.result} ${isDone ? styles.visible : ""}`}>
            {result}
          </span>
        </div>
      </div>
    </div>
  );
}
