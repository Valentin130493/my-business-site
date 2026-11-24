"use client";

import { useEffect, useRef, useState, type SubmitEvent } from "react";

import { classNames } from "@/lib/classNames";
import { prefersReducedMotion } from "@/lib/motion";

import styles from "./AskBot.module.scss";

export type AskBotItem = {
  question: string;
  answer: string;
};

export type AskBotLiveTexts = {
  placeholder: string;
  send: string;
  note: string;
  offline: string;
  tooOften: string;
  error: string;
};

type AskBotProps = {
  status: string;
  title: string;
  items: AskBotItem[];
  /** Адрес живого бота. Без него — только кнопки с готовыми ответами */
  liveUrl?: string;
  live: AskBotLiveTexts;
  className?: string;
};

type Line = { id: number; from: "visitor" | "bot"; text: string };

const TYPING_TIME = 700;
const MAX_LINES = 8;
const MAX_TEXT = 500;
const REQUEST_TIMEOUT = 40_000;
const PROBE_TIMEOUT = 3_000;
// Отдельной проверки здоровья у бота нет: пустой опрос заодно показывает, что сервер включён
const PROBE_PATH = "/api/poll?sessionId=site_probe";
// После ответа минуту проверяем, не написал ли менеджер вдогонку
const POLL_EVERY = 5_000;
const POLL_TIMES = 12;

function newSessionId(): string {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `site_${id}`.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 64);
}

// AbortSignal.timeout нет в старых Safari
async function fetchWithTimeout(url: string, timeout: number, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// Демо на первом экране. Кнопки — готовые ответы с этой же страницы: мгновенно и бесплатно.
// Поле ввода — настоящий бот (BOT_API_URL). Его показываем, только если сервер ответил на проверку,
// иначе остаются одни кнопки — без объяснений, почему бот недоступен
export function AskBot({ status, title, items, liveUrl, live, className }: AskBotProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [draft, setDraft] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pollTimer = useRef<ReturnType<typeof setInterval>>(undefined);
  const sessionId = useRef("");
  const lineId = useRef(0);

  useEffect(
    () => () => {
      clearTimeout(typingTimer.current);
      clearInterval(pollTimer.current);
    },
    [],
  );

  useEffect(() => {
    if (!liveUrl) return;
    let isCancelled = false;
    fetchWithTimeout(`${liveUrl}${PROBE_PATH}`, PROBE_TIMEOUT)
      .then((response) => {
        if (!isCancelled && response.ok) setIsLive(true);
      })
      // Сервер выключен — поле просто не появляется
      .catch(() => {});
    return () => {
      isCancelled = true;
    };
  }, [liveUrl]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) dialog.scrollTop = dialog.scrollHeight;
  }, [lines, isTyping]);

  function push(from: Line["from"], ...texts: string[]) {
    setLines((prev) =>
      [...prev, ...texts.map((text) => ({ id: ++lineId.current, from, text }))].slice(-MAX_LINES),
    );
  }

  function ask(index: number) {
    if (isTyping) return;
    const item = items[index];
    setActiveIndex(index);
    push("visitor", item.question);
    if (prefersReducedMotion()) {
      push("bot", item.answer);
      return;
    }
    setIsTyping(true);
    typingTimer.current = setTimeout(() => {
      setIsTyping(false);
      push("bot", item.answer);
    }, TYPING_TIME);
  }

  function startPolling() {
    clearInterval(pollTimer.current);
    let left = POLL_TIMES;
    pollTimer.current = setInterval(async () => {
      if (--left <= 0) clearInterval(pollTimer.current);
      try {
        const response = await fetch(`${liveUrl}/api/poll?sessionId=${sessionId.current}`);
        if (!response.ok) return;
        const { replies } = (await response.json()) as { replies?: string[] };
        if (replies?.length) push("bot", ...replies);
      } catch {
        clearInterval(pollTimer.current);
      }
    }, POLL_EVERY);
  }

  async function sendLive(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim().slice(0, MAX_TEXT);
    if (!text || isTyping || !liveUrl) return;
    sessionId.current ||= newSessionId();
    setDraft("");
    setActiveIndex(null);
    push("visitor", text);
    setIsTyping(true);
    try {
      const response = await fetchWithTimeout(`${liveUrl}/api/chat`, REQUEST_TIMEOUT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current, text }),
      });
      if (response.status === 429) push("bot", live.tooOften);
      else if (!response.ok) push("bot", live.error);
      else {
        const { replies } = (await response.json()) as { replies?: string[] };
        if (replies?.length) push("bot", ...replies);
        startPolling();
      }
    } catch {
      // Сервер выключили, пока страница открыта, или пропала сеть — поле прячем
      setIsLive(false);
      push("bot", live.offline);
    } finally {
      setIsTyping(false);
    }
  }

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
      <div ref={dialogRef} className={styles.dialog} aria-live="polite">
        {lines.map((line) => (
          <p
            key={line.id}
            className={classNames(styles.bubble, line.from === "visitor" ? styles.visitor : styles.bot)}
          >
            {line.text}
          </p>
        ))}
        {isTyping ? (
          <div className={styles.typing} aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        ) : null}
      </div>
      {liveUrl && isLive ? (
        <div className={styles.live}>
          <form className={styles.form} onSubmit={sendLive}>
            <input
              className={styles.input}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={live.placeholder}
              aria-label={live.placeholder}
              maxLength={MAX_TEXT}
              autoComplete="off"
            />
            <button type="submit" className={styles.send} disabled={isTyping || !draft.trim()}>
              {live.send}
            </button>
          </form>
          <p className={styles.note}>{live.note}</p>
        </div>
      ) : null}
    </div>
  );
}
