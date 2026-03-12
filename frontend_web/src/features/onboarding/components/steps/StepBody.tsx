import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import { NumberInput } from "@/shared/commons/input/NumberInput";
import { Field } from "@base-ui/react";

export default function StepBody({ data, update }: StepComponentProps) {
  return (
    <section>
      <div className="onboarding-title">
        <h2 className="typo-title1-semibold">키 / 몸무게가 몇인가요?</h2>
      </div>

      <div className="onboarding-body-list">
        <InputCard
          label="키"
          value={data.heightCm}
          onChange={(v) => update({ heightCm: v })}
          placeholder="165"
          min={1}
          max={250}
          step={1}
          unit="cm"
        />

        <InputCard
          label="몸무게"
          value={data.weightKg}
          onChange={(v) => update({ weightKg: v })}
          placeholder="55"
          min={1}
          max={200}
          step={0.1}
          unit="kg"
        />
      </div>
    </section>
  );
}

type InputCardProps = {
  label: string;
  description?: string;
  value?: number;
  onChange: (v?: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

export function InputCard({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  unit,
}: InputCardProps) {
  return (
    <Field.Root className="onboarding-input-card">
      <Field.Label className="onboarding-input-card-label">{label}</Field.Label>

      <NumberInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        unit={unit}
      />
    </Field.Root>
  );
}
