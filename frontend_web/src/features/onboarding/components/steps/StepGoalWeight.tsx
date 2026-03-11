import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import { NumberInput } from "@/shared/commons/input/NumberInput";
import { Field } from "@base-ui/react";

export default function StepGoalWeight({ data, update }: StepComponentProps) {
  const diff =
    data.goalWeightKg !== undefined && data.weightKg !== undefined
      ? data.goalWeightKg - data.weightKg
      : undefined;

  return (
    <section>
      <div className="onboarding-title onboarding-title-group">
        <h2 className="typo-title1-semibold">목표 몸무게가 몇인가요?</h2>
        {diff !== undefined && (
          <p className="onboarding-subtitle">
            현재 몸무게 기준 {diff > 0 ? "+" : ""}
            {diff}kg
          </p>
        )}
      </div>

      <Field.Root className="onboarding-field-padding">
        <div className="onboarding-goal-weight-card">
          <NumberInput
            value={data.goalWeightKg}
            onChange={(value) => update({ goalWeightKg: value })}
            placeholder="55"
            min={1}
            max={200}
            step={0.1}
            unit="kg"
          />
        </div>
      </Field.Root>
    </section>
  );
}
