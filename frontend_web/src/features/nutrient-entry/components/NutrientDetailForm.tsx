import { Select } from "@base-ui/react";
import { ChevronDown } from "lucide-react";

import { NUTRIENT_FORM_CONFIG } from "@/features/nutrient-entry/constants/nutrientDetailForm";
import styles from "@/features/nutrient-entry/styles/NutrientDetailForm.module.css";
import type { MenuNutrientFields, MenuUnit } from "@/shared/api/types/api.dto";

type Props = {
  totalWeight?: number;
  onTotalWeightChange: (nextWeight: number | undefined) => void;
  totalCalories?: number;
  onTotalCaloriesChange: (nextCalories: number | undefined) => void;
  form?: Partial<MenuNutrientFields>;
  onFieldChange: (key: keyof MenuNutrientFields, nextValue: string) => void;
  weightUnit: MenuUnit;
  onWeightUnitChange: (nextUnit: MenuUnit) => void;
};

const WEIGHT_UNIT_OPTIONS: Array<{ label: string; value: MenuUnit }> = [
  { label: "g", value: 0 },
  { label: "ml", value: 1 },
];
const MAX_INPUT_VALUE = 9999.9;

function roundToSingleDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function sanitizeSingleDecimalInput(value: string) {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const [integerPart = "", ...decimalParts] = cleaned.split(".");

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join("").slice(0, 1)}`;
}

function parseSingleDecimalInput(value: string, min = 0, max = MAX_INPUT_VALUE) {
  const sanitized = sanitizeSingleDecimalInput(value);

  if (sanitized === "" || sanitized === ".") {
    return undefined;
  }

  const parsed = Number(sanitized);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  const clamped = Math.min(max, Math.max(min, parsed));
  return roundToSingleDecimal(clamped);
}

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function NutrientDetailForm({
  totalWeight,
  onTotalWeightChange,
  totalCalories,
  onTotalCaloriesChange,
  form,
  onFieldChange,
  weightUnit,
  onWeightUnitChange,
}: Props) {
  const selectedWeightUnitLabel =
    WEIGHT_UNIT_OPTIONS.find((option) => option.value === weightUnit)?.label ?? "g";

  return (
    <section className={styles.formSection}>
      <div className={styles.topFieldSection}>
        <div className={styles.titleRow}>
          <p className={`typo-title4 ${styles.titleText}`}>총 용량</p>
          <p className={`typo-label6 ${styles.requiredText}`}>* 필수로 작성해주세요</p>
        </div>
        <div className={styles.weightRow}>
          <input
            className={`typo-body3 ${styles.valueInput}`}
            type="number"
            step="0.1"
            inputMode="decimal"
            placeholder="0"
            aria-label="총 용량 입력"
            value={totalWeight === undefined ? "" : String(totalWeight)}
            onChange={(event) => {
              onTotalWeightChange(parseSingleDecimalInput(event.target.value));
            }}
            max={MAX_INPUT_VALUE}
            min={0}
          />

          <Select.Root
            value={weightUnit}
            onValueChange={(nextValue) => {
              if (nextValue === 0 || nextValue === 1) {
                onWeightUnitChange(nextValue);
              }
            }}
          >
            <Select.Trigger
              className={`typo-body3 ${styles.valueInput} ${styles.selectTrigger}`}
              aria-label="중량 단위 선택"
            >
              <Select.Value>{selectedWeightUnitLabel}</Select.Value>
              <Select.Icon className={styles.selectIcon} aria-hidden>
                <ChevronDown size={20} />
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Positioner className={styles.selectPositioner}>
                <Select.Popup className={styles.selectPopup}>
                  <Select.List className={styles.selectList}>
                    {WEIGHT_UNIT_OPTIONS.map((option) => (
                      <Select.Item
                        key={option.value}
                        value={option.value}
                        className={`typo-body3 ${styles.selectItem}`}
                      >
                        <Select.ItemText>{option.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>

      <div className={styles.topFieldSection}>
        <div className={styles.titleRow}>
          <p className={`typo-title4 ${styles.titleText}`}>
            총 칼로리 <span className={`typo-label3 ${styles.titleUnit}`}>(kcal)</span>
          </p>
          <p className={`typo-label6 ${styles.requiredText}`}>* 필수로 작성해주세요</p>
        </div>
        <input
          className={`typo-body3 ${styles.valueInput}`}
          type="number"
          step="0.1"
          inputMode="decimal"
          placeholder="0"
          aria-label="총 칼로리 입력"
          value={totalCalories === undefined ? "" : String(totalCalories)}
          onChange={(event) => {
            onTotalCaloriesChange(parseSingleDecimalInput(event.target.value));
          }}
          max={MAX_INPUT_VALUE}
          min={0}
        />
      </div>

      <section id="nutrientDetailForm" className={styles.nutrientList}>
        {NUTRIENT_FORM_CONFIG.map((field, index) => {
          const prevField = NUTRIENT_FORM_CONFIG[index - 1];
          const shouldRenderDivider = index > 0 && prevField?.group !== field.group;
          const fieldValue = form?.[field.key];
          const isMainField = field.variant === "main";

          return (
            <div key={field.key}>
              {shouldRenderDivider && <div className="divider dividerMargin16" />}

              <div
                className={cx(
                  styles.fieldRow,
                  isMainField ? styles.fieldRowMain : styles.fieldRowSub,
                )}
              >
                <p
                  className={cx(
                    isMainField ? "typo-title4" : "typo-body4",
                    styles.fieldLabel,
                    isMainField ? styles.fieldLabelMain : styles.fieldLabelSub,
                  )}
                >
                  {field.label}
                  <span className={`typo-label3 ${styles.unitText}`}> ({field.unit})</span>
                </p>
                <input
                  className={`typo-body3 ${styles.nutrientInput}`}
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={fieldValue === undefined ? "" : String(fieldValue)}
                  onChange={(event) => {
                    const parsedValue = parseSingleDecimalInput(event.target.value);
                    onFieldChange(
                      field.key,
                      parsedValue === undefined ? "" : String(parsedValue),
                    );
                  }}
                  aria-label={`${field.label} 입력`}
                  placeholder="0"
                  max={MAX_INPUT_VALUE}
                  min={0}
                />
              </div>
            </div>
          );
        })}
      </section>
    </section>
  );
}
