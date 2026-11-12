import styles from "./Button.module.scss";

export type ButtonVariant = "primary" | "outline" | "accent" | "outlineLight";

export function buttonClassName(
  variant: ButtonVariant = "primary",
  extraClassName?: string,
): string {
  return [styles.button, styles[variant], extraClassName].filter(Boolean).join(" ");
}
