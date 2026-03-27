import { Button } from "@/shared/commons/button/Button";
import { formatNutritionValue } from "../utils/mealMenuNutrition";
import { type ParsedMenuServing } from "../utils/mealRecordServing";
import type { MealMenuItem, MealServingInputMode } from "@/shared/api/types/nutrition.dto";
import styles from "../styles/ServingAmountSheetContent.module.css";
import { NumberField, Tabs } from "@base-ui/react";
import { MinusIcon, PlusIcon } from "lucide-react";

type ServingAmountSheetContentProps = {
  menu: MealMenuItem;
  serving: ParsedMenuServing;
  previewMenu: MealMenuItem;
  inputMode: MealServingInputMode;
  inputValue: string;
  onModeChange: (nextMode: MealServingInputMode) => void;
  onInputChange: (nextValue: string) => void;
  onInputBlur: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
  onSubmit: () => void;
};

export function ServingAmountSheetContent({
  menu,
  serving,
  previewMenu,
  inputMode,
  inputValue,
  onModeChange,
  onInputChange,
  onInputBlur,
  onDecrease,
  onIncrease,
  onSubmit,
}: ServingAmountSheetContentProps) {
  return (
    <div className={styles.servingSheetContainer}>
      <div className={styles.servingSheetContent}>
        <section className={styles.servingSummaryCard}>
          <div className={styles.servingSummaryHead}>
            <p className={`typo-title2 ${styles.servingMenuTitle}`}>{menu.name}</p>
            <p className={`typo-title2 ${styles.servingCalorieText}`}>
              <span className="typo-h3">{formatNutritionValue(previewMenu.calories)}</span> kcal
            </p>
          </div>

          <div className={styles.servingMacroRow}>
            <article className={styles.servingMacroItem}>
              <p className={`typo-title4 ${styles.servingMacroLabel}`}>탄수화물</p>
              <p className={`typo-body1 ${styles.servingMacroValue}`}>
                {formatNutritionValue(previewMenu.carbs ?? 0)}
                <span className={`typo-body1 ${styles.servingMacroUnit}`}>g</span>
              </p>
            </article>
            <article className={styles.servingMacroItem}>
              <p className={`typo-title4 ${styles.servingMacroLabel}`}>단백질</p>
              <p className={`typo-body1 ${styles.servingMacroValue}`}>
                {formatNutritionValue(previewMenu.protein ?? 0)}
                <span className={`typo-body1 ${styles.servingMacroUnit}`}>g</span>
              </p>
            </article>
            <article className={styles.servingMacroItem}>
              <p className={`typo-title4 ${styles.servingMacroLabel}`}>지방</p>
              <p className={`typo-body1 ${styles.servingMacroValue}`}>
                {formatNutritionValue(previewMenu.fat ?? 0)}
                <span className={`typo-body1 ${styles.servingMacroUnit}`}>g</span>
              </p>
            </article>
          </div>
        </section>

        <section>
          <Tabs.Root
            className={styles.TabsRoot}
            value={inputMode}
            onValueChange={(nextValue) => {
              onModeChange(nextValue === "unit" ? "unit" : "weight");
            }}
          >
            <Tabs.List className={styles.TabsList}>
              <Tabs.Tab value="unit" className={styles.TabsTab}>
                {serving.unitLabel}
              </Tabs.Tab>
              <Tabs.Tab value="weight" className={styles.TabsTab}>
                {serving.weightUnit}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="unit" className={styles.TabsPanel}>
              <NumberField.Root>
                <NumberField.Group className={styles.FieldGroup}>
                  <NumberField.Decrement
                    className={styles.Decrement}
                    aria-label="입력값 감소"
                    onClick={onDecrease}
                  >
                    <MinusIcon size={24} />
                  </NumberField.Decrement>
                  <NumberField.Input
                    className={`typo-body1 ${styles.FieldInput}`}
                    inputMode="decimal"
                    value={inputValue}
                    onChange={(event) => onInputChange(event.target.value)}
                    onBlur={onInputBlur}
                    aria-label="단위량 또는 중량 입력"
                  />
                  <NumberField.Increment
                    className={styles.Increment}
                    aria-label="입력값 증가"
                    onClick={onIncrease}
                  >
                    <PlusIcon size={24} />
                  </NumberField.Increment>
                </NumberField.Group>
              </NumberField.Root>
            </Tabs.Panel>

            <Tabs.Panel value="weight">
              <NumberField.Root>
                <NumberField.Group className={styles.FieldGroup}>
                  <NumberField.Decrement
                    className={styles.Decrement}
                    aria-label="입력값 감소"
                    onClick={onDecrease}
                  >
                    <MinusIcon size={24} />
                  </NumberField.Decrement>
                  <NumberField.Input
                    className={`typo-body1 ${styles.FieldInput}`}
                    inputMode="decimal"
                    value={inputValue}
                    onChange={(event) => onInputChange(event.target.value)}
                    onBlur={onInputBlur}
                    aria-label="단위량 또는 중량 입력"
                  />
                  <NumberField.Increment
                    className={styles.Increment}
                    aria-label="입력값 증가"
                    onClick={onIncrease}
                  >
                    <PlusIcon size={24} />
                  </NumberField.Increment>
                </NumberField.Group>
              </NumberField.Root>
            </Tabs.Panel>
          </Tabs.Root>
        </section>
      </div>

      <Button variant="filled" size="large" color="primary" fullWidth onClick={onSubmit}>
        담기
      </Button>
    </div>
  );
}
