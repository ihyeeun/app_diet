import { Camera } from "lucide-react";
import styles from "../styles/MealRecordFloatingCameraButton.module.css";

type MealRecordFloatingCameraButtonProps = {
  onClick: () => void;
  ariaLabel: string;
  tone?: "primary" | "light";
};

export function MealRecordFloatingCameraButton({
  onClick,
  ariaLabel,
  tone = "primary",
}: MealRecordFloatingCameraButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${tone === "primary" ? styles.primary : styles.light}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <Camera size={24} />
    </button>
  );
}
