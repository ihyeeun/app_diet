import { Field } from "@base-ui/react";

import {
  ONBOARDING_HEIGHT_RANGE,
  ONBOARDING_WEIGHT_RANGE,
} from "@/features/onboarding/constants/inputRanges";
import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import styles from "@/features/onboarding/styles/OnboardingSteps.module.css";
import { NumberInput } from "@/shared/commons/input/NumberInput";

export default function StepBody({ data, update }: StepComponentProps) {
  return (
    <section className={styles.content}>
      <div className={styles.onboardingTitle}>
        <h2 className="typo-title1">키 / 몸무게가 몇인가요?</h2>
      </div>

      <div className={styles.onboardingBodyList}>
        <InputCard
          label="키"
          value={data.height}
          onChange={(v) => update({ height: v })}
          placeholder="165"
          min={ONBOARDING_HEIGHT_RANGE.min}
          max={ONBOARDING_HEIGHT_RANGE.max}
          step={1}
          unit="cm"
          normalizeOnBlur={false}
        />

        <InputCard
          label="몸무게"
          value={data.weight}
          onChange={(v) => update({ weight: v })}
          placeholder="55"
          min={ONBOARDING_WEIGHT_RANGE.min}
          max={ONBOARDING_WEIGHT_RANGE.max}
          step={0.1}
          unit="kg"
          normalizeOnBlur={false}
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
  normalizeOnBlur?: boolean;
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
  normalizeOnBlur,
}: InputCardProps) {
  return (
    <Field.Root className={styles.onboardingInputCard}>
      <Field.Label className={styles.onboardingInputCardLabel}>{label}</Field.Label>

      <NumberInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        unit={unit}
        normalizeOnBlur={normalizeOnBlur}
      />
    </Field.Root>
  );
}
