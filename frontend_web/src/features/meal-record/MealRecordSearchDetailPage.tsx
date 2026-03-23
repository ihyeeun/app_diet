import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/commons/button/Button";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
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
} from "./types/mealRecord.types";
import type { MealServingAmount } from "./types/mealMenuNutrition.types";
import { MealMenuNutritionDetail } from "./components/MealMenuNutritionDetail";
import { ServingAmountSheetContent } from "./components/ServingAmountSheetContent";
import { useServingAmountSheet } from "./hooks/useServingAmountSheet";
import { MAX_MEAL_RECORD_MENUS } from "./constants/menu.constants";
import { getMealRecordAddSearchPath, getMealRecordPath } from "./utils/mealRecord.paths";
import {
  buildMealMenuDetailGroups,
  buildMealMenuDetailRows,
  getMealMenuTotalWeight,
  parseServingAmount,
} from "./utils/mealMenuNutrition";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";
import styles from "./styles/MealRecordSearchDetailPage.module.css";

type MealRecordSearchDetailLocationState = NutritionEntryContextState & {
  menu?: MealMenuItem;
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
    brandName: menu.brandChipLabel ?? "",
    foodName: menu.title,
    initialNutrition,
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

  const servingAmount = useMemo(
    () => (menu ? parseServingAmount(menu.unitAmountText) : parseServingAmount("")),
    [menu],
  );

  const detailRows = useMemo(
    () => (menu ? buildMealMenuDetailRows(menu, servingAmount) : []),
    [menu, servingAmount],
  );
  const detailGroups = useMemo(() => buildMealMenuDetailGroups(detailRows), [detailRows]);
  const selectedMenu = useMemo(
    () => (menu ? pendingMenus.find((item) => item.id === menu.id) ?? null : null),
    [menu, pendingMenus],
  );

  const servingSheet = useServingAmountSheet({
    onSubmitMenu: (nextMenu) => {
      if (!menu) {
        return false;
      }

      const isAlreadyQueued = pendingMenus.some((item) => item.id === menu.id);
      if (
        !isAlreadyQueued &&
        (baseNutritionEntryContext.existingMenuCount ?? 0) + pendingMenus.length + 1 > MAX_MEAL_RECORD_MENUS
      ) {
        toast.warning("최대 100개까지 기록할 수 있어요");
        return false;
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
      return true;
    },
  });

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

  const handleOpenServingSheet = () => {
    servingSheet.open({
      menu,
      selectedMenu,
    });
  };

  const handleEditAndAdd = () => {
    navigate(PATH.NUTRITION_ADD_DETAIL, {
      state: buildNutritionEditState({
        baseContext: baseNutritionEntryContext,
        menu,
        pendingMenus,
        servingAmount,
      }),
    });
  };

  return (
    <section className={styles.page}>
      <PageHeader title="영양성분 상세" onBack={handleBack} />

      <main className={styles.main}>
        <MealMenuNutritionDetail
          menuTitle={menu.title}
          calories={menu.calories}
          carbohydrateGram={menu.carbohydrateGram}
          proteinGram={menu.proteinGram}
          fatGram={menu.fatGram}
          detailGroups={detailGroups}
          isDetailOpen={isDetailOpen}
          onToggleDetail={() => setIsDetailOpen((prev) => !prev)}
          onEditAndAdd={handleEditAndAdd}
        />
      </main>

      <footer className={styles.footer}>
        <Button variant="filled" size="large" color="primary" fullWidth onClick={handleOpenServingSheet}>
          {/* TODO 이미 담긴 메뉴라면 수정해서 담기로 변경해야함 */}
          담기
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
