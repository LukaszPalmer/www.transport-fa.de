import type { ReactNode } from "react";
import { buttonClasses, type ButtonSize, type ButtonVariant } from "./button-styles";
import { Icon, type IconName } from "./Icon";
import { SmartLink } from "./SmartLink";

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon vor dem Label (z. B. Telefon, Login). */
  icon?: IconName;
  /** Pfeil hinter dem Label – mit Hover-Micro-Interaction. */
  withArrow?: boolean;
  className?: string;
  prefetch?: boolean;
  "aria-label"?: string;
}

/** Call-to-Action als Link (alle CTAs der Seite sind Navigationsziele). */
export function ButtonLink({
  href,
  children,
  variant,
  size,
  icon,
  withArrow,
  className,
  ...rest
}: ButtonLinkProps) {
  return (
    <SmartLink href={href} className={buttonClasses({ variant, size, className })} {...rest}>
      {icon && <Icon name={icon} className="size-[1.1em]" />}
      <span>{children}</span>
      {withArrow && (
        <Icon
          name="arrow-right"
          className="size-[1.1em] transition-transform duration-300 ease-out-expo group-hover/button:translate-x-1"
        />
      )}
    </SmartLink>
  );
}
