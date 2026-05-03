import type { ComponentType } from "react";

import SteptargetCalories from "@/features/onboarding/components/steps/StepGoalCalories";
import { isValidBirthYear } from "@/shared/commons/picker/yearOptions";

import type { StepComponentProps, StepId, StepMeta } from "../../onboarding.types";
import StepActivity from "./StepActivity";
import StepBirthYear from "./StepBirthYear";
import StepBody from "./StepBody";
import StepGender from "./StepGender";
import StepGoal from "./StepGoal";
import StepGoalWeight from "./StepGoalWeight";
import StepNutrient from "./StepNutrient";
import StepSubscribedCode from "./StepSubscribedCode";

const hasSelectedValue = (value?: number | null) => value !== undefined && value !== null;

export const STEP_COMPONENTS: Record<StepId, ComponentType<StepComponentProps>> = {
  gender: StepGender,
  birthYear: StepBirthYear,
  body: StepBody,
  activity: StepActivity,
  goal: StepGoal,
  goalWeight: StepGoalWeight,
  targetCalories: SteptargetCalories,
  nutrient: StepNutrient,
  subscribedCode: StepSubscribedCode,
};

const BASE_STEPS: StepMeta[] = [
  {
    id: "gender",
    title: "성별",
    isValid: (d) => hasSelectedValue(d.gender),
  },
  {
    id: "birthYear",
    title: "출생연도",
    isValid: (d) => isValidBirthYear(d.birthYear),
  },
  {
    id: "body",
    title: "키 / 몸무게",
    isValid: (d) => !!d.height && !!d.weight,
  },
  {
    id: "activity",
    title: "활동량",
    isValid: (d) => hasSelectedValue(d.activity),
  },
  {
    id: "goal",
    title: "목표",
    isValid: (d) => hasSelectedValue(d.goal),
  },
  {
    id: "goalWeight",
    title: "목표 체중",
    isValid: (d) => !!d.target_weight,
  },
  {
    id: "targetCalories",
    title: "목표 칼로리",
    isValid: () => true,
  },
  {
    id: "nutrient",
    title: "탄단지 비율 선택",
    isValid: () => true,
  },
];

const SUBSCRIBED_CODE_STEP: StepMeta = {
  id: "subscribedCode",
  title: "코드 입력",
  isValid: () => true,
};

type OnboardingStepOptions = {
  showSubscribedCodeStep: boolean;
};

export function getOnboardingSteps({ showSubscribedCodeStep }: OnboardingStepOptions): StepMeta[] {
  const steps = showSubscribedCodeStep ? [...BASE_STEPS, SUBSCRIBED_CODE_STEP] : [...BASE_STEPS];
  const lastStepIndex = steps.length - 1;

  return steps.map((step, index) => ({
    ...step,
    nextText: index === lastStepIndex ? "시작" : undefined,
  }));
}
