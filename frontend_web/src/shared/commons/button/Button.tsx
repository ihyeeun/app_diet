import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import "./Button.css";

const VARIANT_CLASS = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  ghost: "btn--ghost",
  danger: "btn--danger",
} as const;

const SIZE_CLASS = {
  sm: "btn--sm",
  md: "btn--md",
  lg: "btn--lg",
} as const;

type Variant = keyof typeof VARIANT_CLASS;
type Size = keyof typeof SIZE_CLASS;

type Props = React.ComponentProps<typeof BaseButton> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  ...props
}: Props) {
  return (
    <BaseButton
      {...props}
      type={props.type ?? "button"}
      className={
        ["btn", VARIANT_CLASS[variant], SIZE_CLASS[size], fullWidth && "btn--full"]
          .filter(Boolean)
          .join(" ") + (typeof className === "string" ? ` ${className}` : "")
      }
    />
  );
}
