import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";

type Props = {
  label: string;
  value?: number;
  onChange: (v?: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  description?: string;
  errorText?: string; // 유효성 실패 시 메시지
};

export function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  min,
  max,
  step,
  unit,
  description,
  errorText,
}: Props) {
  return (
    <Field.Root>
      <Field.Label>{label}</Field.Label>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Input
          type="number"
          inputMode="decimal"
          value={value ?? ""}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(undefined);
            const num = Number(raw);
            if (!Number.isNaN(num)) onChange(num);
          }}
          style={{ fontSize: 16 }}
        />
        {unit && <span>{unit}</span>}
      </div>

      {description && <Field.Description>{description}</Field.Description>}
      {errorText && <Field.Error>{errorText}</Field.Error>}
    </Field.Root>
  );
}
