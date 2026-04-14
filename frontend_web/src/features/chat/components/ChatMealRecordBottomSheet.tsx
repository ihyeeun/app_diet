import { Select } from "@base-ui/react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import styles from "@/features/chat/styles/ChatMealRecordBottomSheet.module.css";
import { formatQuantityText } from "@/features/chat/utils/chatMeal";
import type { ChatRecommendItemResponseDto, MealType } from "@/shared/api/types/api.dto";
import { MEAL_TYPE_OPTIONS } from "@/shared/api/types/api.dto";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { Button } from "@/shared/commons/button/Button";

type SelectedMenuItem = {
  id: number;
  quantity: number;
};

type ServingWeightUnit = "g" | "ml";
type ServingInputMode = "unit" | "weight";

type ServingContext = {
  baseWeight: number;
  unitLabel: string;
  weightUnit: ServingWeightUnit;
};

const MEAL_TYPE_ICON_MAP = {
  "0": "/icons/breakfast.svg",
  "1": "/icons/lunch.svg",
  "2": "/icons/dinner.svg",
  "3": "/icons/snack.svg",
  "4": "/icons/pizza-icon.svg",
} satisfies Record<MealType, string>;

type ChatMealRecordBottomSheetProps = {
  isOpen: boolean;
  recommendations: ChatRecommendItemResponseDto[];
  selectedMenus: SelectedMenuItem[];
  mealType: MealType;
  isSubmitPending?: boolean;
  submitLabel?: string;
  onMealTypeChange: (mealType: MealType) => void;
  onQuantityChange: (menuId: number, nextQuantity: number) => void;
  onRemoveMenu: (menuId: number) => void;
  onAddMore?: () => void;
  onClose: () => void;
  onSubmit: () => void;
};

const QUANTITY_STEP = 0.5;
const MIN_QUANTITY = 0.1;
const UNIT_QUANTITY_PRECISION = 4;
const WEIGHT_TOKEN_PATTERN = /([\d.]+)\s*(g|ml)\b/i;
const PARENTHESIS_PATTERN = /\(([^)]+)\)/;

function formatCalories(value: number) {
  return value.toLocaleString("ko-KR", {
    maximumFractionDigits: 1,
  });
}

function roundDecimal(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function toPositiveNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  return value;
}

function parseUnitLabel(amount: string) {
  const beforeParenthesis = amount.split("(")[0]?.trim() ?? "";
  const cleaned = beforeParenthesis.replace(/^[\d.\s]+/, "").trim();
  return cleaned || "인분";
}

function parseServingContext(amount: string): ServingContext {
  const unitLabel = parseUnitLabel(amount);
  const parenthesisContent = amount.match(PARENTHESIS_PATTERN)?.[1] ?? "";
  const weightToken =
    parenthesisContent.match(WEIGHT_TOKEN_PATTERN) ?? amount.match(WEIGHT_TOKEN_PATTERN);
  if (!weightToken) {
    return {
      baseWeight: 1,
      unitLabel,
      weightUnit: "g",
    };
  }

  const parsedWeight = toPositiveNumber(Number(weightToken[1]));

  return {
    baseWeight: parsedWeight ?? 1,
    unitLabel,
    weightUnit: weightToken[2].toLowerCase() === "ml" ? "ml" : "g",
  };
}

function getDisplayValue(
  unitQuantity: number,
  mode: ServingInputMode,
  servingContext: ServingContext,
) {
  if (mode === "unit") {
    return roundDecimal(unitQuantity, 1);
  }

  return roundDecimal(unitQuantity * servingContext.baseWeight, 1);
}

function toUnitQuantity(
  displayValue: number,
  mode: ServingInputMode,
  servingContext: ServingContext,
) {
  if (mode === "unit") {
    return roundDecimal(displayValue, 1);
  }

  return roundDecimal(displayValue / servingContext.baseWeight, UNIT_QUANTITY_PRECISION);
}

export function ChatMealRecordBottomSheet({
  isOpen,
  recommendations,
  selectedMenus,
  mealType,
  isSubmitPending = false,
  submitLabel = "담기",
  onMealTypeChange,
  onQuantityChange,
  onRemoveMenu,
  onAddMore,
  onClose,
  onSubmit,
}: ChatMealRecordBottomSheetProps) {
  const [modeByMenuId, setModeByMenuId] = useState<Record<number, ServingInputMode>>({});

  const recommendationById = useMemo(
    () => new Map(recommendations.map((item) => [item.menu_id, item])),
    [recommendations],
  );

  const selectedItems = useMemo(() => {
    return selectedMenus
      .map((menu) => {
        const recommendation = recommendationById.get(menu.id);
        if (!recommendation) {
          return null;
        }

        return {
          ...menu,
          recommendation,
          servingContext: parseServingContext(recommendation.amount),
          mode: modeByMenuId[menu.id] ?? "unit",
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [modeByMenuId, recommendationById, selectedMenus]);

  const totalCalories = selectedItems.reduce((sum, item) => {
    return sum + item.recommendation.calories * item.quantity;
  }, 0);

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <section className={styles.container}>
        <div className={styles.scrollArea}>
          <article className={styles.calorieCard}>
            <span className="typo-title2">총 칼로리</span>
            <p className="typo-title2">
              <span className={`${styles.calorieValue} typo-h3`}>
                {formatCalories(totalCalories)}
              </span>{" "}
              kcal
            </p>
          </article>

          <section>
            <p className={`${styles.sectionTitle} typo-title2`}>섭취시간대</p>
            <div className={styles.mealTypeList}>
              {MEAL_TYPE_OPTIONS.map((option) => {
                const isActive = option.key === mealType;
                const iconSrc = MEAL_TYPE_ICON_MAP[option.key];

                return (
                  <div className={styles.mealTypeButtonWrapper} key={option.key}>
                    <button
                      type="button"
                      className={`${styles.mealTypeButton} ${isActive ? styles.mealTypeButtonActive : ""}`}
                      onClick={() => onMealTypeChange(option.key)}
                      aria-pressed={isActive}
                      aria-label={option.label}
                    >
                      <img src={iconSrc} width={32} height={32} aria-hidden="true" />
                    </button>
                    <span
                      className={`${isActive ? styles.primaryText : styles.secondaryText} typo-label4`}
                    >
                      {option.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={styles.menuSection}>
            {selectedItems.map((item) => {
              const displayValue = getDisplayValue(item.quantity, item.mode, item.servingContext);
              const selectLabel =
                item.mode === "unit"
                  ? item.servingContext.unitLabel
                  : item.servingContext.weightUnit;

              return (
                <article key={item.id} className={styles.menuItem}>
                  <div className={styles.menuNameRow}>
                    <p className="typo-title2">{item.recommendation.menu}</p>
                    {item.recommendation.brand && (
                      <p className={`${styles.tertiaryText} typo-label4`}>
                        {item.recommendation.brand}
                      </p>
                    )}
                  </div>

                  <div className={styles.quantityControlRow}>
                    <div className={styles.quantityStepper}>
                      <button
                        type="button"
                        className={styles.quantityStepperButton}
                        aria-label={`${item.recommendation.menu} 수량 감소`}
                        onClick={() => {
                          const nextDisplayValue = roundDecimal(displayValue - QUANTITY_STEP, 1);
                          const nextUnitQuantity = toUnitQuantity(
                            nextDisplayValue,
                            item.mode,
                            item.servingContext,
                          );

                          if (nextDisplayValue < MIN_QUANTITY) {
                            onRemoveMenu(item.id);
                            return;
                          }

                          onQuantityChange(item.id, nextUnitQuantity);
                        }}
                      >
                        <Minus size={24} />
                      </button>

                      <span className={`${styles.quantityValue} typo-body1`}>
                        {formatQuantityText(displayValue)}
                      </span>

                      <button
                        type="button"
                        className={styles.quantityStepperButton}
                        aria-label={`${item.recommendation.menu} 수량 증가`}
                        onClick={() => {
                          const nextDisplayValue = roundDecimal(displayValue + QUANTITY_STEP, 1);
                          const nextUnitQuantity = toUnitQuantity(
                            nextDisplayValue,
                            item.mode,
                            item.servingContext,
                          );

                          onQuantityChange(item.id, nextUnitQuantity);
                        }}
                      >
                        <Plus size={24} />
                      </button>
                    </div>

                    <Select.Root
                      value={item.mode}
                      onValueChange={(nextValue) => {
                        const safeMode = nextValue === "weight" ? "weight" : "unit";
                        setModeByMenuId((prev) => ({
                          ...prev,
                          [item.id]: safeMode,
                        }));
                      }}
                    >
                      <Select.Trigger className={`${styles.unitSelectTrigger} typo-h3`}>
                        <Select.Value className="typo-body3">{selectLabel}</Select.Value>
                        <Select.Icon className={styles.selectIcon} aria-hidden>
                          <ChevronDown size={24} />
                        </Select.Icon>
                      </Select.Trigger>

                      <Select.Portal>
                        <Select.Positioner className={styles.selectPositioner}>
                          <Select.Popup className={styles.selectPopup}>
                            <Select.List className={styles.selectList}>
                              <Select.Item
                                value="unit"
                                className={`${styles.selectItem} typo-body3`}
                              >
                                <Select.ItemText>{item.servingContext.unitLabel}</Select.ItemText>
                              </Select.Item>
                              <Select.Item
                                value="weight"
                                className={`${styles.selectItem} typo-body3`}
                              >
                                <Select.ItemText>{item.servingContext.weightUnit}</Select.ItemText>
                              </Select.Item>
                            </Select.List>
                          </Select.Popup>
                        </Select.Positioner>
                      </Select.Portal>
                    </Select.Root>
                  </div>
                </article>
              );
            })}
          </section>

          {onAddMore ? (
            <section className={styles.additionalAction}>
              <p className={`${styles.secondaryText} typo-label3`}>다른 메뉴도 드셨나요?</p>
              <Button
                variant="text"
                state="default"
                size="small"
                color="assistive"
                onClick={onAddMore}
              >
                추가하러 가기
              </Button>
            </section>
          ) : null}
        </div>

        <div className={styles.actionBar}>
          <Button
            variant="filled"
            state={selectedItems.length > 0 && !isSubmitPending ? "default" : "disabled"}
            size="medium"
            color="primary"
            fullWidth
            disabled={selectedItems.length === 0 || isSubmitPending}
            onClick={onSubmit}
          >
            {isSubmitPending ? "저장 중..." : submitLabel}
          </Button>
        </div>
      </section>
    </BottomSheet>
  );
}
