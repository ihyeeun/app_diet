import { PATH } from "@/router/path";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { useMemo, useState, type ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./styles/NutritionAddDetailPage.module.css";

type NutritionAddDetailLocationState = {
  brandName?: string;
  foodName?: string;
};

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

const MIN_NUTRITION_VALUE = 0;
const MAX_NUTRITION_VALUE = 9999.9;
const SINGLE_DECIMAL_STEP = 0.1;

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

function getStepByUnit(unit: DetailFieldConfig["unit"]) {
  if (unit === "g" || unit === "ml") {
    return SINGLE_DECIMAL_STEP;
  }

  return SINGLE_DECIMAL_STEP;
}

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export default function NutritionAddDetailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { brandName = "", foodName = "" } = (location.state ??
    {}) as NutritionAddDetailLocationState;
  const [form, setForm] = useState<NutritionDetailForm>(INITIAL_FORM);

  const displayFoodName = foodName.trim() || "음식명을 입력해주세요";
  const displayBrandName = brandName.trim();

  const isSubmitDisabled = useMemo(
    () => REQUIRED_FIELDS.some((key) => !form[key].trim()) || !foodName.trim(),
    [foodName, form],
  );

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

  return (
    <section className={styles.page}>
      <PageHeader title="영양성분 등록" onBack={handleBack} />

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
                    onChange={handleNumericChange(field.key)}
                    onBlur={handleNumericBlur(field.key)}
                    min={MIN_NUTRITION_VALUE}
                    max={MAX_NUTRITION_VALUE}
                    step={SINGLE_DECIMAL_STEP}
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
                      placeholder="0"
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
          variant="filled"
          size="large"
          color="primary"
          fullWidth
          state={isSubmitDisabled ? "disabled" : "default"}
          disabled={isSubmitDisabled}
        >
          등록하기
        </Button>
      </footer>
    </section>
  );
}
