import type { NutritionStatus } from "./StatusBadge";

export function getNutritionStatusByPercent(percent: number): NutritionStatus {
  if (percent >= 85) {
    return "appropriate";
  }

  if (percent >= 70) {
    return "slightlyUnbalanced";
  }

  if (percent >= 50) {
    return "unbalanced";
  }

  return "severelyUnbalanced";
}
