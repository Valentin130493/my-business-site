import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "outline" | "dark";

export function buttonClassName(
  variant: ButtonVariant = "primary",
  extraClassName?: string,
): string {
  return [styles.button, styles[variant], extraClassName].filter(Boolean).join(" ");
}
