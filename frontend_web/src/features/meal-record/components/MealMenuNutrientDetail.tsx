import { NumberField, Tabs } from "@base-ui/react";
import { ChevronDown, ChevronUp, MinusIcon, PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/shared/commons/button/Button";
import type { MealMenuItem, MealServingInputMode } from "@/shared/api/types/api.dto";
import {
  buildMealMenuDetailGroups,
  buildMealMenuDetailRows,
  formatNutrientValue,
} from "@/features/meal-record/utils/mealMenuNutrient";
import {
  SERVING_INPUT_STEP,
  buildScaledMenu,
  formatCompactDecimal,
  getServingDefaultValue,
  normalizeServingInput,
  parseMenuServing,
  resolveServingValues,
  sanitizeServingInput,
} from "@/features/meal-record/utils/mealRecordServing";
import styles from "../styles/MealMenuNutrientDetail.module.css";

export type MealMenuNutrientSelection = {
  menu: MealMenuItem;
  quantity: number;
  mode: MealServingInputMode;
};

type MealMenuNutrientDetailProps = {
  menu: MealMenuItem;
  initialQuantity?: number;
  initialMode?: MealServingInputMode;
  isDetailOpen: boolean;
  onToggleDetail: () => void;
  onSelectionChange?: (selection: MealMenuNutrientSelection | null) => void;
  onEditAndAdd?: () => void;
  showEditSection?: boolean;
  detailListId?: string;
};

function toSafeQuantity(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return normalizeServingInput(value);
}

function resolveInitialInputValue({
  mode,
  quantity,
  baseUnitCount,
  baseWeight,
}: {
  mode: MealServingInputMode;
  quantity: number;
  baseUnitCount: number;
  baseWeight: number;
}) {
  if (mode === "unit") {
    return formatCompactDecimal(normalizeServingInput(quantity));
  }

  const scaleFactor = quantity / baseUnitCount;
  const nextWeight =
    Number.isFinite(scaleFactor) && scaleFactor > 0 ? baseWeight * scaleFactor : baseWeight;

  return formatCompactDecimal(normalizeServingInput(nextWeight));
}

export function MealMenuNutrientDetail({
  menu,
  initialQuantity,
  initialMode,
  isDetailOpen,
  onToggleDetail,
  onSelectionChange,
  onEditAndAdd,
  showEditSection = true,
  detailListId = "meal-record-detail-list",
}: MealMenuNutrientDetailProps) {
  const serving = useMemo(() => parseMenuServing(menu), [menu]);
  const effectiveBaseWeight = toSafeQuantity(menu.weight) ?? serving.baseWeight;
  const resolvedServingConfig = useMemo(
    () => ({
      ...serving,
      baseWeight: effectiveBaseWeight,
    }),
    [effectiveBaseWeight, serving],
  );

  const menuInitialMode: MealServingInputMode =
    menu.serving_input_mode === "weight" ? "weight" : "unit";
  const resolvedInitialMode: MealServingInputMode =
    initialMode === "weight" || initialMode === "unit" ? initialMode : menuInitialMode;

  const resolvedInitialQuantity = useMemo(() => {
    return toSafeQuantity(initialQuantity) ?? toSafeQuantity(menu.serving_input_value) ?? 1;
  }, [initialQuantity, menu.serving_input_value]);

  const [inputMode, setInputMode] = useState<MealServingInputMode>(resolvedInitialMode);
  const [inputValue, setInputValue] = useState(() =>
    resolveInitialInputValue({
      mode: resolvedInitialMode,
      quantity: resolvedInitialQuantity,
      baseUnitCount: resolvedServingConfig.baseUnitCount,
      baseWeight: resolvedServingConfig.baseWeight,
    }),
  );

  const parsedInputValue = useMemo(() => {
    const parsedValue = Number(inputValue);
    if (!Number.isFinite(parsedValue)) {
      return null;
    }

    return parsedValue;
  }, [inputValue]);

  const normalizedInputValue = useMemo(() => {
    if (parsedInputValue === null || parsedInputValue <= 0) {
      return null;
    }

    return normalizeServingInput(parsedInputValue);
  }, [parsedInputValue]);

  const resolvedServing = useMemo(() => {
    if (normalizedInputValue === null) {
      return null;
    }

    const resolved = resolveServingValues(resolvedServingConfig, inputMode, normalizedInputValue);
    if (!Number.isFinite(resolved.scaleFactor) || resolved.scaleFactor <= 0) {
      return null;
    }

    return resolved;
  }, [inputMode, normalizedInputValue, resolvedServingConfig]);

  const previewMenu = useMemo<MealMenuItem>(() => {
    if (!resolvedServing || normalizedInputValue === null) {
      return menu;
    }

    const scaledMenu = buildScaledMenu({
      menu,
      serving: resolvedServingConfig,
      resolved: resolvedServing,
      mode: inputMode,
      inputValue: normalizedInputValue,
    });

    return {
      ...scaledMenu,
      serving_input_mode: inputMode,
      // 백엔드는 인분 수를 기대하므로 unitCount를 저장한다.
      serving_input_value: resolvedServing.unitCount,
    };
  }, [inputMode, menu, normalizedInputValue, resolvedServing, resolvedServingConfig]);

  const detailRows = useMemo(() => buildMealMenuDetailRows(previewMenu), [previewMenu]);
  const detailGroups = useMemo(() => buildMealMenuDetailGroups(detailRows), [detailRows]);

  useEffect(() => {
    if (!onSelectionChange) {
      return;
    }

    if (!resolvedServing || normalizedInputValue === null) {
      onSelectionChange(null);
      return;
    }

    onSelectionChange({
      menu: previewMenu,
      quantity: resolvedServing.unitCount,
      mode: inputMode,
    });
  }, [inputMode, normalizedInputValue, onSelectionChange, previewMenu, resolvedServing]);

  const handleModeChange = (nextMode: MealServingInputMode) => {
    if (nextMode === inputMode) {
      return;
    }

    const parsedCurrentValue = Number(inputValue);
    if (!Number.isFinite(parsedCurrentValue) || parsedCurrentValue <= 0) {
      setInputMode(nextMode);
      setInputValue(
        formatCompactDecimal(
          normalizeServingInput(getServingDefaultValue(resolvedServingConfig, nextMode)),
        ),
      );
      return;
    }

    const normalizedCurrent = normalizeServingInput(parsedCurrentValue);
    const resolvedCurrent = resolveServingValues(
      resolvedServingConfig,
      inputMode,
      normalizedCurrent,
    );
    if (!Number.isFinite(resolvedCurrent.scaleFactor) || resolvedCurrent.scaleFactor <= 0) {
      setInputMode(nextMode);
      setInputValue(
        formatCompactDecimal(
          normalizeServingInput(getServingDefaultValue(resolvedServingConfig, nextMode)),
        ),
      );
      return;
    }

    const convertedValue =
      nextMode === "weight" ? resolvedCurrent.totalWeight : resolvedCurrent.unitCount;

    setInputMode(nextMode);
    setInputValue(formatCompactDecimal(normalizeServingInput(convertedValue)));
  };

  const handleInputStep = (delta: number) => {
    const currentValue = Number(inputValue);
    const baseValue = Number.isFinite(currentValue)
      ? currentValue
      : getServingDefaultValue(resolvedServingConfig, inputMode);

    setInputValue(formatCompactDecimal(normalizeServingInput(baseValue + delta)));
  };

  const handleInputChange = (nextValue: string) => {
    setInputValue(sanitizeServingInput(nextValue));
  };

  const handleInputBlur = () => {
    const trimmedValue = inputValue.trim();

    if (!trimmedValue || trimmedValue === ".") {
      setInputValue(
        formatCompactDecimal(
          normalizeServingInput(getServingDefaultValue(resolvedServingConfig, inputMode)),
        ),
      );
      return;
    }

    const parsedValue = Number(trimmedValue);
    if (!Number.isFinite(parsedValue)) {
      setInputValue(
        formatCompactDecimal(
          normalizeServingInput(getServingDefaultValue(resolvedServingConfig, inputMode)),
        ),
      );
      return;
    }

    setInputValue(formatCompactDecimal(normalizeServingInput(parsedValue)));
  };

  return (
    <>
      <section className={styles.summarySection}>
        <div className={styles.summaryHead}>
          <div>
            <p className={`typo-title2 ${styles.foodName}`}>{previewMenu.name}</p>
            {previewMenu.brand && (
              <p className={`typo-label4 ${styles.brandName}`}>{previewMenu.brand}</p>
            )}
          </div>
          <div className={styles.calorieText}>
            <span className="typo-h2">{formatNutrientValue(previewMenu.calories)}</span>
            <span className="typo-title2">kcal</span>
          </div>
        </div>

        <div className={styles.macroRow}>
          <article className={styles.macroItem}>
            <p className={`typo-title4 ${styles.macroLabel}`}>탄수화물</p>
            <p className={`typo-body1 ${styles.macroValue}`}>
              {formatNutrientValue(previewMenu.carbs ?? 0)}
              <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
            </p>
          </article>

          <article className={styles.macroItem}>
            <p className={`typo-title4 ${styles.macroLabel}`}>단백질</p>
            <p className={`typo-body1 ${styles.macroValue}`}>
              {formatNutrientValue(previewMenu.protein ?? 0)}
              <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
            </p>
          </article>

          <article className={styles.macroItem}>
            <p className={`typo-title4 ${styles.macroLabel}`}>지방</p>
            <p className={`typo-body1 ${styles.macroValue}`}>
              {formatNutrientValue(previewMenu.fat ?? 0)}
              <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
            </p>
          </article>
        </div>
      </section>

      <section className={styles.servingInputSection}>
        <Tabs.Root
          className={styles.TabsRoot}
          value={inputMode}
          onValueChange={(nextValue) => {
            handleModeChange(nextValue === "weight" ? "weight" : "unit");
          }}
        >
          <Tabs.List className={styles.TabsList}>
            <Tabs.Tab value="unit" className={styles.TabsTab}>
              {menu.unit_quantity}
            </Tabs.Tab>
            <Tabs.Tab value="weight" className={styles.TabsTab}>
              {menu.unit === 0 ? "g" : "ml"}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="unit" className={styles.TabsPanel}>
            <NumberField.Root>
              <NumberField.Group className={styles.FieldGroup}>
                <NumberField.Decrement
                  aria-label="입력값 감소"
                  onClick={() => handleInputStep(-SERVING_INPUT_STEP)}
                >
                  <MinusIcon size={24} />
                </NumberField.Decrement>
                <NumberField.Input
                  className={`typo-body1 ${styles.FieldInput}`}
                  inputMode="decimal"
                  value={inputValue}
                  onChange={(event) => {
                    handleInputChange(event.target.value);
                  }}
                  onBlur={handleInputBlur}
                  aria-label="단위량 또는 중량 입력"
                />
                <NumberField.Increment
                  aria-label="입력값 증가"
                  onClick={() => handleInputStep(SERVING_INPUT_STEP)}
                >
                  <PlusIcon size={24} />
                </NumberField.Increment>
              </NumberField.Group>
            </NumberField.Root>
          </Tabs.Panel>

          <Tabs.Panel value="weight" className={styles.TabsPanel}>
            <NumberField.Root>
              <NumberField.Group className={styles.FieldGroup}>
                <NumberField.Decrement
                  aria-label="입력값 감소"
                  onClick={() => handleInputStep(-SERVING_INPUT_STEP)}
                >
                  <MinusIcon size={24} />
                </NumberField.Decrement>
                <NumberField.Input
                  className={`typo-body1 ${styles.FieldInput}`}
                  inputMode="decimal"
                  value={inputValue}
                  onChange={(event) => {
                    handleInputChange(event.target.value);
                  }}
                  onBlur={handleInputBlur}
                  aria-label="단위량 또는 중량 입력"
                />
                <NumberField.Increment
                  aria-label="입력값 증가"
                  onClick={() => handleInputStep(SERVING_INPUT_STEP)}
                >
                  <PlusIcon size={24} />
                </NumberField.Increment>
              </NumberField.Group>
            </NumberField.Root>
          </Tabs.Panel>
        </Tabs.Root>
      </section>

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

            {showEditSection && (
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
            )}

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
                              {formatNutrientValue(row.value ?? 0)}
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
