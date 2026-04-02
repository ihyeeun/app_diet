import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { MinusIcon, PlusIcon } from "lucide-react";
import React from "react";

import { toOneDecimalPlace } from "@/shared/utils/numberFormat";

import styles from "./NumberField.module.css";

type Props = {
  value?: number;
  onChange: (v?: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
};

export default function NumberField({ value, onChange, min, max, step, unit }: Props) {
  const id = React.useId();

  return (
    <BaseNumberField.Root
      id={id}
      value={value}
      min={min}
      max={max}
      step={step}
      onValueChange={(nextValue) => {
        if (nextValue == null) return onChange(undefined);
        onChange(toOneDecimalPlace(nextValue));
      }}
    >
      <BaseNumberField.Group className={styles.group}>
        <BaseNumberField.Decrement className={styles.decrement} aria-label="값 감소">
          <MinusIcon size={24} />
        </BaseNumberField.Decrement>
        <BaseNumberField.Input className={styles.input} inputMode="decimal" />
        {unit && <span className={styles.unit}>{unit}</span>}
        <BaseNumberField.Increment className={styles.increment} aria-label="값 증가">
          <PlusIcon size={24} />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
}
