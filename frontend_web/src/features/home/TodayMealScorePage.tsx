import { useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import styles from "@/features/home/styles/TodayMealScorePage.module.css";
import { Button } from "@/shared/commons/button/Button";
import {
  calculateMacroPercentToGram,
  getCalorieProgressPercent,
  type MacroKey,
} from "@/shared/utils/nutritionScore";
import ScoreProgress from "@/shared/commons/progress/Progress";

type NutrientItem = {
  key: MacroKey;
  name: "탄수화물" | "단백질" | "지방";
  current: number;
  target: number;
};

export default function TodayMealScorePage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [carbsRatio, proteinRatio, fatRatio] = state.targets.target_ratio;
  const targetCalories = state.targets.target_calories;
  const nutrientItems = [
    {
      key: "carbs",
      name: "탄수화물",
      current: state.currents.totalNutrients.carbs,
      target: Math.round(
        calculateMacroPercentToGram({
          nutrientType: "carbs",
          totalCalories: targetCalories,
          percent: carbsRatio,
        }),
      ),
    },
    {
      key: "protein",
      name: "단백질",
      current: state.currents.totalNutrients.protein,
      target: Math.round(
        calculateMacroPercentToGram({
          nutrientType: "protein",
          totalCalories: targetCalories,
          percent: proteinRatio,
        }),
      ),
    },
    {
      key: "fat",
      name: "지방",
      current: state.currents.totalNutrients.fat,
      target: Math.round(
        calculateMacroPercentToGram({
          nutrientType: "fat",
          totalCalories: targetCalories,
          percent: fatRatio,
        }),
      ),
    },
  ] satisfies NutrientItem[];

  const calorieProgress = getCalorieProgressPercent(state.currents.totalCalories, targetCalories);

  return (
    <section className={styles.page}>
      <PageHeader title="오늘의 식사 분석" onBack={() => navigate(-1)} />

      <main className={styles.content}>
        <section className={styles.meal_score_section}>
          <div className={styles.score_card}>
            <p className="typo-title2">오늘의 식사 점수</p>
            <p>
              <span className={`${styles.score} typo-h2`}>{state.score}</span>
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
                <span className={`${styles.score} typo-h2`}>
                  {state.currents.totalCalories.toLocaleString("ko-KR")}
                </span>{" "}
                kcal
              </p>

              <div className={styles.divider_container}>
                <div className="divider-horizontal" />
              </div>

              <p className="typo-title2">
                {state.targets.target_calories.toLocaleString("ko-KR")} kcal
              </p>
            </div>

            <ScoreProgress value={calorieProgress} variant="primary-gray" />
            <p className="typo-label4">{state.calorieMessage}</p>
          </div>
        </section>

        <section className={styles.balance_section}>
          <div className={styles.balance_card}>
            <div className={styles.balance_header}>
              <div className={styles.balance_title_container}>
                <p className="typo-title3">탄단지 균형</p>
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

            {/* <div className={styles.balance_chart}>
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
            </div> */}

            <div className="divider" />

            <div className={styles.nutrient_list}>
              {nutrientItems.map((item) => (
                <article key={item.name} className={styles.nutrient_item}>
                  <div className={styles.nutrient_header}>
                    <p className={styles.nutrient_title}>
                      <span className="typo-title4">{item.name}</span>
                      <span className={`${styles.nutrient_amount} typo-label4`}>
                        {item.current.toLocaleString("ko-KR")}g /{" "}
                        {item.target.toLocaleString("ko-KR")}g
                      </span>
                    </p>

                    {/* <StatusBadge status={item.grade} /> */}
                  </div>

                  {/* <ScoreProgress
                    value={getProgressPercent(item.currentPercent)}
                    variant="black-gray"
                  /> */}
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
