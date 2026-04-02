import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { queryKeys } from "@/features/home/hooks/queries/queryKey";
import { useMealDetatilQuery } from "@/features/meal-record/hooks/queries/useMealDetailQuery";
import {
  getMealDetailPath,
  getMealRecordAddSearchPath,
  getMealRecordPath,
} from "@/features/meal-record/utils/mealRecord.paths";
import {
  getMealType,
  getSafeDateKey,
  getSafeMenuId,
  getSafePageKey,
} from "@/features/meal-record/utils/mealRecord.queryParams";
import { type RegisterManualMenuPayload } from "@/features/nutrient-entry/api/nutrient";
import { NutrientDetailForm } from "@/features/nutrient-entry/components/NutrientDetailForm";
import {
  useModifyNutrientMutation,
  useRegisterMenuMutation,
} from "@/features/nutrient-entry/hooks/mutations/useNutrientMutation";
import type { NutrientModifyLocationState } from "@/features/nutrient-entry/types/nutrientEntry.state";
import {
  buildNullableNutrientFields,
  buildNutrientFormFields,
  buildNutrientResetPatch,
  hasChildNutrientOverflow,
  toFiniteNumberOrUndefined,
  toNullableFiniteNumber,
} from "@/features/nutrient-entry/utils/nutrientFields";
import { PATH } from "@/router/path";
import {
  type MealMenuItem,
  MENU_DATA_SOURCE,
  MENU_NUTRIENT_FIELD_KEYS,
  MENU_UNIT,
  type MenuNutrientFields,
  type MenuUnit,
  type RegisterMenuRequestDto,
} from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";

import styles from "./styles/NutrientModifyPage.module.css";

function buildInitialFormState(
  menu?: Partial<MealMenuItem> | null,
): Partial<RegisterMenuRequestDto> {
  return {
    unit: menu?.unit === MENU_UNIT.MILLILITER ? MENU_UNIT.MILLILITER : MENU_UNIT.GRAM,
    weight: toFiniteNumberOrUndefined(menu?.weight),
    calories: toFiniteNumberOrUndefined(menu?.calories),
    ...buildNutrientFormFields(menu ?? {}),
  };
}

const RESET_NUTRIENT_FIELDS = buildNutrientResetPatch();

export default function NutrientModifyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const locationState = (location.state ?? {}) as NutrientModifyLocationState;
  const menuInState = locationState.menu;
  const menuId = getSafeMenuId(searchParams.get("menuId"));
  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
  const pageKey = getSafePageKey(searchParams.get("pageKey")) ?? "MEAL_RECORD";

  const {
    data: fetchedMenu,
    isPending: isMenuPending,
    isError: isMenuError,
  } = useMealDetatilQuery(menuId);

  const resolvedMenu = (fetchedMenu ?? menuInState ?? null) as MealMenuItem | null;
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
  const dataSource =
    locationState.dataSource ?? resolvedMenu?.data_source ?? MENU_DATA_SOURCE.PERSONAL;
  const isPersonalData = dataSource === MENU_DATA_SOURCE.PERSONAL;
  const unit: MenuUnit =
    formState.unit === MENU_UNIT.MILLILITER ? MENU_UNIT.MILLILITER : MENU_UNIT.GRAM;
  const initialUnit: MenuUnit =
    baseFormState.unit === MENU_UNIT.MILLILITER ? MENU_UNIT.MILLILITER : MENU_UNIT.GRAM;

  const hasFormChanges = useMemo(() => {
    if (unit !== initialUnit) {
      return true;
    }

    if (toNullableFiniteNumber(formState.weight) !== toNullableFiniteNumber(baseFormState.weight)) {
      return true;
    }

    if (
      toNullableFiniteNumber(formState.calories) !== toNullableFiniteNumber(baseFormState.calories)
    ) {
      return true;
    }

    return MENU_NUTRIENT_FIELD_KEYS.some(
      (key) =>
        toNullableFiniteNumber(formState[key]) !== toNullableFiniteNumber(baseFormState[key]),
    );
  }, [baseFormState, formState, initialUnit, unit]);

  const nutrientForm: Partial<MenuNutrientFields> = buildNutrientFormFields(formState);

  const { mutate: modifyMenu, isPending: isModifyPending } = useModifyNutrientMutation();
  const { mutate: createMenuFromPublic, isPending: isCreatePending } = useRegisterMenuMutation();
  const isSubmitting = isModifyPending || isCreatePending;

  const isSubmitDisabled =
    isSubmitting ||
    isMenuPending ||
    menuId === null ||
    !hasFormChanges ||
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
    if (menuId !== null) {
      navigate(getMealDetailPath(dateKey, mealType, menuId, pageKey));
      return;
    }

    if (pageKey === "MEAL_SEARCH") {
      navigate(getMealRecordAddSearchPath(dateKey, mealType));
      return;
    }

    navigate(getMealRecordPath(dateKey, mealType));
  };

  const handleResetForm = () => {
    setEditedFormState((prev) => ({
      ...prev,
      weight: undefined,
      calories: undefined,
      ...RESET_NUTRIENT_FIELDS,
    }));
  };

  const handleSubmit = () => {
    if (isSubmitDisabled) {
      toast.warning("수정할 내용이 없어요");
      return;
    }

    if (hasChildNutrientOverflow(formState)) {
      toast.warning("하위 항목 합이 상위 항목을 초과했어요");
      return;
    }

    const payload: RegisterManualMenuPayload = {
      name: foodName,
      brand: brandName,
      unit,
      weight: formState.weight ?? 0,
      calories: formState.calories ?? 0,
      ...buildNullableNutrientFields(formState),
    };

    if (isPersonalData) {
      if (menuId === null) {
        toast.error("수정할 메뉴 정보를 찾지 못했어요");
        navigate(PATH.HOME, { replace: true });
        return;
      }

      modifyMenu(
        { id: menuId, ...payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.dayMeals(dateKey) });
            toast.success("영양 성분을 수정했어요");
            navigate(getMealDetailPath(dateKey, mealType, menuId, pageKey), { replace: true });
          },
          onError: () => {
            toast.warning("영양 성분 수정에 실패했어요");
          },
        },
      );
      return;
    }

    createMenuFromPublic(payload, {
      onSuccess: (createdMenuId) => {
        if (!Number.isInteger(createdMenuId) || createdMenuId <= 0) {
          toast.warning("등록된 메뉴 정보를 불러오지 못했어요");
          navigate(PATH.HOME, { replace: true });
          return;
        }

        toast.success("개인 메뉴로 등록했어요");
        navigate(getMealDetailPath(dateKey, mealType, createdMenuId, pageKey), { replace: true });
      },
      onError: () => {
        toast.warning("공용 데이터를 개인 데이터 등록하는데 실패했어요");
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
                totalWeight={formState.weight}
                onTotalWeightChange={(nextWeight) => {
                  setEditedFormState((prev) => ({
                    ...prev,
                    weight: nextWeight,
                  }));
                }}
                totalCalories={formState.calories}
                onTotalCaloriesChange={(nextCalories) => {
                  setEditedFormState((prev) => ({
                    ...prev,
                    calories: nextCalories,
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
          disabled={isSubmitDisabled}
        >
          수정하기
        </Button>
      </footer>
    </section>
  );
}
