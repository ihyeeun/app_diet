import { Camera } from "lucide-react";

import styles from "./FloatingCameraButton.module.css";

type FloatingCameraButtonProps = {
  onClick: () => void;
  ariaLabel: string;
  tone?: "primary" | "light";
  bottomOffset?: number;
};

export function FloatingCameraButton({
  onClick,
  ariaLabel,
  tone = "primary",
  bottomOffset = 70,
}: FloatingCameraButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${tone === "primary" ? styles.primary : styles.light}`}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{ bottom: `calc(var(--safe-area-bottom) + ${bottomOffset}px)` }}
    >
      <Camera size={24} />
    </button>
  );
}
