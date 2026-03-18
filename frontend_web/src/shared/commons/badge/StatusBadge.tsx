import styles from "./StatusBadge.module.css";
import { getNutritionStatusByPercent } from "./StatusBadge.utils";
import type { NutritionGrade } from "@/shared/utils/nutritionScore";

export type NutritionStatus = NutritionGrade;

const STATUS_LABEL: Record<NutritionStatus, string> = {
  appropriate: "적절",
  slightlyUnbalanced: "보통",
  unbalanced: "약간 불균형",
  severelyUnbalanced: "불균형",
};

const DOT_CLASS: Record<NutritionStatus, string> = {
  appropriate: styles.appropriate,
  slightlyUnbalanced: styles.slightlyUnbalanced,
  unbalanced: styles.unbalanced,
  severelyUnbalanced: styles.severelyUnbalanced,
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
