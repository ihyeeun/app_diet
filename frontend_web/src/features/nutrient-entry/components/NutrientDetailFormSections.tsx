import { NumberField } from "@base-ui/react/number-field";
import { Tabs } from "@base-ui/react/tabs";
import { MinusIcon, PlusIcon } from "lucide-react";
import type { ChangeEvent } from "react";

import {
  DETAIL_FIELD_CONFIG,
  MACRO_FIELD_CONFIG,
  SINGLE_DECIMAL_STEP,
} from "@/features/nutrient-entry/constants/nutrientDetail.constants";
import type {
  NutrientDetailForm,
  NutrientDetailFormFieldKey,
} from "@/features/nutrient-entry/types/nutrientDetail.form";
import type { NutrientServingUnit } from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";

import styles from "../styles/NutrientDetailPage.module.css";

type NutrientDetailFormSectionsProps = {
  foodName: string;
  brandName: string;
  form: NutrientDetailForm;
  servingUnit: NutrientServingUnit;
  servingLabel: string;
  onServingUnitChange: (nextUnit: NutrientServingUnit) => void;
  onNumericChange: (
    key: NutrientDetailFormFieldKey,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onNumericBlur: (key: NutrientDetailFormFieldKey) => () => void;
  onWeightStep: (delta: number) => void;
  onResetForm: () => void;
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export function NutrientDetailFormSections({
  foodName,
  brandName,
  form,
  servingUnit,
  servingLabel,
  onServingUnitChange,
  onNumericChange,
  onNumericBlur,
  onWeightStep,
  onResetForm,
}: NutrientDetailFormSectionsProps) {
  return (
    <>
      <section className={styles.summarySection}>
        <div className={styles.foodInfoRow}>
          <div>
            <p className={`typo-title2 ${styles.foodNameText}`}>{foodName}</p>
            {brandName && <p className={`typo-label4 ${styles.brandText}`}>{brandName}</p>}
          </div>

          <div className={styles.calorieInputWrap}>
            <input
              className={`${styles.calorieInput} typo-h2`}
              type="text"
              value={form.calories}
              onChange={onNumericChange("calories")}
              onBlur={onNumericBlur("calories")}
              placeholder="0"
              inputMode="decimal"
              aria-label="칼로리 입력"
            />
            <span className={`typo-title2 ${styles.calorieUnit}`}>kcal</span>
          </div>
        </div>

        <div className={styles.macroRow}>
          {MACRO_FIELD_CONFIG.map((field) => (
            <article key={field.key} className={styles.macroItem}>
              <p className={`typo-title4 ${styles.macroLabel}`}>{field.label}</p>
              <div className={styles.macroInputWrap}>
                <input
                  className={`${styles.macroInput} typo-body1`}
                  type="text"
                  value={form[field.key]}
                  onChange={onNumericChange(field.key)}
                  onBlur={onNumericBlur(field.key)}
                  placeholder="0"
                  inputMode="decimal"
                  aria-label={`${field.label} 입력`}
                />
                <span className={`typo-body1 ${styles.macroUnitText}`}>g</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Tabs.Root
        className={styles.TabsRoot}
        value={servingUnit}
        onValueChange={(nextValue) => {
          onServingUnitChange(nextValue === "ml" ? "ml" : "g");
        }}
      >
        <Tabs.List className={styles.TabsList}>
          <Tabs.Tab value="g" className={styles.TabsTab}>
            g
          </Tabs.Tab>
          <Tabs.Tab value="ml" className={styles.TabsTab}>
            ml
          </Tabs.Tab>
        </Tabs.List>

        {(["g", "ml"] as const).map((tab) => (
          <Tabs.Panel key={tab} value={tab} className={styles.TabsPanel}>
            <NumberField.Root>
              <NumberField.Group className={styles.FieldGroup}>
                <NumberField.Decrement
                  className={styles.Decrement}
                  aria-label="입력값 감소"
                  onClick={() => onWeightStep(-SINGLE_DECIMAL_STEP)}
                >
                  <MinusIcon size={24} />
                </NumberField.Decrement>
                <NumberField.Input
                  className={`typo-body1 ${styles.FieldInput}`}
                  inputMode="decimal"
                  value={form.weight}
                  onChange={onNumericChange("weight")}
                  onBlur={onNumericBlur("weight")}
                  aria-label="단위량 또는 중량 입력"
                />
                <NumberField.Increment
                  className={styles.Increment}
                  aria-label="입력값 증가"
                  onClick={() => onWeightStep(SINGLE_DECIMAL_STEP)}
                >
                  <PlusIcon size={24} />
                </NumberField.Increment>
              </NumberField.Group>
            </NumberField.Root>
          </Tabs.Panel>
        ))}
      </Tabs.Root>

      <section className={styles.detailSection}>
        <header className={styles.detailHeader}>
          <p className="typo-title3">영양정보</p>
          <Button
            variant="text"
            state="default"
            size="small"
            color="assistive"
            onClick={onResetForm}
            aria-label="영양정보 전체 삭제"
          >
            전체 삭제
          </Button>
        </header>

        <div className="divider dividerMargin20" />

        {DETAIL_FIELD_CONFIG.map((field, index) => {
          const previousField = DETAIL_FIELD_CONFIG[index - 1];
          const isGroupStart = index > 0 && previousField.group !== field.group;
          const isMainField = field.variant === "main";

          return (
            <div key={field.key}>
              {isGroupStart && <div className="divider dividerMargin16" />}
              <article
                className={cx(
                  styles.detailRow,
                  isMainField ? styles.detailRowMain : styles.detailRowSub,
                )}
              >
                <p
                  className={cx(
                    isMainField ? "typo-title4" : "typo-body4",
                    styles.detailLabel,
                    isMainField ? styles.detailLabelMain : styles.detailLabelSub,
                  )}
                >
                  {field.group === "serving" ? servingLabel : field.label}
                </p>

                <div className={styles.detailInputWrap}>
                  <input
                    className={`typo-body2 ${styles.detailInput}`}
                    type="text"
                    value={form[field.key]}
                    onChange={onNumericChange(field.key)}
                    onBlur={onNumericBlur(field.key)}
                    placeholder="0"
                    inputMode="decimal"
                    aria-label={`${field.label} 입력`}
                  />
                  <span className={`typo-label3 ${styles.unitText}`}>{field.unit}</span>
                </div>
              </article>
            </div>
          );
        })}
      </section>
    </>
  );
}
