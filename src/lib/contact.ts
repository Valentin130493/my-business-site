export type ContactChannel = "instagram" | "telegram";

export type ContactOption = {
  channel: ContactChannel;
  label: string;
  code: string;
};

// Ссылка приходит закодированной и раскрывается только при касании/клике человека:
// в HTML нет готовых адресов профилей, которые собирают боты
export function decodeContactUrl(code: string): string {
  return atob(code);
}
