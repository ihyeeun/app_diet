export type OnboardingData = {
  gender?: number;
  birthYear?: number;
  height?: number;
  weight?: number;
  activity?: number;
  goal?: number;
  target_weight?: number;
  target_calories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  subscribedCode?: string;
};

export type StepId =
  | "gender"
  | "birthYear"
  | "body"
  | "activity"
  | "goal"
  | "goalWeight"
  | "targetCalories"
  | "nutrient"
  | "subscribedCode";

export type StepComponentProps = {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
};

export type StepMeta = {
  id: StepId;
  title: string;
  isValid: (data: OnboardingData) => boolean;
  nextText?: string;
};
