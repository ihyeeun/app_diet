import { useEffect, useMemo } from "react";

import { useRecommendNutrientMutation } from "@/features/onboarding/hooks/mutations/useRecommendMutation";
import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import styles from "@/features/onboarding/styles/OnboardingSteps.module.css";
import NumberField from "@/shared/commons/input/NumberField";

const INTERNAL_DECIMALS = 4;
const NUTRIENT_ENERGY_PER_GRAM = {
  carbs: 4,
  protein: 4,
  fat: 9,
} as const;

type NutrientType = keyof typeof NUTRIENT_ENERGY_PER_GRAM;

function roundToPrecision(value: number, decimals: number) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function calculateTargetKcal(targetCalories: number, ratioPercent: number) {
  const kcal = (targetCalories * ratioPercent) / 100;
  return roundToPrecision(kcal, INTERNAL_DECIMALS);
}

function calculateTargetGram(targetKcal: number, nutrientType: NutrientType) {
  const gram = targetKcal / NUTRIENT_ENERGY_PER_GRAM[nutrientType];
  return roundToPrecision(gram, INTERNAL_DECIMALS);
}

function formatRoundedValue(value?: number) {
  if (value === undefined || Number.isNaN(value)) return "--";
  return Math.round(value).toString();
}

export default function StepNutrient({ data, update }: StepComponentProps) {
  const requestPayload = useMemo(
    () => ({
      targetCalories: data.targetCalories,
      weight: data.weight,
      goal: data.goal,
    }),
    [data.goal, data.targetCalories, data.weight],
  );

  const { mutate, data: nutrient } = useRecommendNutrientMutation();

  useEffect(() => {
    mutate(requestPayload);
  }, [mutate, requestPayload]);

  useEffect(() => {
    if (!nutrient) return;
    update({
      carbs: nutrient.carbs,
      protein: nutrient.protein,
      fat: nutrient.fat,
    });
  }, [nutrient, update]);

  return (
    <section className={styles.content}>
      <div
        className={`${styles.onboardingTitle} ${styles.onboardingTitleGroup} ${styles.onboardingTitleGroupCompact}`}
      >
        <h2 className="typo-title1">추천하는 탄단지 비율이에요</h2>
        <p className={styles.onboardingSubtitle}>비율을 수정할 수 있어요</p>
      </div>
      <div className={styles.onboardingNutrientContent}>
        <p className={styles.onboardingNutrientGoal}>
          목표 칼로리 {data.targetCalories ?? "--"}kcal
        </p>
        <div className={styles.onboardingNutrientList}>
          <NutrientCard
            label="탄수화물"
            nutrientType="carbs"
            targetCalories={data.targetCalories}
            value={data.carbs ?? 0}
            onChange={(v) => update({ carbs: v })}
          />
          <NutrientCard
            label="단백질"
            nutrientType="protein"
            targetCalories={data.targetCalories}
            value={data.protein ?? 0}
            onChange={(v) => update({ protein: v })}
          />
          <NutrientCard
            label="지방"
            nutrientType="fat"
            targetCalories={data.targetCalories}
            value={data.fat ?? 0}
            onChange={(v) => update({ fat: v })}
          />
        </div>
      </div>
    </section>
  );
}

type NutrientCardProps = {
  label: string;
  nutrientType: NutrientType;
  targetCalories?: number;
  value?: number;
  onChange: (v?: number) => void;
};

function NutrientCard({ label, nutrientType, targetCalories, value, onChange }: NutrientCardProps) {
  const targetKcal =
    value === undefined || targetCalories === undefined
      ? undefined
      : calculateTargetKcal(targetCalories, value);

  const targetGram =
    targetKcal === undefined ? undefined : calculateTargetGram(targetKcal, nutrientType);

  return (
    <div className={styles.onboardingNutrientCard}>
      <label className={styles.onboardingNutrientLabel}>{label}</label>
      <NumberField value={value} onChange={onChange} min={0} max={100} step={0.5} unit="%" />

      <div className={styles.onboardingNutrientDivider} />

      <div className={styles.onboardingNutrientMeta}>
        <span>{formatRoundedValue(targetGram)}g</span>
        <span>{formatRoundedValue(targetKcal)}kcal</span>
      </div>
    </div>
  );
}
