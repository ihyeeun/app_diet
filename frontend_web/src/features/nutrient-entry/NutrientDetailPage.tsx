import { useQueryClient } from "@tanstack/react-query";
import { type ChangeEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { queryKeys } from "@/features/home/hooks/queries/queryKey";
import { MAX_MEAL_RECORD_MENUS } from "@/features/meal-record/constants/menu.constants";
import {
  formatMenuDraftKey,
  useMenuDraftMenus,
  useMenuDraftUpsert,
} from "@/features/meal-record/stores/menuDraft.store";
import { getMealRecordPath } from "@/features/meal-record/utils/mealRecord.paths";
import { NutrientDetailFormSections } from "@/features/nutrient-entry/components/NutrientDetailFormSections";
import {
  DEFAULT_SERVING_UNIT,
  MAX_COMPARE_MENUS,
  REQUIRED_FIELDS,
} from "@/features/nutrient-entry/constants/nutrientDetail.constants";
import { useRegisterMenuMutation } from "@/features/nutrient-entry/hooks/mutations/useNutrientMutation";
import type {
  NutrientDetailForm,
  NutrientDetailFormFieldKey,
} from "@/features/nutrient-entry/types/nutrientDetail.form";
import type {
  NutrientDetailLocationState,
  NutrientModifyLocationState,
} from "@/features/nutrient-entry/types/nutrientEntry.state";
import {
  buildInitialForm,
  buildServingLabel,
  hasChildNutrientOverflow,
  normalizeDecimalInput,
  normalizeNutrientFormValues,
  resolveEntryMode,
  resolveServingUnit,
  sanitizeDecimalInput,
  toMenuId,
  toNumber,
  updateSteppedInputValue,
} from "@/features/nutrient-entry/utils/nutrientDetail.form";
import {
  buildManualMenuItem,
  buildManualMenuPayload,
} from "@/features/nutrient-entry/utils/nutrientDetail.menu";
import { PATH } from "@/router/path";
import {
  DEFAULT_MEAL_TYPE,
  type MealType,
  type NutrientServingUnit,
} from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";
import { getTodayFormatDateKey } from "@/shared/utils/dateFormat";

import styles from "./styles/NutrientDetailPage.module.css";

export default function NutrientDetailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const location = useLocation();

  const locationState = (location.state ?? {}) as NutrientDetailLocationState;
  const { source = "general", dateKey, mealType, existingCompareCount = 0 } = locationState;

  const menuInState = locationState.menu;
  const rawMenuId = toMenuId(locationState.menuId) ?? toMenuId(menuInState?.id);
  const modeType = resolveEntryMode(locationState.modeType, rawMenuId);
  const isModifyMode = modeType === "modify";

  const quantityInState =
    typeof locationState.quantity === "number" &&
    Number.isFinite(locationState.quantity) &&
    locationState.quantity > 0
      ? Math.round(locationState.quantity * 10) / 10
      : 1;

  const brandName = (locationState.brandName ?? menuInState?.brand ?? "").trim();
  const foodName = (locationState.foodName ?? menuInState?.name ?? "").trim();
  const pendingCompareMenus = Array.isArray(locationState.pendingCompareMenus)
    ? locationState.pendingCompareMenus
    : [];

  const initialServingUnit = resolveServingUnit({
    servingUnit: locationState.servingUnit,
    menu: menuInState,
  });

  const nextDateKey = dateKey ?? getTodayFormatDateKey();
  const nextMealType: MealType = mealType ?? DEFAULT_MEAL_TYPE;
  const draftKey = formatMenuDraftKey(nextDateKey, nextMealType);
  const draftMenus = useMenuDraftMenus(nextDateKey, nextMealType);
  const upsertMenu = useMenuDraftUpsert();

  const [form, setForm] = useState<NutrientDetailForm>(() => buildInitialForm(menuInState));
  const [servingUnit, setServingUnit] = useState<NutrientServingUnit>(initialServingUnit);

  const { mutate: registerMenu, isPending: isRegisterPending } = useRegisterMenuMutation();

  const servingLabel = useMemo(
    () => buildServingLabel(form.weight, servingUnit),
    [form.weight, servingUnit],
  );

  const pageTitle = isModifyMode ? "영양성분 수정" : "영양성분 등록";
  const submitButtonLabel = isModifyMode ? "수정하기" : "등록하기";
  const isSubmitPending = isRegisterPending;
  const isMissingModifyTarget = isModifyMode && rawMenuId === null;
  const isMissingRequiredField =
    REQUIRED_FIELDS.some((key) => form[key].trim().length === 0) || foodName.length === 0;
  const isSubmitDisabled =
    isSubmitPending || isMissingModifyTarget || (!isModifyMode && isMissingRequiredField);

  const displayFoodName = foodName || "음식명을 입력해주세요";
  const displayBrandName = brandName;

  const handleNumericChange = (key: NutrientDetailFormFieldKey) => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = sanitizeDecimalInput(event.target.value);
      setForm((prev) => ({ ...prev, [key]: nextValue }));
    };
  };

  const handleNumericBlur = (key: NutrientDetailFormFieldKey) => {
    return () => {
      setForm((prev) => ({ ...prev, [key]: normalizeDecimalInput(prev[key]) }));
    };
  };

  const handleBack = () => {
    if (location.state) {
      navigate(-1);
      return;
    }

    navigate(PATH.NUTRIENT_ADD);
  };

  const handleResetForm = () => {
    setForm(buildInitialForm());
    setServingUnit(DEFAULT_SERVING_UNIT);
  };

  const handleWeightStep = (delta: number) => {
    setForm((prev) => ({
      ...prev,
      weight: updateSteppedInputValue("weight", prev, delta),
    }));
  };

  const handleSubmit = async () => {
    if (isSubmitPending) {
      return;
    }

    if (isModifyMode) {
      if (isMissingModifyTarget) {
        toast.warning("수정할 메뉴 정보를 찾지 못했어요");
        return;
      }

      const nextState: NutrientModifyLocationState = {
        ...locationState,
        menuId: rawMenuId as number,
        menu: menuInState,
        quantity: quantityInState,
        dateKey: nextDateKey,
        mealType: nextMealType,
      };

      navigate(PATH.NUTRIENT_ADD_MODIFY, { state: nextState });
      return;
    }

    const normalizedForm = normalizeNutrientFormValues(form);
    setForm(normalizedForm);

    if (REQUIRED_FIELDS.some((key) => normalizedForm[key] === "")) {
      return;
    }

    if (toNumber(normalizedForm.weight) <= 0) {
      toast.warning("중량을 다시 확인해주세요");
      return;
    }

    if (hasChildNutrientOverflow(normalizedForm)) {
      toast.warning("하위 항목 합이 상위 항목을 초과했어요");
      return;
    }

    if (source === "meal-record" && draftMenus.length + 1 > MAX_MEAL_RECORD_MENUS) {
      toast.warning("최대 100개까지 기록할 수 있어요");
      return;
    }

    if (
      source === "menu-compare" &&
      existingCompareCount + pendingCompareMenus.length + 1 > MAX_COMPARE_MENUS
    ) {
      toast.warning("최대 20개까지 비교할 수 있어요");
      return;
    }

    const payload = buildManualMenuPayload({
      foodName: displayFoodName,
      brandName: displayBrandName,
      form: normalizedForm,
      totalWeightUnit: servingUnit,
    });

    registerMenu(payload, {
      onSuccess: async (savedMenuId) => {
        const savedMenu = buildManualMenuItem({
          menuId: savedMenuId,
          foodName: displayFoodName,
          brandName: displayBrandName,
          form: normalizedForm,
          totalWeightUnit: servingUnit,
        });

        if (source === "meal-record") {
          upsertMenu({
            key: draftKey,
            id: savedMenuId,
            quantity: quantityInState,
          });

          await queryClient.invalidateQueries({ queryKey: queryKeys.dayMeals(nextDateKey) });
          toast.success("등록되었어요");
          navigate(getMealRecordPath(nextDateKey, nextMealType));
          return;
        }

        if (source === "menu-compare") {
          toast.success("등록되었어요");
          navigate(PATH.COMPARE, {
            state: {
              pendingMenus: [...pendingCompareMenus, savedMenu],
            },
          });
          return;
        }

        toast.success("등록되었어요");
        navigate(-1);
      },
      onError: () => {
        toast.warning("등록에 실패했어요");
      },
    });
  };

  return (
    <section className={styles.page}>
      <PageHeader title={pageTitle} onBack={handleBack} />

      <main className={styles.main}>
        <div className={styles.content}>
          <NutrientDetailFormSections
            foodName={displayFoodName}
            brandName={displayBrandName}
            form={form}
            servingUnit={servingUnit}
            servingLabel={servingLabel}
            onServingUnitChange={setServingUnit}
            onNumericChange={handleNumericChange}
            onNumericBlur={handleNumericBlur}
            onWeightStep={handleWeightStep}
            onResetForm={handleResetForm}
          />
        </div>
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
    </section>
  );
}
