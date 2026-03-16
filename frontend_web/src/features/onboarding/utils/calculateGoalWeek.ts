import type { OnboardingData } from "@/features/onboarding/onboarding.types";

function hasRequiredGoalWeekBaseFields(
  data: OnboardingData,
): data is OnboardingData &
  Required<Pick<OnboardingData, "birthYear" | "weight" | "height" | "gender" | "activity" | "goal">> {
  return (
    data.birthYear !== undefined &&
    data.weight !== undefined &&
    data.height !== undefined &&
    data.gender !== undefined &&
    data.activity !== undefined &&
    data.goal !== undefined
  );
}

export function calculateTDEE(
  birthYear: number,
  weight: number,
  height: number,
  gender: number,
  activity: number,
): number {
  const age = new Date().getFullYear() - birthYear - 1; // 만 나이 기준
  let bmr = 10 * weight + 6.25 * height - 5 * age + 5;

  if (gender === 1) {
    bmr -= 166;
  }

  const activityFactor = 1.2 + 0.175 * activity;
  return bmr * activityFactor;
}

export function calculateGoalWeeks(
  weight: number,
  goal: number,
  targetWeight: number,
  targetCalories: number,
  tdee: number,
): number {
  if (goal === 1) {
    return 0;
  }

  const dailyDeltaCalories = Math.abs(targetCalories - tdee);

  if (dailyDeltaCalories === 0) {
    throw new Error("해당 값으로는 목표 달성이 불가능합니다.");
  }

  if (goal === 0 && targetCalories >= tdee) {
    throw new Error("해당 값으로는 목표 달성이 불가능합니다.");
  }

  if (goal === 2 && targetCalories <= tdee) {
    throw new Error("해당 값으로는 목표 달성이 불가능합니다.");
  }

  if (goal === 0 && targetWeight >= weight) {
    throw new Error("감량 목표에서는 목표 체중이 현재 체중보다 낮아야 합니다.");
  }

  if (goal === 2 && targetWeight <= weight) {
    throw new Error("증량 목표에서는 목표 체중이 현재 체중보다 높아야 합니다.");
  }

  const weightDiff = Math.abs(weight - targetWeight);
  return Math.ceil(weightDiff / ((dailyDeltaCalories * 7) / 7700));
}

export function calculateGoalWeek(data: OnboardingData, targetCalories: number): number {
  if (!hasRequiredGoalWeekBaseFields(data)) {
    throw new Error("목표 달성 기간 계산에 필요한 값이 부족합니다.");
  }

  if (data.goal === 1) {
    return 0;
  }

  if (data.goalweight === undefined) {
    throw new Error("목표 달성 기간 계산에 필요한 값이 부족합니다.");
  }

  const tdee = calculateTDEE(data.birthYear, data.weight, data.height, data.gender, data.activity);

  return calculateGoalWeeks(data.weight, data.goal, data.goalweight, targetCalories, tdee);
}
