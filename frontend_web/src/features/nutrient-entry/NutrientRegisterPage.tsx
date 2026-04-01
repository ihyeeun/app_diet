import { Search } from "lucide-react";
import { type ChangeEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  formatMenuDraftKey,
  useMenuDraftUpsert,
} from "@/features/meal-record/stores/menuDraft.store";
import { getMealRecordAddSearchPath } from "@/features/meal-record/utils/mealRecord.paths";
import { type RegisterManualMenuPayload } from "@/features/nutrient-entry/api/manualMenu";
import { registerMenu } from "@/features/nutrient-entry/api/nutrient";
import { NutrientDetailForm } from "@/features/nutrient-entry/components/NutrientDetailForm";
import { PATH } from "@/router/path";
import type {
  MealType,
  MenuNutrientFields,
  MenuUnit,
  RegisterMenuRequestDto,
} from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";

import styles from "./styles/NutrientRegisterPage.module.css";

type NutrientRegisterFlowState = {
  dateKey?: string;
  mealType?: MealType;
};

type NutrientRegisterLocationState = Partial<RegisterMenuRequestDto> &
  NutrientRegisterFlowState & {
    brandName?: string;
  };

function toNullableNumber(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

export function NutrientRegisterPage() {
  const navigation = useNavigate();
  const location = useLocation();
  const upsertMenu = useMenuDraftUpsert();
  const locationState = (location.state ?? {}) as NutrientRegisterLocationState;

  const [formState, setFormState] = useState<Partial<RegisterMenuRequestDto>>(() => ({
    ...locationState,
    name: (locationState.name ?? "").trim(),
    brand: (locationState.brand ?? locationState.brandName ?? "").trim(),
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const brandName = (formState.brand ?? "").trim();
  const nutrientForm: Partial<MenuNutrientFields> = {
    carbs: formState.carbs,
    sugars: formState.sugars,
    sugar_alchol: formState.sugar_alchol,
    dietary_fiber: formState.dietary_fiber,
    protein: formState.protein,
    fat: formState.fat,
    sat_fat: formState.sat_fat,
    trans_fat: formState.trans_fat,
    un_sat_fat: formState.un_sat_fat,
    sodium: formState.sodium,
    caffeine: formState.caffeine,
    potassium: formState.potassium,
    cholesterol: formState.cholesterol,
    alcohol: formState.alcohol,
  };

  const handleFieldChange = (key: keyof MenuNutrientFields, nextValue: string) => {
    const parsedValue = nextValue === "" ? undefined : Number(nextValue);

    setFormState((prev) => ({
      ...prev,
      [key]: parsedValue !== undefined && Number.isFinite(parsedValue) ? parsedValue : undefined,
    }));
  };

  const handleFoodNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({
      ...prev,
      name: event.target.value,
    }));
  };

  const handleOpenBrandSearch = () => {
    navigation(PATH.BRAND_SEARCH, {
      state: {
        ...formState,
        dateKey: locationState.dateKey,
        mealType: locationState.mealType,
      },
    });
  };

  const isSubmitDisabled =
    isSubmitting ||
    (formState.name ?? "").trim().length === 0 ||
    (formState.weight ?? 0) <= 0 ||
    (formState.calories ?? 0) <= 0;

  const handleSubmit = async () => {
    if (isSubmitDisabled) {
      return;
    }

    const name = (formState.name ?? "").trim();
    const brand = (formState.brand ?? "").trim();
    const weight = formState.weight ?? 0;
    const calories = formState.calories ?? 0;
    const unit: MenuUnit = formState.unit === 1 ? 1 : 0;

    const payload: RegisterManualMenuPayload = {
      name,
      brand,
      unit,
      weight,
      calories,
      carbs: toNullableNumber(formState.carbs),
      sugars: toNullableNumber(formState.sugars),
      sugar_alchol: toNullableNumber(formState.sugar_alchol),
      dietary_fiber: toNullableNumber(formState.dietary_fiber),
      protein: toNullableNumber(formState.protein),
      fat: toNullableNumber(formState.fat),
      sat_fat: toNullableNumber(formState.sat_fat),
      trans_fat: toNullableNumber(formState.trans_fat),
      un_sat_fat: toNullableNumber(formState.un_sat_fat),
      sodium: toNullableNumber(formState.sodium),
      caffeine: toNullableNumber(formState.caffeine),
      potassium: toNullableNumber(formState.potassium),
      cholesterol: toNullableNumber(formState.cholesterol),
      alcohol: toNullableNumber(formState.alcohol),
    };

    try {
      setIsSubmitting(true);
      const savedMenuId = await registerMenu(payload);

      if (locationState.dateKey && locationState.mealType) {
        upsertMenu({
          key: formatMenuDraftKey(locationState.dateKey, locationState.mealType),
          id: savedMenuId,
          quantity: 1,
        });

        const returnPath = getMealRecordAddSearchPath(
          locationState.dateKey,
          locationState.mealType,
        );
        toast.success("등록되었어요");
        navigation(returnPath, { replace: true });
        return;
      }

      toast.success("등록되었어요");
      handleBack();
    } catch {
      toast.warning("등록에 실패했어요");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigation(PATH.MEAL_RECORD_ADD_SEARCH, {
      state: {
        dateKey: locationState.dateKey,
        mealType: locationState.mealType,
      },
    });
  };

  return (
    <section className={styles.page}>
      <PageHeader title="영양성분 등록" onBack={() => handleBack()} />

      <main className={styles.main}>
        <div className={styles.content}>
          <section className={styles.topSection}>
            <div className={styles.fieldWrap}>
              <div className={styles.labelRow}>
                <p className={`typo-title3 ${styles.labelText}`}>음식명</p>
                <p className={`typo-label6 ${styles.requiredText}`}>* 필수로 작성해주세요</p>
              </div>

              <input
                className={`typo-body3 ${styles.textInput}`}
                type="text"
                value={formState.name ?? ""}
                onChange={handleFoodNameChange}
                placeholder="음식명 입력"
                aria-label="음식명 입력"
              />
            </div>

            <div className={styles.fieldWrap}>
              <p className={`typo-title3 ${styles.labelText}`}>브랜드명</p>
              <button
                type="button"
                className={styles.brandButton}
                onClick={handleOpenBrandSearch}
                aria-label="브랜드명 검색 열기"
              >
                <span
                  className={`typo-body3 ${brandName ? styles.brandValue : styles.brandPlaceholder}`}
                >
                  {brandName || "브랜드명 입력"}
                </span>
                <Search size={20} className={styles.brandSearchIcon} />
              </button>
            </div>
          </section>

          <section className={styles.nutrientSection}>
            <div className={styles.nutrientHeader}>
              <p className={`typo-title3 ${styles.labelText}`}>영양정보</p>
              <div className="divider dividerMargin20" />
            </div>

            <section className={styles.nutrientFormWrap}>
              <NutrientDetailForm
                totalWeight={formState.weight ?? 0}
                onTotalWeightChange={(nextWeight) => {
                  setFormState((prev) => ({
                    ...prev,
                    weight: Number.isFinite(nextWeight) ? nextWeight : undefined,
                  }));
                }}
                totalCalories={formState.calories ?? 0}
                onTotalCaloriesChange={(nextCalories) => {
                  setFormState((prev) => ({
                    ...prev,
                    calories: Number.isFinite(nextCalories) ? nextCalories : undefined,
                  }));
                }}
                form={nutrientForm}
                onFieldChange={handleFieldChange}
                weightUnit={formState.unit ?? (0 as MenuUnit)}
                onWeightUnitChange={(nextUnit) => {
                  setFormState((prev) => ({
                    ...prev,
                    unit: nextUnit,
                  }));
                }}
              />
            </section>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <Button
          variant="filled"
          size="large"
          color="primary"
          fullWidth
          onClick={handleSubmit}
          state={isSubmitDisabled ? "disabled" : "default"}
          disabled={isSubmitDisabled}
        >
          등록하기
        </Button>
      </footer>
    </section>
  );
}
