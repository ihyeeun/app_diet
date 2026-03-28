import style from "@/features/home/styles/TodayScoreSection.module.css";
import { useTargetNutritionQuery } from "@/features/home/hooks/queries/useTargetNutritionQuery";
import { useDayMealsQuery } from "@/features/meal-record/hooks/queries/useDayMealsQuery";
import { PATH } from "@/router/path";
import ScoreProgress from "@/shared/commons/progress/Progress";
import {
  useSetTargets,
  useTargetsLoadedState,
  useTargetsState,
} from "@/shared/stores/targetNutrition.store";
import {
  calculateNutritionScore,
  getNutritionGradeLabel,
  toMacroRatiosFromGrams,
} from "@/shared/utils/nutritionScore";
import type { MealRecordResponseDto } from "@/shared/api/types/nutrition.dto";
import type { ReactNode } from "react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDateKey } from "@/shared/utils/dateFormat";

export default function PreviewTodayScoreSection() {
  const navigation = useNavigate();
  const dateKey = useMemo(() => formatDateKey(new Date()), []);
  const storedTargets = useTargetsState();
  const setTargets = useSetTargets();
  const hasTargetsLoaded = useTargetsLoadedState();
  const { data: fallbackTargets, isPending: isFallbackTargetsPending } = useTargetNutritionQuery(
    hasTargetsLoaded && storedTargets === null,
  );

  useEffect(() => {
    if (storedTargets !== null || fallbackTargets == null) {
      return;
    }

    setTargets(fallbackTargets);
  }, [fallbackTargets, setTargets, storedTargets]);

  const targets = storedTargets ?? fallbackTargets ?? null;
  const {
    data: dayMeals,
    isPending: isDayMealsPending,
    isError: isDayMealsError,
  } = useDayMealsQuery(dateKey);

  const summary = useMemo(() => summarizeDayMeals(dayMeals), [dayMeals]);
  const isSummaryReady = !isDayMealsPending && !isDayMealsError;

  const nutritionScore = useMemo(() => {
    if (!targets || !isSummaryReady) {
      return null;
    }

    return calculateNutritionScore({
      actualCalories: summary.calories,
      targetCalories: targets.target_calories,
      actualMacroRatios: toMacroRatiosFromGrams({
        carbohydrate: summary.carbs,
        protein: summary.protein,
        fat: summary.fat,
      }),
      targetMacroRatios: {
        carbohydrate: targets.target_ratio[0],
        protein: targets.target_ratio[1],
        fat: targets.target_ratio[2],
      },
    });
  }, [isSummaryReady, summary.calories, summary.carbs, summary.fat, summary.protein, targets]);

  const score = nutritionScore?.totalScore ?? null;
  const balanceLabel = nutritionScore
    ? getNutritionGradeLabel(nutritionScore.macroBalanceGrade)
    : null;
  const currentCaloriesLabel = isSummaryReady ? summary.calories.toLocaleString() : "--";
  const targetCaloriesLabel =
    targets && Number.isFinite(targets.target_calories)
      ? targets.target_calories.toLocaleString()
      : "--";
  const targetLoading = hasTargetsLoaded && storedTargets === null && isFallbackTargetsPending;
  const calorieGuideMessage = buildCalorieGuideMessage({
    isDayMealsPending,
    isDayMealsError,
    targetLoading,
    targetCalories: targets?.target_calories,
    currentCalories: summary.calories,
  });
  const balanceGuideMessage = balanceLabel
    ? `탄단지 균형은 ${balanceLabel}해요`
    : "탄단지 목표 정보가 없어요";

  return (
    <button
      className={style.content}
      type="button"
      onClick={() => {
        navigation(PATH.TODAY_MEAL_SCORE);
      }}
    >
      <div className={style.score_container}>
        <div className={style.score_title_container}>
          <div className={style.score_title_text_container}>
            <p className="typo-title2">오늘의 식사는</p>

            <p className={style.score_text}>
              <span className={`${style.score} typo-h2`}>{score ?? "--"}</span>
              <span className={`${style.unit} typo-title2`}>점</span>

              <span className={`${style.calorie_text} typo-title4`}>
                (<span>{currentCaloriesLabel}</span> / <span>{targetCaloriesLabel}</span> kcal)
              </span>
            </p>
          </div>

          <img src="/icons/heart_smile.svg" className={style.img_container} aria-hidden="true" />
        </div>

        <ScoreProgress value={score ?? 0} variant="primary-white" />
      </div>
      <div className={style.badge_container}>
        <Badge>{calorieGuideMessage}</Badge>
        <Badge>👣 걸음으로 +300kcal</Badge>
        <Badge>{balanceGuideMessage}</Badge>
      </div>
    </button>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <div className={style.badge_content_container}>
      <p className="typo-body4">{children}</p>
    </div>
  );
}

function toSafeNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 0;
  }

  return value;
}

function summarizeDayMeals(dayMeals: MealRecordResponseDto | undefined) {
  if (!dayMeals) {
    return {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
    };
  }

  return dayMeals.meal_list.reduce(
    (total, meal) => {
      meal.menu_list.forEach((menu) => {
        const menuWithMacro = menu as {
          calories?: number;
          carbs?: number | null;
          protein?: number | null;
          fat?: number | null;
        };

        total.calories += toSafeNumber(menuWithMacro.calories);
        total.carbs += toSafeNumber(menuWithMacro.carbs);
        total.protein += toSafeNumber(menuWithMacro.protein);
        total.fat += toSafeNumber(menuWithMacro.fat);
      });

      return total;
    },
    {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
    },
  );
}

function buildCalorieGuideMessage({
  isDayMealsPending,
  isDayMealsError,
  targetLoading,
  targetCalories,
  currentCalories,
}: {
  isDayMealsPending: boolean;
  isDayMealsError: boolean;
  targetLoading: boolean;
  targetCalories: number | undefined;
  currentCalories: number;
}) {
  if (isDayMealsPending || targetLoading) {
    return "오늘 식사/목표 정보를 불러오는 중이에요";
  }

  if (isDayMealsError) {
    return "오늘 식사 정보를 불러오지 못했어요";
  }

  if (targetCalories === undefined) {
    return "목표 칼로리 API 연동 예정이에요";
  }

  const diff = Math.round(targetCalories - currentCalories);
  if (diff > 0) {
    return `아직 ${diff.toLocaleString()}kcal 더 먹을 수 있어요`;
  }

  if (diff < 0) {
    return `${Math.abs(diff).toLocaleString()}kcal 초과했어요`;
  }

  return "오늘 목표 칼로리를 달성했어요";
}
