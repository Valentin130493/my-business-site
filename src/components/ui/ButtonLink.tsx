import type { AnchorHTMLAttributes } from "react";

import { buttonClassName, type ButtonVariant } from "./Button";

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant;
};

export function ButtonLink({
  variant = "primary",
  className,
  ...rest
}: ButtonLinkProps) {
  return <a className={buttonClassName(variant, className)} {...rest} />;
}
