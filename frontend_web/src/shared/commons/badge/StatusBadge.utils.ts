import type { NutrientStatus } from "./StatusBadge";

export function getNutrientStatusByPercent(percent: number): NutrientStatus {
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
