import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import "./Button.css";

const MODERN_VARIANT_CLASS = {
  filled: "btn--variant-filled",
  outlined: "btn--variant-outlined",
  text: "btn--variant-text",
} as const;

const COLOR_CLASS = {
  primary: "btn--color-primary",
  assistive: "btn--color-assistive",
} as const;

const SIZE_CLASS = {
  small: "btn--size-small",
  medium: "btn--size-medium",
  large: "btn--size-large",
} as const;

const FORCED_STATE_CLASS = {
  default: "btn--state-default",
  hover: "btn--state-hover",
  pressed: "btn--state-pressed",
  disabled: "btn--state-disabled",
} as const;

type Variant = keyof typeof MODERN_VARIANT_CLASS;
type Color = keyof typeof COLOR_CLASS;
type Size = keyof typeof SIZE_CLASS;
type PreviewState = keyof typeof FORCED_STATE_CLASS;

type Props = React.ComponentProps<typeof BaseButton> & {
  variant?: Variant;
  color?: Color;
  size?: Size;
  state?: PreviewState;
  fullWidth?: boolean;
};

export function Button({
  variant = "filled",
  color,
  size = "medium",
  state = "default",
  fullWidth = false,
  className,
  ...props
}: Props) {
  const classes = [
    "btn",
    MODERN_VARIANT_CLASS[variant],
    COLOR_CLASS[color ?? "primary"],
    SIZE_CLASS[size],
    FORCED_STATE_CLASS[state],
    fullWidth && "btn--full",
    typeof className === "string" ? className : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <BaseButton {...props} type={props.type ?? "button"} className={classes} />;
}
