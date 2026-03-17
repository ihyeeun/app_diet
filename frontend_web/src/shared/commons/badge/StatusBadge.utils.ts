import type { NutritionStatus } from "./StatusBadge";

export function getNutritionStatusByPercent(percent: number): NutritionStatus {
  if (percent >= 85 && percent <= 100) {
    return "appropriate";
  }

  if (percent >= 70 && percent <= 84) {
    return "normal";
  }

  if (percent >= 50 && percent <= 69) {
    return "slightlyUnbalanced";
  }

  return "unbalanced";
}
