export const GENDER = {
  male: "male",
  female: "female",
} as const;

export type Gender = keyof typeof GENDER;

export type OnboardingData = {
  gender?: Gender;
  birthYear?: number;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: number;
  goal?: number;
  goalWeightKg?: number;
  goalKalories?: number;
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
  | "goalKalories"
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
