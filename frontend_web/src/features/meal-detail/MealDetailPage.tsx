import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import styles from "./MealDetailPage.module.css";
import { Button } from "@/shared/commons/button/Button";
import ScoreProgress from "@/shared/commons/progress/Progress";
import { StatusBadge, type NutritionStatus } from "@/shared/commons/badge/StatusBadge";
import {
  calculateNutritionScore,
  clamp,
  getCalorieProgressPercent,
  toMacroRatiosFromGrams,
  type MacroKey,
} from "@/shared/utils/nutritionScore";

type NutrientBalanceItem = {
  key: MacroKey;
  name: string;
  current: number;
  target: number;
};

type NutrientMetricItem = NutrientBalanceItem & {
  currentPercent: number;
  grade: NutritionStatus;
};

// TODO: 서버 응답으로 대체
const nutrientDataFromServer: NutrientBalanceItem[] = [
  { key: "carbohydrate", name: "탄수화물", current: 210, target: 250 },
  { key: "protein", name: "단백질", current: 110, target: 130 },
  { key: "fat", name: "지방", current: 8, target: 60 },
];

function getPercent(current: number, target: number, max = 200) {
  if (target <= 0) return 0;

  const percent = (current / target) * 100;
  return Math.round(clamp(percent, 0, max));
}

function getProgressPercent(percent: number) {
  return Math.round(clamp(percent, 0, 100));
}

function getChartHeights(percent: number) {
  const safePercent = Math.round(clamp(percent, 0, 200));
  const maxPercent = Math.max(100, safePercent, 1);

  return {
    targetHeight: Math.round((100 / maxPercent) * 100),
    currentHeight: Math.round((safePercent / maxPercent) * 100),
  };
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString("ko-KR");
}

function toMacroGrams(items: NutrientBalanceItem[], key: "current" | "target") {
  return items.reduce<Record<MacroKey, number>>(
    (acc, item) => ({
      ...acc,
      [item.key]: item[key],
    }),
    {
      carbohydrate: 0,
      protein: 0,
      fat: 0,
    },
  );
}

function toNutrientMetrics(
  items: NutrientBalanceItem[],
  macroGrades: Record<MacroKey, NutritionStatus>,
): NutrientMetricItem[] {
  return items.map((item) => ({
    ...item,
    currentPercent: getPercent(item.current, item.target),
    grade: macroGrades[item.key],
  }));
}

export default function MealDetailPage() {
  const navigate = useNavigate();

  const currentKcal = 1800;
  const targetKcal = 2100;
  const currentMacroGrams = toMacroGrams(nutrientDataFromServer, "current");
  const targetMacroGrams = toMacroGrams(nutrientDataFromServer, "target");

  const nutritionScore = calculateNutritionScore({
    actualCalories: currentKcal,
    targetCalories: targetKcal,
    actualMacroRatios: toMacroRatiosFromGrams(currentMacroGrams),
    targetMacroRatios: toMacroRatiosFromGrams(targetMacroGrams),
  });
  const score = nutritionScore.totalScore;

  const calorieProgress = getCalorieProgressPercent(currentKcal, targetKcal);
  const calorieDiff = Math.round(targetKcal - currentKcal);
  const calorieMessage =
    calorieDiff > 0
      ? `아직 ${formatNumber(calorieDiff)}kcal 더 먹을 수 있어요`
      : calorieDiff < 0
        ? `${formatNumber(Math.abs(calorieDiff))}kcal 초과했어요`
        : "오늘 목표 칼로리를 달성했어요";

  const nutrientMetrics = toNutrientMetrics(nutrientDataFromServer, {
    carbohydrate: nutritionScore.macro.carbohydrate.grade,
    protein: nutritionScore.macro.protein.grade,
    fat: nutritionScore.macro.fat.grade,
  });

  return (
    <section className={styles.page}>
      <PageHeader title="오늘의 식사 분석" onBack={() => navigate(-1)} />

      <main className={styles.content}>
        <section className={styles.meal_score_section}>
          <div className={styles.score_card}>
            <p className="typo-title2">오늘의 식사 점수</p>
            <p>
              <span className={`${styles.score} typo-h2`}>{formatNumber(score)}</span>
              <span className="typo-title2"> 점</span>
            </p>
          </div>
        </section>

        <div className="divider" />

        <section className={styles.calorie_section}>
          <div className={styles.calorie_card}>
            <p className="typo-title3">칼로리</p>

            <div className={styles.calorie_value_container}>
              <p className="typo-title2">
                <span className={`${styles.score} typo-h2`}>{formatNumber(currentKcal)}</span> kcal
              </p>

              <div className={styles.divider_container}>
                <div className="divider-horizontal" />
              </div>

              <p className="typo-title2">{formatNumber(targetKcal)} kcal</p>
            </div>

            <ScoreProgress value={calorieProgress} variant="primary-gray" />
            <p className="typo-label4">{calorieMessage}</p>
          </div>
        </section>

        <section className={styles.balance_section}>
          <div className={styles.balance_card}>
            <div className={styles.balance_header}>
              <div className={styles.balance_title_container}>
                <p className="typo-title3">탄단지 균형</p>
                <StatusBadge status={nutritionScore.macroBalanceGrade} />
              </div>

              <div className={styles.legend_container}>
                <div className={styles.legend_item}>
                  <span className={`${styles.legend_dot} ${styles.legend_target_dot}`} />
                  <span className="typo-label4">목표</span>
                </div>
                <div className={styles.legend_item}>
                  <span className={`${styles.legend_dot} ${styles.legend_current_dot}`} />
                  <span className="typo-label4">현재</span>
                </div>
              </div>
            </div>

            <div className={styles.balance_chart}>
              {nutrientMetrics.map((item) => {
                const { targetHeight, currentHeight } = getChartHeights(item.currentPercent);

                return (
                  <div key={item.name} className={styles.chart_item}>
                    <div className={styles.chart_pair}>
                      <span
                        className={`${styles.chart_bar} ${styles.chart_target}`}
                        style={{ height: `${targetHeight}%` }}
                      />
                      <span
                        className={`${styles.chart_bar} ${styles.chart_current}`}
                        style={{ height: `${currentHeight}%` }}
                      />
                    </div>
                    <p className={`${styles.chart_label} typo-label4`}>{item.name}</p>
                  </div>
                );
              })}
            </div>

            <div className="divider" />

            <div className={styles.nutrient_list}>
              {nutrientMetrics.map((item) => (
                <article key={item.name} className={styles.nutrient_item}>
                  <div className={styles.nutrient_header}>
                    <p className={styles.nutrient_title}>
                      <span className="typo-title4">{item.name}</span>
                      <span className={`${styles.nutrient_amount} typo-label4`}>
                        ({formatNumber(item.current)}g / {formatNumber(item.target)}g)
                      </span>
                    </p>

                    <StatusBadge status={item.grade} />
                  </div>

                  <ScoreProgress
                    value={getProgressPercent(item.currentPercent)}
                    variant="black-gray"
                  />
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <Button
          onClick={() => navigate(-1)}
          variant="filled"
          state="default"
          size="large"
          color="primary"
          fullWidth
        >
          확인했어요
        </Button>
      </footer>
    </section>
  );
}
