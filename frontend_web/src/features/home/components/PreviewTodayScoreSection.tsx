import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ActionCard from "@/features/home/components/cards/ActionCard";
import { queryKeys } from "@/features/home/hooks/queries/queryKey";
import { useDayMealsQuery } from "@/features/home/hooks/queries/useDayMealsQuery";
import style from "@/features/home/styles/PreviewTodayScoreSection.module.css";
import type { DayMealSummary } from "@/features/home/utils/dayMealSummary";
import {
  getCalorieSummary,
  getHomeMealFeedback,
  hasValidTargets,
  resolveTargetCalories,
} from "@/features/home/utils/todayMealFeedback";
import { useGetProfileQuery } from "@/features/profile/hooks/queries/useProfileQuery";
import { PATH } from "@/router/path";
import ScoreProgress from "@/shared/commons/progress/Progress";
import { toast } from "@/shared/commons/toast/toast";
import {
  useSetTargets,
  useTargetsLoadedState,
  useTargetsState,
} from "@/shared/stores/targetNutrient.store";
import {
  calculateDailyNutritionMetrics,
  getCalorieProgressPercent,
} from "@/shared/utils/nutrientScore";

export default function PreviewTodayScoreSection({ selectedDate }: { selectedDate: string }) {
  const navigation = useNavigate();

  const { isPending: isSummaryPending } = useDayMealsQuery(selectedDate);

  const queryClient = useQueryClient();
  const dayMealSummary = queryClient.getQueryData<DayMealSummary>(queryKeys.dayMeals(selectedDate));

  const targets = useTargetsState();
  const setTargets = useSetTargets();
  const hasTargetsLoaded = useTargetsLoadedState();
  const targetCalories = resolveTargetCalories(targets);
  const hasTargetCalories = targetCalories !== null;
  const shouldFetchProfile = hasTargetsLoaded && !hasTargetCalories;
  const { data: profile, isPending: isProfilePending } = useGetProfileQuery({
    enabled: shouldFetchProfile,
  });

  useEffect(() => {
    if (!profile || hasTargetCalories) {
      return;
    }

    setTargets({
      target_calories: profile.target_calories,
      target_ratio: profile.target_ratio,
    });
  }, [hasTargetCalories, profile, setTargets]);

  const nutritionMetrics =
    hasValidTargets(targets) && dayMealSummary
      ? calculateDailyNutritionMetrics({
          actualCalories: dayMealSummary.totalCalories,
          targetCalories: targets.target_calories,
          actualMacrosInGram: {
            carbs: dayMealSummary.totalNutrients.carbs,
            protein: dayMealSummary.totalNutrients.protein,
            fat: dayMealSummary.totalNutrients.fat,
          },
          targetMacroRatios: {
            carbs: targets.target_ratio[0],
            protein: targets.target_ratio[1],
            fat: targets.target_ratio[2],
          },
        })
      : null;

  const score = nutritionMetrics?.score.totalScore ?? null;
  const calorieSummary = getCalorieSummary(dayMealSummary?.totalCalories ?? 0, targetCalories);
  const mealFeedback = getHomeMealFeedback(dayMealSummary, targets);
  const statusMessage =
    shouldFetchProfile && isProfilePending ? "목표 정보를 불러오는 중이에요" : null;

  const handleTodayMealScoreClick = () => {
    if (!hasValidTargets(targets)) {
      toast.warning("목표 칼로리 설정 후 이용할 수 있어요");
      return;
    }

    if (score === null || !dayMealSummary) {
      // TODO 새로고침하거나 그런 동작을 넣어야할거같은데
      return;
    }

    navigation(PATH.TODAY_MEAL_SCORE, {
      state: {
        score,
        targets: targets,
        currents: dayMealSummary,
        calorieMessage: calorieSummary.message,
        mealFeedback,
      },
    });
  };

  if (isSummaryPending) {
    // TODO : skeleton UI
    return <p>로딩 중</p>;
  }

  return (
    <ActionCard className={style.content} onClick={handleTodayMealScoreClick}>
      <div className={style.scoreDescription}>
        <div className={style.scoreTitleText}>
          <p className="typo-title3">{mealFeedback.primary}</p>
          <p className="typo-title3">{mealFeedback.secondary}</p>
        </div>

        <ChevronRight size={24} />
      </div>

      <div className={style.scoreContainer}>
        <div className={style.scoreTextContainer}>
          <div className={style.scoreText}>
            <p className={`${style.calorieText} typo-title2`}>
              <span className={`${style.score} typo-h2`}>
                {calorieSummary.roundedCurrentCalories.toLocaleString("ko-KR")}
              </span>
              {"/ "}
              {calorieSummary.roundedTargetCalories !== null
                ? calorieSummary.roundedTargetCalories.toLocaleString("ko-KR")
                : "--"}{" "}
              kcal
            </p>

            <div className={style.dividerContainer} />

            <span className={`typo-title2`}>{score ?? "--"}점</span>
          </div>

          <ScoreProgress
            value={
              nutritionMetrics?.calorieProgressPercent ??
              getCalorieProgressPercent(dayMealSummary?.totalCalories || 0, targetCalories ?? 0)
            }
            variant="primary-white"
          />
        </div>

        <Badge>{statusMessage ?? calorieSummary.message}</Badge>
      </div>
    </ActionCard>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <div className={style.badgeContentContainer}>
      <p className="typo-body4">{children}</p>
    </div>
  );
}
