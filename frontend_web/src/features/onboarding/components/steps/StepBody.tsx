import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import { NumberInput } from "@/shared/commons/input/NumberInput";
import { Field } from "@base-ui/react";

export default function StepBody({ data, update }: StepComponentProps) {
  return (
    <div>
      <h2>키 / 몸무게가 몇인가요?</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
    </div>
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
  description,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  unit,
}: InputCardProps) {
  return (
    <Field.Root
      style={{
        padding: "16px 20px",
        borderRadius: "8px",
        border: "1px solid #e5e5e5",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <Field.Label style={{ fontSize: 18 }}>{label}</Field.Label>

      {description && (
        <Field.Description style={{ fontSize: 14, color: "#888" }}>{description}</Field.Description>
      )}

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
