export type ContactChannel = "instagram" | "telegram";

export type ContactOption = {
  channel: ContactChannel;
  label: string;
  code: string;
};

// Ссылка приходит закодированной и раскрывается только по клику человека:
// в HTML нет готовых адресов профилей, которые собирают боты
export function openContact({ code }: Pick<ContactOption, "code">) {
  window.open(atob(code), "_blank", "noopener");
}
