import { PATH } from "@/router/path";
import { getMealRecordPath } from "@/features/meal-record/utils/mealRecord.paths";
import {
  DEFAULT_MEAL_TYPE,
  MAX_MEAL_RECORD_MENUS,
  type MealMenuItem,
  type MealRecordLocationState,
  type MealType,
} from "@/features/meal-record";
import { getTodayDateKey } from "@/features/meal-record/utils/mealRecord.queryParams";
import { ServingAmountSheetContent } from "@/features/meal-record/components/ServingAmountSheetContent";
import { useServingAmountSheet } from "@/features/meal-record/hooks/useServingAmountSheet";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";
import { useMemo, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./styles/NutritionAddDetailPage.module.css";
import type { NutritionAddLocationState, NutritionInitialFormState } from "./nutritionEntry.types";

type NutritionDetailForm = {
  calories: string;
  carbohydrate: string;
  protein: string;
  fat: string;
  totalWeight: string;
  sugar: string;
  sugarAlcohol: string;
  dietaryFiber: string;
  transFat: string;
  saturatedFat: string;
  unsaturatedFat: string;
  cholesterol: string;
  sodium: string;
  caffeine: string;
  potassium: string;
  alcohol: string;
};

type DetailFieldConfig = {
  key: keyof NutritionDetailForm;
  label: string;
  unit: "g" | "mg" | "ml";
  variant: "main" | "sub";
  group:
    | "serving"
    | "carbohydrate"
    | "protein"
    | "fat"
    | "sodium"
    | "caffeine"
    | "potassium"
    | "cholesterol"
    | "alcohol";
  required?: boolean;
};

const MACRO_FIELD_CONFIG: Array<{ key: "carbohydrate" | "protein" | "fat"; label: string }> = [
  { key: "carbohydrate", label: "탄수화물" },
  { key: "protein", label: "단백질" },
  { key: "fat", label: "지방" },
];

const DETAIL_FIELD_CONFIG: DetailFieldConfig[] = [
  {
    key: "totalWeight",
    label: "총 용량",
    unit: "g",
    variant: "main",
    group: "serving",
    required: true,
  },
  { key: "carbohydrate", label: "탄수화물", unit: "g", variant: "main", group: "carbohydrate" },
  { key: "sugar", label: "당", unit: "g", variant: "sub", group: "carbohydrate" },
  {
    key: "sugarAlcohol",
    label: "당알코올(대체당)",
    unit: "g",
    variant: "sub",
    group: "carbohydrate",
  },
  { key: "dietaryFiber", label: "식이섬유", unit: "g", variant: "sub", group: "carbohydrate" },
  { key: "protein", label: "단백질", unit: "g", variant: "main", group: "protein" },
  { key: "fat", label: "지방", unit: "g", variant: "main", group: "fat" },
  { key: "saturatedFat", label: "포화지방", unit: "g", variant: "sub", group: "fat" },
  { key: "transFat", label: "트랜스지방", unit: "g", variant: "sub", group: "fat" },
  { key: "unsaturatedFat", label: "불포화지방", unit: "g", variant: "sub", group: "fat" },
  { key: "sodium", label: "나트륨", unit: "mg", variant: "main", group: "sodium" },
  { key: "caffeine", label: "카페인", unit: "mg", variant: "main", group: "caffeine" },
  { key: "potassium", label: "칼륨", unit: "mg", variant: "main", group: "potassium" },
  { key: "cholesterol", label: "콜레스테롤", unit: "mg", variant: "main", group: "cholesterol" },
  { key: "alcohol", label: "알코올", unit: "g", variant: "main", group: "alcohol" },
];

const REQUIRED_FIELDS: Array<keyof NutritionDetailForm> = [
  "calories",
  "carbohydrate",
  "protein",
  "fat",
  "totalWeight",
];

const INITIAL_FORM: NutritionDetailForm = {
  calories: "",
  carbohydrate: "",
  protein: "",
  fat: "",
  totalWeight: "",
  sugar: "",
  sugarAlcohol: "",
  dietaryFiber: "",
  transFat: "",
  saturatedFat: "",
  unsaturatedFat: "",
  cholesterol: "",
  sodium: "",
  caffeine: "",
  potassium: "",
  alcohol: "",
};

const NUTRITION_FORM_KEYS = Object.keys(INITIAL_FORM) as Array<keyof NutritionDetailForm>;

const MIN_NUTRITION_VALUE = 0;
const MAX_NUTRITION_VALUE = 9999.9;
const SINGLE_DECIMAL_STEP = 0.1;
const MAX_COMPARE_MENUS = 20;

const NUTRIENT_CHILD_RULES = [
  {
    parent: "carbohydrate",
    children: ["sugar", "sugarAlcohol", "dietaryFiber"],
  },
  {
    parent: "fat",
    children: ["saturatedFat", "transFat", "unsaturatedFat"],
  },
] as const;

function sanitizeDecimalInput(value: string) {
  const numericOnly = value.replace(/[^0-9.]/g, "");
  const [integerPart, ...decimalParts] = numericOnly.split(".");

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join("").slice(0, 1)}`;
}

function normalizeDecimalInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed || trimmed === ".") {
    return "";
  }

  const parsed = Number(trimmed);

  if (Number.isNaN(parsed)) {
    return "";
  }

  const clamped = Math.min(MAX_NUTRITION_VALUE, Math.max(MIN_NUTRITION_VALUE, parsed));
  return clamped.toFixed(1);
}

function buildInitialForm(initialNutrition?: NutritionInitialFormState): NutritionDetailForm {
  const nextForm = { ...INITIAL_FORM };
  if (!initialNutrition) return nextForm;

  NUTRITION_FORM_KEYS.forEach((key) => {
    const value = initialNutrition[key];
    if (typeof value !== "number" || !Number.isFinite(value)) return;
    nextForm[key] = normalizeDecimalInput(String(value));
  });

  return nextForm;
}

function getStepByUnit(unit: DetailFieldConfig["unit"]) {
  if (unit === "g" || unit === "ml") {
    return SINGLE_DECIMAL_STEP;
  }

  return SINGLE_DECIMAL_STEP;
}

function normalizeNutritionFormValues(form: NutritionDetailForm): NutritionDetailForm {
  const nextForm = { ...form };

  (Object.keys(form) as Array<keyof NutritionDetailForm>).forEach((key) => {
    nextForm[key] = normalizeDecimalInput(form[key]);
  });

  return nextForm;
}

function toNumber(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
}

function toNullableNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === ".") return null;

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

function hasChildNutrientOverflow(form: NutritionDetailForm) {
  return NUTRIENT_CHILD_RULES.some((rule) => {
    const parentValue = toNumber(form[rule.parent]);
    const childrenSum = rule.children.reduce((sum, key) => sum + toNumber(form[key]), 0);
    return childrenSum > parentValue + 1e-9;
  });
}

function buildManualMenuItem({
  foodName,
  brandName,
  form,
}: {
  foodName: string;
  brandName: string;
  form: NutritionDetailForm;
}): MealMenuItem {
  const totalWeight = toNumber(form.totalWeight);
  const safeWeightText =
    totalWeight > 0 ? `${totalWeight.toFixed(1)}g` : `${MIN_NUTRITION_VALUE.toFixed(1)}g`;

  return {
    id: `manual-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: foodName,
    calories: toNumber(form.calories),
    dataSource: "personal",
    unitAmountText: `1회 제공량 (${safeWeightText})`,
    carbohydrateGram: toNumber(form.carbohydrate),
    proteinGram: toNumber(form.protein),
    fatGram: toNumber(form.fat),
    totalWeightGram: totalWeight > 0 ? totalWeight : null,
    sugarGram: toNullableNumber(form.sugar),
    sugarAlcoholGram: toNullableNumber(form.sugarAlcohol),
    dietaryFiberGram: toNullableNumber(form.dietaryFiber),
    transFatGram: toNullableNumber(form.transFat),
    saturatedFatGram: toNullableNumber(form.saturatedFat),
    unsaturatedFatGram: toNullableNumber(form.unsaturatedFat),
    sodiumMg: toNullableNumber(form.sodium),
    caffeineMg: toNullableNumber(form.caffeine),
    potassiumMg: toNullableNumber(form.potassium),
    cholesterolMg: toNullableNumber(form.cholesterol),
    alcoholGram: toNullableNumber(form.alcohol),
    brandChipLabel: brandName || undefined,
    personalChipLabel: "직접 입력",
  };
}

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function NutritionAddDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as NutritionAddLocationState;
  const {
    source = "general",
    dateKey,
    mealType,
    existingMenuCount = 0,
    existingCompareCount = 0,
  } = locationState;
  const initialNutrition = locationState.initialNutrition;
  const brandName = (locationState.brandName ?? "").trim();
  const foodName = (locationState.foodName ?? "").trim();
  const pendingMenus = Array.isArray(locationState.pendingMenus) ? locationState.pendingMenus : [];
  const pendingCompareMenus = Array.isArray(locationState.pendingCompareMenus)
    ? locationState.pendingCompareMenus
    : [];
  const [form, setForm] = useState<NutritionDetailForm>(() => buildInitialForm(initialNutrition));
  const pageTitle = initialNutrition ? "영양성분 수정" : "영양성분 등록";
  const submitButtonLabel = initialNutrition ? "수정해서 담기" : "등록하기";

  const displayFoodName = foodName || "음식명을 입력해주세요";
  const displayBrandName = brandName;

  const isSubmitDisabled = useMemo(
    () =>
      REQUIRED_FIELDS.some((key) => normalizeDecimalInput(form[key]) === "") ||
      foodName.length === 0,
    [foodName, form],
  );

  const servingSheet = useServingAmountSheet({
    onSubmitMenu: (nextMenu) => {
      const nextPendingMenus = [...pendingMenus, nextMenu];
      if (existingMenuCount + nextPendingMenus.length > MAX_MEAL_RECORD_MENUS) {
        toast.warning("최대 100개까지 기록할 수 있어요");
        return false;
      }

      const nextDateKey = dateKey ?? getTodayDateKey();
      const nextMealType: MealType = mealType ?? DEFAULT_MEAL_TYPE;

      toast.success("등록되었어요");
      navigate(getMealRecordPath(nextDateKey, nextMealType), {
        state: {
          pendingMenus: nextPendingMenus,
        } satisfies MealRecordLocationState,
      });
      return true;
    },
  });

  const handleNumericChange = (key: keyof NutritionDetailForm) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = sanitizeDecimalInput(event.target.value);
      setForm((prev) => ({ ...prev, [key]: nextValue }));
    };
  };

  const handleNumericBlur = (key: keyof NutritionDetailForm) => {
    return () => {
      setForm((prev) => ({ ...prev, [key]: normalizeDecimalInput(prev[key]) }));
    };
  };

  const handleBack = () => {
    if (location.state) {
      navigate(-1);
      return;
    }

    navigate(PATH.NUTRITION_ADD);
  };

  const handleResetForm = () => {
    setForm({ ...INITIAL_FORM });
  };

  const handleSubmit = () => {
    const normalizedForm = normalizeNutritionFormValues(form);
    setForm(normalizedForm);

    if (REQUIRED_FIELDS.some((key) => normalizedForm[key] === "")) {
      return;
    }

    if (toNumber(normalizedForm.totalWeight) <= 0) {
      toast.warning("중량을 다시 확인해주세요");
      return;
    }

    if (hasChildNutrientOverflow(normalizedForm)) {
      toast.warning("하위 항목 합이 상위 항목을 초과했어요");
      return;
    }

    const registeredMenu = buildManualMenuItem({
      foodName: displayFoodName,
      brandName: displayBrandName,
      form: normalizedForm,
    });

    if (source === "meal-record") {
      servingSheet.open({ menu: registeredMenu });
      return;
    }

    if (source === "menu-compare") {
      const nextPendingCompareMenus = [...pendingCompareMenus, registeredMenu];
      if (existingCompareCount + nextPendingCompareMenus.length > MAX_COMPARE_MENUS) {
        toast.warning("최대 20개까지 비교할 수 있어요");
        return;
      }

      toast.success("등록되었어요");
      navigate(PATH.COMPARE, {
        state: {
          pendingMenus: nextPendingCompareMenus,
        },
      });
      return;
    }

    toast.success("등록되었어요");
    navigate(-1);
  };

  return (
    <section className={styles.page}>
      <PageHeader title={pageTitle} onBack={handleBack} />

      <main className={styles.main}>
        <section className={styles.summarySection}>
          <div className={styles.foodInfoRow}>
            <div className={styles.foodTextWrap}>
              {displayBrandName && (
                <p className={`typo-title3 ${styles.brandText}`}>{displayBrandName}</p>
              )}
              <p className={`typo-title2 ${styles.foodNameText}`}>{displayFoodName}</p>
            </div>

            <div className={styles.calorieInputWrap}>
              <input
                className={`${styles.calorieInput} typo-h2`}
                type="text"
                value={form.calories}
                onChange={handleNumericChange("calories")}
                onBlur={handleNumericBlur("calories")}
                min={MIN_NUTRITION_VALUE}
                max={MAX_NUTRITION_VALUE}
                step={SINGLE_DECIMAL_STEP}
                placeholder="0.0"
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
                    onChange={handleNumericChange(field.key)}
                    onBlur={handleNumericBlur(field.key)}
                    min={MIN_NUTRITION_VALUE}
                    max={MAX_NUTRITION_VALUE}
                    step={SINGLE_DECIMAL_STEP}
                    placeholder="0.0"
                    inputMode="decimal"
                    aria-label={`${field.label} 입력`}
                  />
                  <span className={`typo-body1 ${styles.macroUnitText}`}>g</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.detailSection}>
          <header className={styles.detailHeader}>
            <p className="typo-title3">영양정보</p>
            <Button
              variant="text"
              state="default"
              size="small"
              color="assistive"
              onClick={handleResetForm}
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
                    {field.label}
                  </p>

                  <div className={styles.detailInputWrap}>
                    <input
                      className={`typo-body2 ${styles.detailInput}`}
                      type="text"
                      value={form[field.key]}
                      onChange={handleNumericChange(field.key)}
                      onBlur={handleNumericBlur(field.key)}
                      min={MIN_NUTRITION_VALUE}
                      max={MAX_NUTRITION_VALUE}
                      step={getStepByUnit(field.unit)}
                      placeholder="0.0"
                      inputMode="decimal"
                      aria-label={`${field.label} 입력`}
                    />
                    <span className={`typo-label2 ${styles.unitText}`}>{field.unit}</span>
                  </div>
                </article>
              </div>
            );
          })}
        </section>
      </main>

      <footer className={styles.footer}>
        <Button
          onClick={handleSubmit}
          variant="filled"
          size="large"
          color="primary"
          fullWidth
          state={isSubmitDisabled ? "disabled" : "default"}
          disabled={isSubmitDisabled}
        >
          {submitButtonLabel}
        </Button>
      </footer>

      <BottomSheet isOpen={servingSheet.isOpen} onClose={servingSheet.close}>
        {servingSheet.menu && servingSheet.serving && (
          <ServingAmountSheetContent
            menu={servingSheet.menu}
            serving={servingSheet.serving}
            previewMenu={servingSheet.previewMenu ?? servingSheet.menu}
            inputMode={servingSheet.inputMode}
            inputValue={servingSheet.inputValue}
            onModeChange={servingSheet.onModeChange}
            onInputChange={servingSheet.onInputChange}
            onInputBlur={servingSheet.onInputBlur}
            onDecrease={servingSheet.onDecrease}
            onIncrease={servingSheet.onIncrease}
            onSubmit={servingSheet.onSubmit}
          />
        )}
      </BottomSheet>
    </section>
  );
}
