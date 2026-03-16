import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import { ONBOARDING_WEIGHT_RANGE } from "@/features/onboarding/constants/inputRanges";
import { NumberInput } from "@/shared/commons/input/NumberInput";
import { Field } from "@base-ui/react";

export default function StepGoalWeight({ data, update }: StepComponentProps) {
  const diff =
    data.goalweight !== undefined && data.weight !== undefined
      ? Math.round((data.goalweight - data.weight) * 10) / 10
      : undefined;

  const diffLabel =
    diff === undefined ? undefined : Number.isInteger(diff) ? diff.toString() : diff.toFixed(1);

  return (
    <section>
      <div className="onboarding-title onboarding-title-group">
        <h2 className="typo-title1-semibold">목표 몸무게가 몇인가요?</h2>
        {diff !== undefined && (
          <p className="onboarding-subtitle">
            현재 몸무게 기준 {diff > 0 ? "+" : ""}
            {diffLabel}kg
          </p>
        )}
      </div>

      <Field.Root className="onboarding-field-padding">
        <div className="onboarding-goal-weight-card">
          <NumberInput
            value={data.goalweight}
            onChange={(value) => update({ goalweight: value })}
            placeholder="55"
            min={ONBOARDING_WEIGHT_RANGE.min}
            max={ONBOARDING_WEIGHT_RANGE.max}
            step={0.1}
            unit="kg"
            normalizeOnBlur={false}
          />
        </div>
      </Field.Root>
    </section>
  );
}
