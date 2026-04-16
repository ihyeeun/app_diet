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
  isInputTextAllowed?: (nextInputValue: string) => boolean;
};

const NON_CHARACTER_KEYS = new Set([
  "Backspace",
  "Delete",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "Tab",
  "Enter",
  "Escape",
]);

function getNextInputValue(
  currentValue: string,
  insertedText: string,
  selectionStart: number | null,
  selectionEnd: number | null,
) {
  const start = selectionStart ?? currentValue.length;
  const end = selectionEnd ?? currentValue.length;
  return `${currentValue.slice(0, start)}${insertedText}${currentValue.slice(end)}`;
}

function clampValue(value: number, min?: number, max?: number) {
  const minClampedValue = min === undefined ? value : Math.max(min, value);
  return max === undefined ? minClampedValue : Math.min(max, minClampedValue);
}

export default function NumberField({
  value,
  onChange,
  min,
  max,
  step,
  unit,
  isInputTextAllowed,
}: Props) {
  const id = React.useId();

  return (
    <BaseNumberField.Root
      id={id}
      value={value}
      min={min}
      max={max}
      step={step}
      allowOutOfRange={false}
      onValueChange={(nextValue, eventDetails) => {
        if (nextValue == null) {
          onChange(undefined);
          return;
        }

        const roundedValue = toOneDecimalPlace(nextValue);
        const normalizedValue = clampValue(roundedValue, min, max);
        const isDirectInputReason =
          eventDetails.reason === "input-change" ||
          eventDetails.reason === "input-paste" ||
          eventDetails.reason === "input-blur";

        if (
          isDirectInputReason &&
          isInputTextAllowed &&
          !isInputTextAllowed(String(normalizedValue))
        ) {
          return;
        }

        onChange(normalizedValue);
      }}
    >
      <BaseNumberField.Group className={styles.group}>
        <BaseNumberField.Decrement className={styles.decrement} aria-label="값 감소">
          <MinusIcon size={24} />
        </BaseNumberField.Decrement>
        <div className={`${styles.inputWrapper} typo-body1`}>
          <BaseNumberField.Input
            className={styles.input}
            inputMode="decimal"
            onKeyDown={(event) => {
              if (!isInputTextAllowed) return;
              if (event.nativeEvent.isComposing) return;
              if (event.ctrlKey || event.metaKey || event.altKey) return;
              if (NON_CHARACTER_KEYS.has(event.key)) return;
              if (event.key.length !== 1) return;

              const nextInputValue = getNextInputValue(
                event.currentTarget.value,
                event.key,
                event.currentTarget.selectionStart,
                event.currentTarget.selectionEnd,
              );

              if (isInputTextAllowed(nextInputValue)) return;
              event.preventDefault();
            }}
            onPaste={(event) => {
              if (!isInputTextAllowed) return;

              const pastedText = event.clipboardData.getData("text");
              const nextInputValue = getNextInputValue(
                event.currentTarget.value,
                pastedText,
                event.currentTarget.selectionStart,
                event.currentTarget.selectionEnd,
              );

              if (isInputTextAllowed(nextInputValue)) return;
              event.preventDefault();
            }}
          />
          {unit && <span className={styles.unit}>{unit}</span>}
        </div>
        <BaseNumberField.Increment className={styles.increment} aria-label="값 증가">
          <PlusIcon size={24} />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
}
