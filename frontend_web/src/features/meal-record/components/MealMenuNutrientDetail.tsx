import { Tabs } from "@base-ui/react";
import { Popover } from "@base-ui/react/popover";
import { ChevronDown, ChevronUp, MinusIcon, PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { NUTRIENT_FORM_CONFIG } from "@/features/nutrient-entry/constants/nutrientDetailForm";
import {
  type MealMenuItem,
  type MealServingInputMode,
  MENU_NUTRIENT_FIELD_KEYS,
  MENU_UNIT,
  type MenuNutrientFieldKey,
} from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";
import NumberField from "@/shared/commons/input/NumberField";

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

const DEFAULT_QUANTITY = 1;
const MIN_QUANTITY = 0.1;
const MAX_QUANTITY = 9999.9;
const QUANTITY_STEP = 0.5;
const QUANTITY_STEP_BASE = 0;
const QUANTITY_INPUT_PATTERN = /^\d{0,4}(?:\.\d?)?$/;
const UNIT_QUANTITY_PATTERN = /^\s*([\d.]+)\s*[^()]*\(([^)]+)\)\s*$/i;
const WEIGHT_TOKEN_PATTERN = /([\d.]+)\s*(g|ml)\b/i;
const DETAIL_WARNING_MESSAGE = [
  "실제로는 더 많이 들어있을 수 있어요.",
  "판매사에서 정확한 정보를 제공하고 있지 않아요.",
] as const;

type NutrientGroup = (typeof NUTRIENT_FORM_CONFIG)[number]["group"] | "serving";
const DETAIL_GROUP_ORDER: ReadonlyArray<NutrientGroup> = [
  "serving",
  "carbs",
  "protein",
  "fat",
  "sodium",
  "caffeine",
  "potassium",
  "cholesterol",
  "alcohol",
];

type DetailRow = {
  key: MenuNutrientFieldKey | "totalWeight";
  label: string;
  unit: "g" | "mg" | "ml";
  value: number | null;
  variant: "main" | "sub";
  group: NutrientGroup;
  showWarning: boolean;
};

type DetailGroupSection = {
  group: NutrientGroup;
  rows: DetailRow[];
};

type ParsedServingContext = {
  baseUnitCount: number;
  baseWeight: number;
  weightUnit: "g" | "ml";
};

type ResolvedServingValues = {
  unitCount: number;
  totalWeight: number;
  scaleFactor: number;
};

function toPositiveNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function toNullableNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function roundDecimal(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clampQuantityValue(value: number) {
  return Math.min(MAX_QUANTITY, Math.max(MIN_QUANTITY, roundDecimal(value, 1)));
}

function getSteppedQuantity(currentValue: number, direction: -1 | 1) {
  const stepOffset = (currentValue - QUANTITY_STEP_BASE) / QUANTITY_STEP;
  const nextStepCount =
    direction > 0
      ? Math.floor(stepOffset + Number.EPSILON) + 1
      : Math.ceil(stepOffset - Number.EPSILON) - 1;
  const nextValue = QUANTITY_STEP_BASE + nextStepCount * QUANTITY_STEP;
  return clampQuantityValue(nextValue);
}

function isQuantityInputAllowed(inputValue: string) {
  const normalized = inputValue.trim();
  if (normalized === "") {
    return true;
  }

  if (!QUANTITY_INPUT_PATTERN.test(normalized)) {
    return false;
  }

  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) {
    return false;
  }

  return numeric <= MAX_QUANTITY;
}

function scaleNutrientValue(value: number | null | undefined, scaleFactor: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return roundDecimal(value * scaleFactor);
}

function scaleRequiredValue(value: number, scaleFactor: number) {
  return roundDecimal(value * scaleFactor);
}

function formatNutrientValue(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "0";
  }

  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

const REQUIRED_NUTRIENT_KEYS: ReadonlySet<MenuNutrientFieldKey> = new Set([
  "carbs",
  "protein",
  "fat",
]);
const DETAIL_LABEL_OVERRIDES: Partial<Record<MenuNutrientFieldKey, string>> = {
  sugars: "당류",
  sugar_alchol: "당알코올(대체당)",
};

function buildDetailRows({
  menu,
}: {
  menu: MealMenuItem;
  fallbackWeight: number;
  fallbackWeightUnit: "g" | "ml";
}): DetailRow[] {
  return [
    ...NUTRIENT_FORM_CONFIG.map((field) => ({
      key: field.key,
      label: DETAIL_LABEL_OVERRIDES[field.key] ?? field.label,
      unit: field.unit,
      value: toNullableNumber(menu[field.key]),
      variant: field.variant,
      group: field.group,
      showWarning: field.variant === "main" && REQUIRED_NUTRIENT_KEYS.has(field.key),
    })),
  ];
}

function buildDetailGroups(rows: DetailRow[]): DetailGroupSection[] {
  return DETAIL_GROUP_ORDER.map((group) => ({
    group,
    rows: rows.filter((row) => row.group === group && row.value !== null),
  })).filter((section) => section.rows.length > 0);
}

function parseServingContext(menu: MealMenuItem): ParsedServingContext {
  const unitQuantityText = menu.unit_quantity ?? "";
  const unitQuantityMatch = unitQuantityText.match(UNIT_QUANTITY_PATTERN);
  const weightToken =
    unitQuantityMatch?.[2]?.match(WEIGHT_TOKEN_PATTERN) ??
    unitQuantityText.match(WEIGHT_TOKEN_PATTERN);

  const parsedBaseUnitCount = unitQuantityMatch
    ? toPositiveNumber(Number(unitQuantityMatch[1]))
    : null;
  const parsedBaseWeight = weightToken ? toPositiveNumber(Number(weightToken[1])) : null;
  const fallbackWeightUnit = menu.unit === MENU_UNIT.MILLILITER ? "ml" : "g";
  const parsedWeightUnit = weightToken?.[2]?.toLowerCase() === "ml" ? "ml" : fallbackWeightUnit;

  return {
    baseUnitCount: parsedBaseUnitCount ?? DEFAULT_QUANTITY,
    baseWeight: toPositiveNumber(menu.weight) ?? parsedBaseWeight ?? DEFAULT_QUANTITY,
    weightUnit: parsedWeightUnit,
  };
}

function resolveServingValues(
  serving: ParsedServingContext,
  mode: MealServingInputMode,
  inputValue: number,
): ResolvedServingValues {
  if (mode === "unit") {
    const scaleFactor = inputValue / serving.baseUnitCount;
    return {
      unitCount: roundDecimal(inputValue, 1),
      totalWeight: roundDecimal(serving.baseWeight * scaleFactor, 1),
      scaleFactor,
    };
  }

  const scaleFactor = inputValue / serving.baseWeight;
  return {
    unitCount: roundDecimal(serving.baseUnitCount * scaleFactor, 1),
    totalWeight: roundDecimal(inputValue, 1),
    scaleFactor,
  };
}

function getModeFallbackValue(
  serving: ParsedServingContext,
  mode: MealServingInputMode,
  fallbackUnitCount: number,
) {
  if (mode === "unit") {
    return fallbackUnitCount;
  }

  const scaleFactor = fallbackUnitCount / serving.baseUnitCount;
  return roundDecimal(serving.baseWeight * scaleFactor, 1);
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
  const servingContext = useMemo(() => parseServingContext(menu), [menu]);
  const servingBaseUnitCount = servingContext.baseUnitCount;
  const servingBaseWeight = servingContext.baseWeight;
  const servingWeightUnit = servingContext.weightUnit;

  const fallbackQuantity = useMemo(() => {
    return (
      toPositiveNumber(initialQuantity) ??
      toPositiveNumber(menu.serving_input_value) ??
      DEFAULT_QUANTITY
    );
  }, [initialQuantity, menu.serving_input_value]);

  const menuInitialMode: MealServingInputMode =
    menu.serving_input_mode === "weight" ? "weight" : "unit";
  const fallbackMode: MealServingInputMode =
    initialMode === "weight" || initialMode === "unit" ? initialMode : menuInitialMode;

  const [inputMode, setInputMode] = useState<MealServingInputMode>(fallbackMode);
  const [quantityInput, setQuantityInput] = useState<number | undefined>(() => {
    return clampQuantityValue(getModeFallbackValue(servingContext, fallbackMode, fallbackQuantity));
  });

  useEffect(() => {
    // Keep local state in sync when incoming menu/selection context changes.
    const nextFallbackValue = getModeFallbackValue(
      {
        baseUnitCount: servingBaseUnitCount,
        baseWeight: servingBaseWeight,
        weightUnit: servingWeightUnit,
      },
      fallbackMode,
      fallbackQuantity,
    );

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInputMode(fallbackMode);
    setQuantityInput(clampQuantityValue(nextFallbackValue));
  }, [
    fallbackMode,
    fallbackQuantity,
    menu.id,
    servingBaseUnitCount,
    servingBaseWeight,
    servingWeightUnit,
  ]);

  const quantity = useMemo(() => toPositiveNumber(quantityInput), [quantityInput]);
  const resolvedServing = useMemo(() => {
    if (quantity === null) {
      return null;
    }

    const resolved = resolveServingValues(servingContext, inputMode, quantity);
    if (!Number.isFinite(resolved.scaleFactor) || resolved.scaleFactor <= 0) {
      return null;
    }

    return resolved;
  }, [inputMode, quantity, servingContext]);

  const previewMenu = useMemo<MealMenuItem>(() => {
    if (!resolvedServing) {
      return menu;
    }

    const { scaleFactor } = resolvedServing;
    const scaledOptionalNutrients: Partial<Record<MenuNutrientFieldKey, number | null>> = {};
    MENU_NUTRIENT_FIELD_KEYS.forEach((key) => {
      if (REQUIRED_NUTRIENT_KEYS.has(key)) {
        return;
      }

      scaledOptionalNutrients[key] = scaleNutrientValue(menu[key], scaleFactor);
    });

    const scaledWeight = scaleNutrientValue(menu.weight, scaleFactor);
    return {
      ...menu,
      ...scaledOptionalNutrients,
      calories: scaleRequiredValue(menu.calories, scaleFactor),
      carbs: scaleRequiredValue(
        typeof menu.carbs === "number" && Number.isFinite(menu.carbs) ? menu.carbs : 0,
        scaleFactor,
      ),
      protein: scaleRequiredValue(
        typeof menu.protein === "number" && Number.isFinite(menu.protein) ? menu.protein : 0,
        scaleFactor,
      ),
      fat: scaleRequiredValue(
        typeof menu.fat === "number" && Number.isFinite(menu.fat) ? menu.fat : 0,
        scaleFactor,
      ),
      weight: scaledWeight ?? resolvedServing.totalWeight,
      serving_input_mode: inputMode,
      serving_input_value: resolvedServing.unitCount,
    };
  }, [inputMode, menu, resolvedServing]);
  const detailRows = useMemo(
    () =>
      buildDetailRows({
        menu: previewMenu,
        fallbackWeight: servingBaseWeight,
        fallbackWeightUnit: servingWeightUnit,
      }),
    [previewMenu, servingBaseWeight, servingWeightUnit],
  );
  const detailGroups = useMemo(() => buildDetailGroups(detailRows), [detailRows]);

  useEffect(() => {
    if (!onSelectionChange) {
      return;
    }

    if (!resolvedServing) {
      onSelectionChange(null);
      return;
    }

    onSelectionChange({
      menu: previewMenu,
      quantity: resolvedServing.unitCount,
      mode: inputMode,
    });
  }, [inputMode, onSelectionChange, previewMenu, resolvedServing]);

  const getCurrentFallbackValue = (mode: MealServingInputMode) => {
    return clampQuantityValue(getModeFallbackValue(servingContext, mode, fallbackQuantity));
  };

  const handleModeChange = (nextMode: MealServingInputMode) => {
    if (nextMode === inputMode) {
      return;
    }

    const fallbackValue = getCurrentFallbackValue(nextMode);
    if (quantity === null) {
      setInputMode(nextMode);
      setQuantityInput(fallbackValue);
      return;
    }

    const currentResolved = resolveServingValues(servingContext, inputMode, quantity);
    if (!Number.isFinite(currentResolved.scaleFactor) || currentResolved.scaleFactor <= 0) {
      setInputMode(nextMode);
      setQuantityInput(fallbackValue);
      return;
    }

    const convertedValue =
      nextMode === "weight" ? currentResolved.totalWeight : currentResolved.unitCount;
    setInputMode(nextMode);
    setQuantityInput(clampQuantityValue(convertedValue));
  };

  const handleInputBlur = () => {
    const fallbackValue = getCurrentFallbackValue(inputMode);
    if (quantityInput === undefined || !Number.isFinite(quantityInput) || quantityInput <= 0) {
      setQuantityInput(fallbackValue);
      return;
    }

    setQuantityInput(clampQuantityValue(quantityInput));
  };

  const handleInputStep = (direction: -1 | 1) => {
    const baseValue = quantity ?? getCurrentFallbackValue(inputMode);
    setQuantityInput(getSteppedQuantity(baseValue, direction));
  };

  return (
    <>
      <section className={styles.summarySection}>
        <div className={styles.summaryHead}>
          <div className={styles.summaryContent}>
            <p className={`typo-title2 ${styles.foodName}`}>{previewMenu.name}</p>
            {previewMenu.brand && (
              <p className={`typo-label4 ${styles.brandName}`}>{previewMenu.brand}</p>
            )}
          </div>
          <div className={styles.calorieText}>
            <span className="typo-h3">{formatNutrientValue(previewMenu.calories)}</span>
            <span className="typo-label1">kcal</span>
          </div>
        </div>

        <div className={styles.macroRow}>
          <article className={styles.macroItem}>
            <p className={`typo-label3 ${styles.macroLabel}`}>탄수화물</p>
            <p className={`typo-body1 ${styles.macroValue}`}>
              {formatNutrientValue(previewMenu.carbs ?? 0)}
              <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
            </p>
          </article>

          <article className={styles.macroItem}>
            <p className={`typo-label3 ${styles.macroLabel}`}>단백질</p>
            <p className={`typo-body1 ${styles.macroValue}`}>
              {formatNutrientValue(previewMenu.protein ?? 0)}
              <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
            </p>
          </article>

          <article className={styles.macroItem}>
            <p className={`typo-label3 ${styles.macroLabel}`}>지방</p>
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
              1{menu.unit_quantity} ({menu.weight}
              {menu.unit === MENU_UNIT.GRAM ? "g" : "ml"})
            </Tabs.Tab>
            <Tabs.Tab value="weight" className={styles.TabsTab}>
              {menu.unit === MENU_UNIT.GRAM ? "g" : "ml"}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="unit" className={styles.TabsPanel}>
            <div className={styles.FieldGroup}>
              <button
                type="button"
                className={styles.StepButton}
                aria-label="입력값 감소"
                onClick={() => handleInputStep(-1)}
              >
                <MinusIcon size={24} />
              </button>
              <NumberField
                value={quantityInput}
                onChange={setQuantityInput}
                min={MIN_QUANTITY}
                max={MAX_QUANTITY}
                step={QUANTITY_STEP}
                showControls={false}
                allowOutOfRange
                normalizeValue={(value) => roundDecimal(value, 1)}
                isInputTextAllowed={isQuantityInputAllowed}
                unstyled
                classNames={{
                  group: styles.FieldInputGroup,
                  inputWrapper: styles.FieldInputWrapper,
                  input: `typo-body1 ${styles.FieldInput}`,
                }}
                format={{
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                  useGrouping: false,
                }}
                inputProps={{
                  inputMode: "decimal",
                  "aria-label": "단위량 또는 중량 입력",
                  onBlur: handleInputBlur,
                }}
              />
              <button
                type="button"
                className={styles.StepButton}
                aria-label="입력값 증가"
                onClick={() => handleInputStep(1)}
              >
                <PlusIcon size={24} />
              </button>
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="weight" className={styles.TabsPanel}>
            <div className={styles.FieldGroup}>
              <button
                type="button"
                className={styles.StepButton}
                aria-label="입력값 감소"
                onClick={() => handleInputStep(-1)}
              >
                <MinusIcon size={24} />
              </button>
              <NumberField
                value={quantityInput}
                onChange={setQuantityInput}
                min={MIN_QUANTITY}
                max={MAX_QUANTITY}
                step={QUANTITY_STEP}
                showControls={false}
                allowOutOfRange
                normalizeValue={(value) => roundDecimal(value, 1)}
                isInputTextAllowed={isQuantityInputAllowed}
                unstyled
                classNames={{
                  group: styles.FieldInputGroup,
                  inputWrapper: styles.FieldInputWrapper,
                  input: `typo-body1 ${styles.FieldInput}`,
                }}
                format={{
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 1,
                  useGrouping: false,
                }}
                inputProps={{
                  inputMode: "decimal",
                  "aria-label": "단위량 또는 중량 입력",
                  onBlur: handleInputBlur,
                }}
              />
              <button
                type="button"
                className={styles.StepButton}
                aria-label="입력값 증가"
                onClick={() => handleInputStep(1)}
              >
                <PlusIcon size={24} />
              </button>
            </div>
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
              <div className={styles.detailRow}>
                <p className="typo-title4">
                  총 용량 {previewMenu.weight}
                  {servingWeightUnit}
                </p>

                <div className={styles.detailValue}>
                  <span className="typo-body1">{formatNutrientValue(previewMenu.calories)}</span>
                  <span className={`${styles.detailUnit} typo-label3`}>kcal</span>
                </div>
              </div>
              {detailGroups.map((group, groupIndex) => (
                <section key={group.group} className={styles.detailGroup}>
                  <div className={styles.detailGroupRows}>
                    {group.rows.map((row) => {
                      return (
                        <div key={row.key}>
                          {groupIndex > 0 && row.variant === "main" && (
                            <div className={styles.groupDivider} />
                          )}

                          <article className={styles.detailRow}>
                            <p
                              className={`${row.variant === "sub" ? "typo-body4" : "typo-title4"} ${
                                row.variant === "sub"
                                  ? styles.detailLabelSub
                                  : styles.detailLabelMain
                              }`}
                            >
                              {row.label}
                            </p>

                            <div className={styles.detailValue}>
                              {row.showWarning && row.key !== "totalWeight" && (
                                <Popover.Root>
                                  <Popover.Trigger
                                    type="button"
                                    className={styles.warningButton}
                                    aria-label="영양성분 주의 안내"
                                  >
                                    <span className={styles.warningIcon}>!</span>
                                  </Popover.Trigger>

                                  <Popover.Portal>
                                    <Popover.Positioner
                                      className={styles.warningPositioner}
                                      side="left"
                                      align="center"
                                      sideOffset={12}
                                      collisionPadding={12}
                                    >
                                      <Popover.Popup
                                        className={`${styles.warningTooltip} typo-label3`}
                                        initialFocus={false}
                                        finalFocus={false}
                                      >
                                        {DETAIL_WARNING_MESSAGE[0]}
                                        <br />
                                        {DETAIL_WARNING_MESSAGE[1]}
                                      </Popover.Popup>
                                    </Popover.Positioner>
                                  </Popover.Portal>
                                </Popover.Root>
                              )}

                              <span className={row.variant === "sub" ? "typo-body3" : "typo-body1"}>
                                {formatNutrientValue(row.value)}
                              </span>
                              <span className={`${styles.detailUnit} typo-label3`}>{row.unit}</span>
                            </div>
                          </article>
                        </div>
                      );
                    })}
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
