import { NumberField, Tabs } from "@base-ui/react";
import { ChevronDown, ChevronUp, MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/shared/commons/button/Button";
import { formatNutritionValue } from "@/features/meal-record/utils/mealMenuNutrition";
import type { MealMenuNutrientGroupSection } from "@/features/meal-record/types/mealMenuNutrition.types";
import type { MealServingInputMode } from "@/features/meal-record/types/mealRecord.types";
import styles from "../styles/MealMenuNutritionDetail.module.css";

type MealMenuServingInputProps = {
  inputMode: MealServingInputMode;
  inputValue: string;
  unitLabel: string;
  weightUnit: string;
  onModeChange: (nextMode: MealServingInputMode) => void;
  onInputChange: (nextValue: string) => void;
  onInputBlur: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
};

type MealMenuNutritionDetailProps = {
  menuTitle: string;
  calories: number;
  carbohydrateGram: number;
  proteinGram: number;
  fatGram: number;
  detailGroups: MealMenuNutrientGroupSection[];
  isDetailOpen: boolean;
  onToggleDetail: () => void;
  onEditAndAdd?: () => void;
  showEditSection?: boolean;
  detailListId?: string;
  servingInput?: MealMenuServingInputProps;
};

export function MealMenuNutritionDetail({
  menuTitle,
  calories,
  carbohydrateGram,
  proteinGram,
  fatGram,
  detailGroups,
  isDetailOpen,
  onToggleDetail,
  onEditAndAdd,
  detailListId = "meal-record-detail-list",
  servingInput,
}: MealMenuNutritionDetailProps) {
  return (
    <>
      <section className={styles.summarySection}>
        <div className={styles.summaryHead}>
          <p className={`typo-title2 ${styles.foodName}`}>{menuTitle}</p>
          <div className={styles.calorieText}>
            <span className="typo-h2">{formatNutritionValue(calories)}</span>
            <span className="typo-title2">kcal</span>
          </div>
        </div>

        <div className={styles.macroRow}>
          <article className={styles.macroItem}>
            <p className={`typo-title4 ${styles.macroLabel}`}>탄수화물</p>
            <p className={`typo-body1 ${styles.macroValue}`}>
              {formatNutritionValue(carbohydrateGram)}
              <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
            </p>
          </article>

          <article className={styles.macroItem}>
            <p className={`typo-title4 ${styles.macroLabel}`}>단백질</p>
            <p className={`typo-body1 ${styles.macroValue}`}>
              {formatNutritionValue(proteinGram)}
              <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
            </p>
          </article>

          <article className={styles.macroItem}>
            <p className={`typo-title4 ${styles.macroLabel}`}>지방</p>
            <p className={`typo-body1 ${styles.macroValue}`}>
              {formatNutritionValue(fatGram)}
              <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
            </p>
          </article>
        </div>
      </section>

      {servingInput && (
        <section className={styles.servingInputSection}>
          <Tabs.Root
            className={styles.TabsRoot}
            value={servingInput.inputMode}
            onValueChange={(nextValue) => {
              servingInput.onModeChange(nextValue === "weight" ? "weight" : "unit");
            }}
          >
            <Tabs.List className={styles.TabsList}>
              <Tabs.Tab value="unit" className={styles.TabsTab}>
                {servingInput.unitLabel}
              </Tabs.Tab>
              <Tabs.Tab value="weight" className={styles.TabsTab}>
                {servingInput.weightUnit}
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="unit" className={styles.TabsPanel}>
              <NumberField.Root>
                <NumberField.Group className={styles.FieldGroup}>
                  <NumberField.Decrement aria-label="입력값 감소" onClick={servingInput.onDecrease}>
                    <MinusIcon size={24} />
                  </NumberField.Decrement>
                  <NumberField.Input
                    className={`typo-body1 ${styles.FieldInput}`}
                    inputMode="decimal"
                    value={servingInput.inputValue}
                    onChange={(event) => {
                      servingInput.onInputChange(event.target.value);
                    }}
                    onBlur={servingInput.onInputBlur}
                    aria-label="단위량 또는 중량 입력"
                  />
                  <NumberField.Increment aria-label="입력값 증가" onClick={servingInput.onIncrease}>
                    <PlusIcon size={24} />
                  </NumberField.Increment>
                </NumberField.Group>
              </NumberField.Root>
            </Tabs.Panel>

            <Tabs.Panel value="weight" className={styles.TabsPanel}>
              <NumberField.Root>
                <NumberField.Group className={styles.FieldGroup}>
                  <NumberField.Decrement aria-label="입력값 감소" onClick={servingInput.onDecrease}>
                    <MinusIcon size={24} />
                  </NumberField.Decrement>
                  <NumberField.Input
                    className={`typo-body1 ${styles.FieldInput}`}
                    inputMode="decimal"
                    value={servingInput.inputValue}
                    onChange={(event) => {
                      servingInput.onInputChange(event.target.value);
                    }}
                    onBlur={servingInput.onInputBlur}
                    aria-label="단위량 또는 중량 입력"
                  />
                  <NumberField.Increment aria-label="입력값 증가" onClick={servingInput.onIncrease}>
                    <PlusIcon size={24} />
                  </NumberField.Increment>
                </NumberField.Group>
              </NumberField.Root>
            </Tabs.Panel>
          </Tabs.Root>
        </section>
      )}

      <section className={styles.detailSection}>
        <button
          type="button"
          className={styles.detailToggleButton}
          onClick={onToggleDetail}
          aria-expanded={isDetailOpen}
          aria-controls={detailListId}
        >
          <span className="typo-title3">상세 영양성분 보기</span>
          {isDetailOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {isDetailOpen && (
          <>
            <div className="divider dividerMargin20" />

            <section className={styles.editSection}>
              <p className={`typo-label3 ${styles.editDescription}`}>영양성분이 잘못되었나요?</p>
              <Button
                variant="text"
                state="default"
                size="small"
                color="assistive"
                onClick={onEditAndAdd}
              >
                수정해서 담기
              </Button>
            </section>

            <div id={detailListId} className={styles.detailList}>
              {detailGroups.map((group, groupIndex) => (
                <section key={group.group} className={styles.detailGroup}>
                  <div className={styles.detailGroupRows}>
                    {group.rows.map((row) => (
                      <div key={row.key}>
                        {groupIndex > 0 && row.variant === "main" && (
                          <div className={styles.groupDivider} />
                        )}
                        <article className={styles.detailRow}>
                          <p
                            className={`${row.variant === "sub" ? "typo-body4" : "typo-title4"} ${
                              row.variant === "sub" ? styles.detailLabelSub : styles.detailLabelMain
                            }`}
                          >
                            {row.label}
                          </p>
                          <div className={styles.detailValue}>
                            <span
                              className={`${row.variant === "sub" ? "typo-body4" : "typo-body2"}`}
                            >
                              {formatNutritionValue(row.value ?? 0)}
                            </span>
                            <span className={`${styles.detailUnit} typo-label2`}>{row.unit}</span>
                          </div>
                        </article>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
