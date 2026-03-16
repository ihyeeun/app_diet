import type { StepComponentProps, StepId, StepMeta } from "../../onboarding.types";
import StepGender from "./StepGender";
import StepBirthYear from "./StepBirthYear";
import StepBody from "./StepBody";
import StepActivity from "./StepActivity";
import StepGoal from "./StepGoal";
import StepGoalWeight from "./StepGoalWeight";
import StepSubscribedCode from "./StepSubscribedCode";
import type { ComponentType } from "react";

import StepNutrient from "./StepNutrient";
import { isValidBirthYear } from "@/shared/commons/picker/yearOptions";
import SteptargetCalories from "@/features/onboarding/components/steps/StepGoalCalories";

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

export const STEPS: StepMeta[] = [
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
    isValid: (d) => !!d.goalweight,
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
  {
    id: "subscribedCode",
    title: "코드 입력",
    isValid: () => true,
    nextText: "완료",
  },
];
