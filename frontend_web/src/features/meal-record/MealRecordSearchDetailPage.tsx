import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { PATH } from "@/router/path";
import { toast } from "@/shared/commons/toast/toast";
import type {
  NutritionAddLocationState,
  NutritionEntryContextState,
} from "@/features/nutrition-entry/nutritionEntry.types";
import type {
  MealMenuItem,
  MealRecordLocationState,
  MealServingInputMode,
} from "./types/mealRecord.types";
import type { MealServingAmount } from "./types/mealMenuNutrition.types";
import { MealMenuNutritionDetail } from "./components/MealMenuNutritionDetail";
import { MAX_MEAL_RECORD_MENUS } from "./constants/menu.constants";
import { getMealRecordAddSearchPath, getMealRecordPath } from "./utils/mealRecord.paths";
import {
  buildMealMenuDetailGroups,
  buildMealMenuDetailRows,
  getMealMenuTotalWeight,
  parseServingAmount,
} from "./utils/mealMenuNutrition";
import {
  SERVING_INPUT_STEP,
  buildScaledMenu,
  formatCompactDecimal,
  getServingDefaultValue,
  normalizeServingInput,
  parseMenuServing,
  resolveServingValues,
  sanitizeServingInput,
} from "./utils/mealRecordServing";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";
import styles from "./styles/MealRecordSearchDetailPage.module.css";

type MealRecordSearchDetailLocationState = NutritionEntryContextState & {
  menu: MealMenuItem;
};

function buildNutritionEditState({
  baseContext,
  menu,
  pendingMenus,
  servingAmount,
}: {
  baseContext: NutritionEntryContextState;
  menu: MealMenuItem;
  pendingMenus: MealMenuItem[];
  servingAmount: MealServingAmount;
}): NutritionAddLocationState {
  const initialNutrition: NutritionAddLocationState["initialNutrition"] = {
    calories: menu.calories,
    carbohydrate: menu.carbohydrateGram,
    protein: menu.proteinGram,
    fat: menu.fatGram,
  };
  const totalWeight = getMealMenuTotalWeight(menu, servingAmount);

  if (totalWeight !== null) {
    initialNutrition.totalWeight = totalWeight;
  }

  return {
    ...baseContext,
    pendingMenus,
    brandName: menu.brand ?? "",
    foodName: menu.title,
    initialNutrition,
    servingUnit: servingAmount.unit,
  };
}

export default function MealRecordSearchDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
  const locationState = (location.state ?? {}) as MealRecordSearchDetailLocationState;
  const menu = locationState.menu;
  const pendingMenus = useMemo(
    () => (Array.isArray(locationState.pendingMenus) ? locationState.pendingMenus : []),
    [locationState.pendingMenus],
  );
  const existingMenuCount = locationState.existingMenuCount ?? 0;
  const baseNutritionEntryContext: NutritionEntryContextState = useMemo(
    () => ({
      source: "meal-record",
      dateKey,
      mealType,
      existingMenuCount,
    }),
    [dateKey, existingMenuCount, mealType],
  );

  useEffect(() => {
    if (menu) return;

    navigate(getMealRecordAddSearchPath(dateKey, mealType), {
      replace: true,
      state: baseNutritionEntryContext,
    });
  }, [baseNutritionEntryContext, dateKey, mealType, menu, navigate]);

  const serving = useMemo(() => (menu ? parseMenuServing(menu) : null), [menu]);
  const selectedMenu = useMemo(
    () => (menu ? (pendingMenus.find((item) => item.id === menu.id) ?? null) : null),
    [menu, pendingMenus],
  );
  const initialServingInput = useMemo(() => {
    if (!serving) {
      return {
        mode: "unit" as MealServingInputMode,
        value: "",
      };
    }

    const mode = selectedMenu?.servingInputMode ?? "unit";
    const initialValue = selectedMenu?.servingInputValue ?? getServingDefaultValue(serving, mode);

    return {
      mode,
      value: formatCompactDecimal(normalizeServingInput(initialValue)),
    };
  }, [selectedMenu?.servingInputMode, selectedMenu?.servingInputValue, serving]);
  const [inputMode, setInputMode] = useState<MealServingInputMode>(initialServingInput.mode);
  const [inputValue, setInputValue] = useState(initialServingInput.value);

  const parsedInputValue = useMemo(() => {
    const parsedValue = Number(inputValue);
    if (!Number.isFinite(parsedValue)) {
      return null;
    }

    return parsedValue;
  }, [inputValue]);

  const previewMenu = useMemo(() => {
    if (!menu || !serving || parsedInputValue === null || parsedInputValue <= 0) {
      return menu;
    }

    const resolvedServing = resolveServingValues(serving, inputMode, parsedInputValue);
    if (!Number.isFinite(resolvedServing.scaleFactor) || resolvedServing.scaleFactor <= 0) {
      return menu;
    }

    return buildScaledMenu({
      menu,
      serving,
      resolved: resolvedServing,
      mode: inputMode,
      inputValue: parsedInputValue,
    });
  }, [inputMode, menu, parsedInputValue, serving]);

  const currentMenu = previewMenu ?? menu;
  const currentServingAmount = useMemo(
    () => parseServingAmount(currentMenu?.unitAmountText ?? ""),
    [currentMenu],
  );
  const detailRows = useMemo(
    () => (currentMenu ? buildMealMenuDetailRows(currentMenu, currentServingAmount) : []),
    [currentMenu, currentServingAmount],
  );
  const detailGroups = useMemo(() => buildMealMenuDetailGroups(detailRows), [detailRows]);
  const isAlreadyQueued = selectedMenu !== null;
  const isPersonalMenuData =
    (currentMenu?.dataSource ?? "public") === "personal" || Boolean(currentMenu?.personalChipLabel);

  if (!menu) {
    return null;
  }

  const handleBack = () => {
    navigate(getMealRecordAddSearchPath(dateKey, mealType), {
      state: {
        ...baseNutritionEntryContext,
        pendingMenus,
      } satisfies NutritionEntryContextState,
    });
  };

  const handleModeChange = (nextMode: MealServingInputMode) => {
    if (!serving || nextMode === inputMode) {
      return;
    }

    setInputMode(nextMode);

    const parsedCurrentValue = Number(inputValue);
    if (!Number.isFinite(parsedCurrentValue) || parsedCurrentValue <= 0) {
      const fallbackValue = getServingDefaultValue(serving, nextMode);
      setInputValue(formatCompactDecimal(normalizeServingInput(fallbackValue)));
      return;
    }

    const resolvedCurrent = resolveServingValues(serving, inputMode, parsedCurrentValue);
    if (!Number.isFinite(resolvedCurrent.scaleFactor) || resolvedCurrent.scaleFactor <= 0) {
      const fallbackValue = getServingDefaultValue(serving, nextMode);
      setInputValue(formatCompactDecimal(normalizeServingInput(fallbackValue)));
      return;
    }

    const convertedValue =
      nextMode === "weight" ? resolvedCurrent.totalWeight : resolvedCurrent.unitCount;
    setInputValue(formatCompactDecimal(normalizeServingInput(convertedValue)));
  };

  const handleInputStep = (delta: number) => {
    if (!serving) return;

    const currentValue = Number(inputValue);
    const baseValue = Number.isFinite(currentValue)
      ? currentValue
      : getServingDefaultValue(serving, inputMode);
    const nextValue = normalizeServingInput(baseValue + delta);
    setInputValue(formatCompactDecimal(nextValue));
  };

  const handleInputBlur = () => {
    if (!serving) {
      setInputValue("");
      return;
    }

    const trimmedValue = inputValue.trim();
    if (!trimmedValue || trimmedValue === ".") {
      setInputValue(
        formatCompactDecimal(normalizeServingInput(getServingDefaultValue(serving, inputMode))),
      );
      return;
    }

    const parsedValue = Number(trimmedValue);
    if (!Number.isFinite(parsedValue)) {
      setInputValue(
        formatCompactDecimal(normalizeServingInput(getServingDefaultValue(serving, inputMode))),
      );
      return;
    }

    setInputValue(formatCompactDecimal(normalizeServingInput(parsedValue)));
  };

  const handleInputChange = (nextValue: string) => {
    setInputValue(sanitizeServingInput(nextValue));
  };

  const handleAddMenu = () => {
    if (!menu || !serving) {
      return;
    }

    const nextInputValue = Number(inputValue);
    if (!Number.isFinite(nextInputValue) || nextInputValue <= 0) {
      toast.warning("입력값을 다시 확인해주세요");
      return;
    }

    const normalizedInput = normalizeServingInput(nextInputValue);
    setInputValue(formatCompactDecimal(normalizedInput));

    const resolvedServing = resolveServingValues(serving, inputMode, normalizedInput);
    if (!Number.isFinite(resolvedServing.scaleFactor) || resolvedServing.scaleFactor <= 0) {
      toast.warning("입력값을 다시 확인해주세요");
      return;
    }

    const nextMenu = buildScaledMenu({
      menu,
      serving,
      resolved: resolvedServing,
      mode: inputMode,
      inputValue: normalizedInput,
    });

    if (
      !isAlreadyQueued &&
      (baseNutritionEntryContext.existingMenuCount ?? 0) + pendingMenus.length + 1 >
        MAX_MEAL_RECORD_MENUS
    ) {
      toast.warning("최대 100개까지 기록할 수 있어요");
      return;
    }

    const existingIndex = pendingMenus.findIndex((item) => item.id === nextMenu.id);
    const nextPendingMenus =
      existingIndex < 0
        ? [...pendingMenus, nextMenu]
        : pendingMenus.map((item, index) => (index === existingIndex ? nextMenu : item));

    navigate(getMealRecordPath(dateKey, mealType), {
      state: {
        pendingMenus: nextPendingMenus,
      } satisfies MealRecordLocationState,
    });
  };

  const handleEditAndAdd = () => {
    navigate(PATH.NUTRITION_ADD_DETAIL, {
      state: buildNutritionEditState({
        baseContext: baseNutritionEntryContext,
        menu: currentMenu,
        pendingMenus,
        servingAmount: currentServingAmount,
      }),
    });
  };

  return (
    <section className={styles.page}>
      <PageHeader
        title="영양성분 상세"
        onBack={handleBack}
        rightSlot={
          currentMenu.dataSource === "personal" && (
            <Button variant="text" state="default" size="small" color="assistive">
              삭제
            </Button>
          )
        }
      />

      <main className={styles.main}>
        <div className={styles.content}>
          <MealMenuNutritionDetail
            menuTitle={currentMenu.title}
            brand={currentMenu.brand}
            calories={currentMenu.calories}
            carbohydrateGram={currentMenu.carbohydrateGram}
            proteinGram={currentMenu.proteinGram}
            fatGram={currentMenu.fatGram}
            detailGroups={detailGroups}
            isDetailOpen={isDetailOpen}
            onToggleDetail={() => setIsDetailOpen((prev) => !prev)}
            onEditAndAdd={handleEditAndAdd}
            showEditSection={!isPersonalMenuData}
            servingInput={{
              inputMode,
              inputValue,
              unitLabel: serving?.unitLabel ?? "인분",
              weightUnit: serving?.weightUnit ?? "g",
              onModeChange: handleModeChange,
              onInputChange: handleInputChange,
              onInputBlur: handleInputBlur,
              onDecrease: () => handleInputStep(-SERVING_INPUT_STEP),
              onIncrease: () => handleInputStep(SERVING_INPUT_STEP),
            }}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <Button variant="filled" size="large" color="primary" fullWidth onClick={handleAddMenu}>
          {isAlreadyQueued ? "수정해서 담기" : "담기"}
        </Button>
      </footer>
    </section>
  );
}
