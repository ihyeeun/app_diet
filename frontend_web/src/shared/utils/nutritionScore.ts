export type MacroKey = "carbohydrate" | "protein" | "fat";
export type NutritionGrade =
  | "appropriate"
  | "slightlyUnbalanced"
  | "unbalanced"
  | "severelyUnbalanced";

export type MacroRatios = Record<MacroKey, number>;
export type MacroGrams = Record<MacroKey, number>;

export type MacroScoreDetail = {
  actualRatio: number;
  targetRatio: number;
  deviation: number;
  score: number;
  grade: NutritionGrade;
};

export type NutritionScoreResult = {
  totalScore: number;
  calorieScore: number;
  macroScore: number;
  calorieDiffPercent: number;
  macroAverageDeviation: number;
  overallGrade: NutritionGrade;
  overallMessage: string;
  macroBalanceGrade: NutritionGrade;
  macro: Record<MacroKey, MacroScoreDetail>;
};

type NutritionScoreInput = {
  actualCalories: number;
  targetCalories: number;
  actualMacroRatios: MacroRatios;
  targetMacroRatios: MacroRatios;
};

const MACRO_MAX_SCORE: Record<MacroKey, number> = {
  carbohydrate: 17,
  protein: 17,
  fat: 16,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundTo(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normalizeRatios(ratios: MacroRatios): MacroRatios {
  const total = ratios.carbohydrate + ratios.protein + ratios.fat;
  if (total <= 0) {
    return { carbohydrate: 0, protein: 0, fat: 0 };
  }

  return {
    carbohydrate: (ratios.carbohydrate / total) * 100,
    protein: (ratios.protein / total) * 100,
    fat: (ratios.fat / total) * 100,
  };
}

function getGradeByDeviation(deviation: number): NutritionGrade {
  if (deviation <= 5) return "appropriate";
  if (deviation <= 10) return "slightlyUnbalanced";
  if (deviation <= 15) return "unbalanced";
  return "severelyUnbalanced";
}

function getMacroItemScore(key: MacroKey, deviation: number) {
  const maxScore = MACRO_MAX_SCORE[key];
  if (deviation <= 5) return maxScore;
  if (deviation <= 10) return key === "fat" ? 13 : 14;
  if (deviation <= 15) return key === "fat" ? 9 : 10;
  return key === "fat" ? 4 : 5;
}

function getCalorieScoreByDiff(calorieDiffPercent: number) {
  if (calorieDiffPercent <= 5) return 50;
  if (calorieDiffPercent <= 10) return 40;
  if (calorieDiffPercent <= 15) return 30;
  if (calorieDiffPercent <= 20) return 20;
  return 10;
}

export function getNutritionGradeLabel(grade: NutritionGrade) {
  if (grade === "appropriate") return "적절";
  if (grade === "slightlyUnbalanced") return "약간 불균형";
  if (grade === "unbalanced") return "불균형";
  return "심한 불균형";
}

export function getNutritionGuideMessageByScore(score: number) {
  if (score >= 85) {
    return "아주 좋아요! 섭취량과 균형이 모두 잘 맞고 있어요 👏";
  }
  if (score >= 70) {
    return "조금만 조정하면 더 좋아요. 섭취량이나 일부 영양소가 살짝 어긋났어요.";
  }
  if (score >= 50) {
    return "오늘 식단이 조금 흔들렸어요. 칼로리나 영양 균형을 한 번 점검해보세요.";
  }
  return "오늘은 식단 균형이 많이 어긋났어요. 다음 식사에서 천천히 맞춰가면 돼요.";
}

export function getNutritionGradeByScore(score: number): NutritionGrade {
  if (score >= 85) return "appropriate";
  if (score >= 70) return "slightlyUnbalanced";
  if (score >= 50) return "unbalanced";
  return "severelyUnbalanced";
}

export function calculateCalorieDiffPercent(actualCalories: number, targetCalories: number) {
  if (targetCalories <= 0) return 0;
  return Math.abs((actualCalories - targetCalories) / targetCalories) * 100;
}

export function calculateCalorieIntakePercent(actualCalories: number, targetCalories: number) {
  if (targetCalories <= 0) return 0;
  return Math.round((actualCalories / targetCalories) * 100);
}

export function getCalorieProgressPercent(actualCalories: number, targetCalories: number) {
  const percent = calculateCalorieIntakePercent(actualCalories, targetCalories);
  return clamp(percent, 0, 100);
}

export function toMacroRatiosFromGrams(grams: MacroGrams): MacroRatios {
  return normalizeRatios(grams);
}

export function calculateNutritionScore({
  actualCalories,
  targetCalories,
  actualMacroRatios,
  targetMacroRatios,
}: NutritionScoreInput): NutritionScoreResult {
  const normalizedActual = normalizeRatios(actualMacroRatios);
  const normalizedTarget = normalizeRatios(targetMacroRatios);

  const carbohydrateDeviation = Math.abs(
    normalizedActual.carbohydrate - normalizedTarget.carbohydrate,
  );
  const proteinDeviation = Math.abs(normalizedActual.protein - normalizedTarget.protein);
  const fatDeviation = Math.abs(normalizedActual.fat - normalizedTarget.fat);

  const macro: Record<MacroKey, MacroScoreDetail> = {
    carbohydrate: {
      actualRatio: roundTo(normalizedActual.carbohydrate),
      targetRatio: roundTo(normalizedTarget.carbohydrate),
      deviation: roundTo(carbohydrateDeviation),
      score: getMacroItemScore("carbohydrate", carbohydrateDeviation),
      grade: getGradeByDeviation(carbohydrateDeviation),
    },
    protein: {
      actualRatio: roundTo(normalizedActual.protein),
      targetRatio: roundTo(normalizedTarget.protein),
      deviation: roundTo(proteinDeviation),
      score: getMacroItemScore("protein", proteinDeviation),
      grade: getGradeByDeviation(proteinDeviation),
    },
    fat: {
      actualRatio: roundTo(normalizedActual.fat),
      targetRatio: roundTo(normalizedTarget.fat),
      deviation: roundTo(fatDeviation),
      score: getMacroItemScore("fat", fatDeviation),
      grade: getGradeByDeviation(fatDeviation),
    },
  };

  const macroScore = macro.carbohydrate.score + macro.protein.score + macro.fat.score;
  const calorieDiffPercent = calculateCalorieDiffPercent(actualCalories, targetCalories);
  const calorieScore = getCalorieScoreByDiff(calorieDiffPercent);
  const totalScore = clamp(calorieScore + macroScore, 0, 100);

  const macroAverageDeviation = roundTo(
    (carbohydrateDeviation + proteinDeviation + fatDeviation) / 3,
  );
  const macroBalanceGrade = getGradeByDeviation(macroAverageDeviation);
  const overallGrade = getNutritionGradeByScore(totalScore);

  return {
    totalScore,
    calorieScore,
    macroScore,
    calorieDiffPercent: roundTo(calorieDiffPercent),
    macroAverageDeviation,
    overallGrade,
    overallMessage: getNutritionGuideMessageByScore(totalScore),
    macroBalanceGrade,
    macro,
  };
}
