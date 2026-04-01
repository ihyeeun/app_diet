import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { queryKeys } from "@/features/home/hooks/queries/queryKey";
import { useMealDetatilQuery } from "@/features/meal-record/hooks/queries/useMealDetailQuery";
import {
  formatMenuDraftKey,
  useMenuDraftUpsert,
} from "@/features/meal-record/stores/menuDraft.store";
import { getMealRecordPath } from "@/features/meal-record/utils/mealRecord.paths";
import { NutrientDetailForm } from "@/features/nutrient-entry/components/NutrientDetailForm";
import { useModifyNutrientMutation } from "@/features/nutrient-entry/hooks/mutations/useNutrientMutation";
import type { NutrientModifyLocationState } from "@/features/nutrient-entry/types/nutrientEntry.state";
import { toMenuId } from "@/features/nutrient-entry/utils/nutrientDetail.form";
import {
  MEAL_TYPE_SET,
  type MealMenuItem,
  type MealType,
  MENU_UNIT,
  type MenuNutrientFields,
  type MenuUnit,
  type RegisterMenuRequestDto,
} from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";

import styles from "./styles/NutrientModifyPage.module.css";

type DraftTarget = {
  dateKey: string;
  mealType: MealType;
};

function toFiniteNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return value;
}

function toNullableNumber(value: number | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function toSafeQuantity(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return 1;
  }

  return Math.round(value * 10) / 10;
}

function toSafeDateKey(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
}

function toSafeMealType(value: unknown): MealType | null {
  if (typeof value !== "string") {
    return null;
  }

  return MEAL_TYPE_SET.has(value as MealType) ? (value as MealType) : null;
}

function parseDraftTargetFromReturnPath(returnPath: string): DraftTarget | null {
  const queryStartIndex = returnPath.indexOf("?");
  if (queryStartIndex < 0) {
    return null;
  }

  const searchParams = new URLSearchParams(returnPath.slice(queryStartIndex + 1));
  const dateKey = toSafeDateKey(searchParams.get("date"));
  const mealType = toSafeMealType(searchParams.get("mealType"));

  if (!dateKey || !mealType) {
    return null;
  }

  return { dateKey, mealType };
}

function resolveDraftTarget(
  dateKey: unknown,
  mealType: unknown,
  returnPath: string,
): DraftTarget | null {
  const stateDateKey = toSafeDateKey(dateKey);
  const stateMealType = toSafeMealType(mealType);

  if (stateDateKey && stateMealType) {
    return {
      dateKey: stateDateKey,
      mealType: stateMealType,
    };
  }

  if (!returnPath) {
    return null;
  }

  return parseDraftTargetFromReturnPath(returnPath);
}

function buildInitialFormState(
  menu?: Partial<MealMenuItem> | null,
): Partial<RegisterMenuRequestDto> {
  return {
    unit: menu?.unit === MENU_UNIT.MILLILITER ? MENU_UNIT.MILLILITER : MENU_UNIT.GRAM,
    weight: toFiniteNumber(menu?.weight),
    calories: toFiniteNumber(menu?.calories),
    carbs: toFiniteNumber(menu?.carbs),
    sugars: toFiniteNumber(menu?.sugars),
    sugar_alchol: toFiniteNumber(menu?.sugar_alchol),
    dietary_fiber: toFiniteNumber(menu?.dietary_fiber),
    protein: toFiniteNumber(menu?.protein),
    fat: toFiniteNumber(menu?.fat),
    sat_fat: toFiniteNumber(menu?.sat_fat),
    trans_fat: toFiniteNumber(menu?.trans_fat),
    un_sat_fat: toFiniteNumber(menu?.un_sat_fat),
    sodium: toFiniteNumber(menu?.sodium),
    caffeine: toFiniteNumber(menu?.caffeine),
    potassium: toFiniteNumber(menu?.potassium),
    cholesterol: toFiniteNumber(menu?.cholesterol),
    alcohol: toFiniteNumber(menu?.alcohol),
  };
}

export default function NutrientModifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const locationState = (location.state ?? {}) as NutrientModifyLocationState;
  const menuInState = locationState.menu;
  const menuId = toMenuId(locationState.menuId) ?? toMenuId(menuInState?.id);

  const returnPath = (locationState.returnPath ?? "").trim();
  const draftTarget = useMemo(
    () => resolveDraftTarget(locationState.dateKey, locationState.mealType, returnPath),
    [locationState.dateKey, locationState.mealType, returnPath],
  );

  const upsertMenu = useMenuDraftUpsert();

  const {
    data: fetchedMenu,
    isPending: isMenuPending,
    isError: isMenuError,
  } = useMealDetatilQuery(menuInState ? null : menuId);

  const resolvedMenu = (menuInState ?? fetchedMenu ?? null) as MealMenuItem | null;
  const baseFormState = useMemo(() => buildInitialFormState(resolvedMenu), [resolvedMenu]);
  const [editedFormState, setEditedFormState] = useState<Partial<RegisterMenuRequestDto>>({});
  const formState = useMemo(
    () => ({
      ...baseFormState,
      ...editedFormState,
    }),
    [baseFormState, editedFormState],
  );

  useEffect(() => {
    if (menuId !== null) {
      return;
    }

    toast.warning("수정할 메뉴 정보를 찾지 못했어요");
    navigate(-1);
  }, [menuId, navigate]);

  useEffect(() => {
    if (!isMenuError) {
      return;
    }

    toast.warning("메뉴 정보를 불러오지 못했어요");
    navigate(-1);
  }, [isMenuError, navigate]);

  const foodName = (locationState.foodName ?? resolvedMenu?.name ?? "").trim();
  const brandName = (locationState.brandName ?? resolvedMenu?.brand ?? "").trim();
  const quantityInState = toSafeQuantity(locationState.quantity);
  const unit: MenuUnit =
    formState.unit === MENU_UNIT.MILLILITER ? MENU_UNIT.MILLILITER : MENU_UNIT.GRAM;

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

  const { mutate: modifyMenu, isPending: isSubmitting } = useModifyNutrientMutation();

  const isSubmitDisabled =
    isSubmitting ||
    isMenuPending ||
    menuId === null ||
    foodName.length === 0 ||
    (formState.weight ?? 0) <= 0 ||
    (formState.calories ?? 0) <= 0;

  const handleFieldChange = (key: keyof MenuNutrientFields, nextValue: string) => {
    const parsedValue = nextValue === "" ? undefined : Number(nextValue);

    setEditedFormState((prev) => ({
      ...prev,
      [key]: parsedValue !== undefined && Number.isFinite(parsedValue) ? parsedValue : undefined,
    }));
  };

  const handleBack = () => {
    if (returnPath) {
      navigate(returnPath, { replace: true });
      return;
    }

    if (draftTarget) {
      navigate(getMealRecordPath(draftTarget.dateKey, draftTarget.mealType));
      return;
    }

    navigate(-1);
  };

  const handleResetForm = () => {
    setEditedFormState((prev) => ({
      ...prev,
      weight: undefined,
      calories: undefined,
      carbs: undefined,
      sugars: undefined,
      sugar_alchol: undefined,
      dietary_fiber: undefined,
      protein: undefined,
      fat: undefined,
      sat_fat: undefined,
      trans_fat: undefined,
      un_sat_fat: undefined,
      sodium: undefined,
      caffeine: undefined,
      potassium: undefined,
      cholesterol: undefined,
      alcohol: undefined,
    }));
  };

  const handleSubmit = () => {
    if (isSubmitDisabled || menuId === null) {
      return <p>{menuId}</p>;
    }

    const payload = {
      id: menuId,
      name: foodName,
      brand: brandName,
      unit,
      weight: formState.weight ?? 0,
      calories: formState.calories ?? 0,
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

    modifyMenu(payload, {
      onSuccess: async () => {
        if (draftTarget) {
          const draftKey = formatMenuDraftKey(draftTarget.dateKey, draftTarget.mealType);

          // TODO 수정되었을 때 해당 메뉴 상세 페이지로 이동하는 게 나아보임
          upsertMenu({
            key: draftKey,
            id: menuId,
            quantity: quantityInState,
          });

          await queryClient.invalidateQueries({
            queryKey: queryKeys.dayMeals(draftTarget.dateKey),
          });
        }

        toast.success("수정되었어요");

        if (returnPath) {
          navigate(returnPath, { replace: true });
          return;
        }

        if (draftTarget) {
          navigate(getMealRecordPath(draftTarget.dateKey, draftTarget.mealType));
          return;
        }

        navigate(-1);
      },
      onError: () => {
        toast.warning("수정에 실패했어요");
      },
    });
  };

  return (
    <section className={styles.page}>
      <PageHeader title="영양성분 수정" onBack={handleBack} />

      <main className={styles.main}>
        <div className={styles.content}>
          <section className={styles.topSection}>
            <p className={`typo-title2 ${styles.foodNameText}`}>
              {foodName || "메뉴 정보를 확인해주세요"}
            </p>
            {brandName && <p className={`typo-label4 ${styles.brandText}`}>{brandName}</p>}
          </section>

          <section className={styles.nutrientSection}>
            <div className={styles.nutrientHeader}>
              <p className={`typo-title3 ${styles.labelText}`}>영양정보</p>
              <Button
                variant="text"
                state="default"
                size="small"
                color="assistive"
                onClick={handleResetForm}
              >
                전체 삭제
              </Button>
            </div>

            <div className="divider dividerMargin20" />

            <section className={styles.nutrientFormWrap}>
              <NutrientDetailForm
                totalWeight={formState.weight ?? 0}
                onTotalWeightChange={(nextWeight) => {
                  setEditedFormState((prev) => ({
                    ...prev,
                    weight: Number.isFinite(nextWeight) ? nextWeight : undefined,
                  }));
                }}
                totalCalories={formState.calories ?? 0}
                onTotalCaloriesChange={(nextCalories) => {
                  setEditedFormState((prev) => ({
                    ...prev,
                    calories: Number.isFinite(nextCalories) ? nextCalories : undefined,
                  }));
                }}
                form={nutrientForm}
                onFieldChange={handleFieldChange}
                weightUnit={unit}
                onWeightUnitChange={(nextUnit) => {
                  setEditedFormState((prev) => ({
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
          // disabled={isSubmitDisabled}
        >
          수정하기
        </Button>
      </footer>
    </section>
  );
}
