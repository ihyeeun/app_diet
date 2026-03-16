export const ONBOARDING_HEIGHT_RANGE = {
  min: 1,
  max: 250,
} as const;

export const ONBOARDING_WEIGHT_RANGE = {
  min: 1,
  max: 200,
} as const;

export function isInRange(value: number | undefined, min: number, max: number) {
  if (value === undefined) return false;
  return value >= min && value <= max;
}
