import styles from "./StatusBadge.module.css";
import { getNutritionStatusByPercent } from "./StatusBadge.utils";

export type NutritionStatus = "appropriate" | "normal" | "slightlyUnbalanced" | "unbalanced";

const STATUS_LABEL: Record<NutritionStatus, string> = {
  appropriate: "적절",
  normal: "보통",
  slightlyUnbalanced: "약간 불균형",
  unbalanced: "불균형",
};

const DOT_CLASS: Record<NutritionStatus, string> = {
  appropriate: styles.appropriate,
  normal: styles.normal,
  slightlyUnbalanced: styles.slightlyUnbalanced,
  unbalanced: styles.unbalanced,
};

type StatusBadgeProps = {
  status?: NutritionStatus;
  percent?: number;
  label?: string;
  className?: string;
};

export function StatusBadge({ status, percent, label, className }: StatusBadgeProps) {
  const resolvedStatus = status ?? getNutritionStatusByPercent(percent ?? 0);
  const classes = [styles.badge, className ?? ""].filter(Boolean).join(" ");

  return (
    <span className={classes}>
      <span className={`${styles.dot} ${DOT_CLASS[resolvedStatus]}`} aria-hidden="true" />
      <span className={`${styles.label} typo-label4`}>{label ?? STATUS_LABEL[resolvedStatus]}</span>
    </span>
  );
}
