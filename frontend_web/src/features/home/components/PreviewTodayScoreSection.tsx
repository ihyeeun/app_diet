import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import ActionCard from "@/features/home/components/cards/ActionCard";
import { queryKeys } from "@/features/home/hooks/queries/queryKey";
import { useDayMealsQuery } from "@/features/home/hooks/queries/useDayMealsQuery";
import style from "@/features/home/styles/PreviewTodayScoreSection.module.css";
import type { DayMealSummary } from "@/features/home/utils/dayMealSummary";
import { PATH } from "@/router/path";
import ScoreProgress from "@/shared/commons/progress/Progress";
import { useTargetsState } from "@/shared/stores/targetNutrient.store";
import { calculateNutrientScore, toMacroRatiosFromGrams } from "@/shared/utils/nutrientScore";

export default function PreviewTodayScoreSection({ selectedDate }: { selectedDate: string }) {
  const navigation = useNavigate();

  const { isPending: isSummaryReady } = useDayMealsQuery(selectedDate);

  const queryClient = useQueryClient();
  const dayMealSummary = queryClient.getQueryData<DayMealSummary>(queryKeys.dayMeals(selectedDate));

  const targets = useTargetsState();

  const mealScore = () => {
    if (!targets) {
      return null;
    }

    return calculateNutrientScore({
      actualCalories: dayMealSummary?.totalCalories ?? 0,
      targetCalories: targets.target_calories,
      actualMacroRatios: toMacroRatiosFromGrams({
        carbs: dayMealSummary?.totalNutrients.carbs ?? 0,
        protein: dayMealSummary?.totalNutrients.protein ?? 0,
        fat: dayMealSummary?.totalNutrients.fat ?? 0,
      }),
      targetMacroRatios: {
        carbs: targets.target_ratio[0],
        protein: targets.target_ratio[1],
        fat: targets.target_ratio[2],
      },
    });
  };

  const score = mealScore()?.totalScore ?? null;

  const calorieDiff = Math.round(
    (targets?.target_calories || 0) - (dayMealSummary?.totalCalories || 0),
  );
  const calorieMessage =
    calorieDiff > 0
      ? `아직 ${calorieDiff.toLocaleString("ko-KR")}kcal 더 먹을 수 있어요`
      : calorieDiff < 0
        ? `${Math.abs(calorieDiff).toLocaleString("ko-KR")}kcal 초과했어요`
        : "오늘 목표 칼로리를 달성했어요";

  const handleTodayMealScoreClick = () => {
    if (!targets) {
      // TODO 목표 칼로리 조회하는 QUERY 연결하기
    }

    if (!score || !dayMealSummary || !targets) {
      // TODO 새로고침하거나 그런 동작을 넣어야할거같은데
      return;
    }

    navigation(PATH.TODAY_MEAL_SCORE, {
      state: {
        score,
        targets: targets,
        currents: dayMealSummary,
        calorieMessage,
      },
    });
  };

  if (isSummaryReady) {
    // TODO : skeleton UI
    return <p>로딩 중</p>;
  }

  return (
    <ActionCard className={style.content} onClick={handleTodayMealScoreClick}>
      <div className={style.score_container}>
        <div className={style.score_title_container}>
          <div className={style.score_title_text_container}>
            <p className="typo-title2">오늘의 식사는</p>

            <p className={style.score_text}>
              <span className={`${style.score} typo-h2`}>{score ?? "--"}</span>
              <span className={`${style.unit} typo-title2`}>점</span>

              <span className={`${style.calorie_text} typo-title4`}>
                (<span>{dayMealSummary?.totalCalories?.toLocaleString("ko-KR")}</span> /{" "}
                <span>{targets?.target_calories?.toLocaleString("ko-KR")}</span> kcal)
              </span>
            </p>
          </div>

          <img src="/icons/heart_smile.svg" className={style.img_container} aria-hidden="true" />
        </div>

        <ScoreProgress value={score ?? 0} variant="primary-white" />
      </div>
      <div className={style.badge_container}>
        <Badge>{calorieMessage}</Badge>
      </div>
    </ActionCard>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <div className={style.badge_content_container}>
      <p className="typo-body4">{children}</p>
    </div>
  );
}
