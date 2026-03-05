import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import { NumberInput } from "@/shared/commons/input/NumberInput";
import { Field } from "@base-ui/react";

export default function StepGoalWeight({ data, update }: StepComponentProps) {
  const diff =
    data.goalWeightKg !== undefined && data.weightKg !== undefined
      ? data.goalWeightKg - data.weightKg
      : undefined;

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 0px" }}>
        <h2>목표 몸무게가 몇인가요?</h2>
        {diff !== undefined && (
          <p style={{ fontSize: 16 }}>
            현재 몸무게 기준 {diff > 0 ? "+" : ""}
            {diff}kg
          </p>
        )}
      </div>

      <Field.Root>
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "8px",
            border: "1px solid #e5e5e5",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
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
    </div>
  );
}
