import type { ContactChannel, ContactOption } from "@/lib/contact";

import { urlFromEnv } from "./env";

type ContactSource = {
  channel: ContactChannel;
  label: string;
  envName: string;
  host: string;
};

const CONTACT_SOURCES: ContactSource[] = [
  { channel: "instagram", label: "Instagram", envName: "INSTAGRAM_URL", host: "instagram.com" },
  { channel: "telegram", label: "Telegram", envName: "TELEGRAM_URL", host: "t.me" },
];

function contactUrlFromEnv({ envName, host }: ContactSource): string {
  const url = urlFromEnv(envName);
  if (url && !new URL(url).hostname.endsWith(host)) {
    throw new Error(`${envName} must point to ${host}, got "${url}"`);
  }
  return url;
}

function encodeUrl(url: string): string {
  return Buffer.from(url, "utf8").toString("base64");
}

export const CONTACT_OPTIONS: ContactOption[] = CONTACT_SOURCES.flatMap((source) => {
  const url = contactUrlFromEnv(source);
  return url ? [{ channel: source.channel, label: source.label, code: encodeUrl(url) }] : [];
});
