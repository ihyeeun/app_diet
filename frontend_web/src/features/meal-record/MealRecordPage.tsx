import { useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { queryKeys } from "@/features/home/hooks/queries/queryKey";
import { useDayMealsQuery } from "@/features/home/hooks/queries/useDayMealsQuery";
import { useTodayMealRecordRegisterMutation } from "@/features/meal-record/hooks/mutations/useTodayMealRecordMutation";
import {
  formatMenuDraftKey,
  useMenuDraftClear,
  useMenuDraftInit,
  useMenuDraftMenus,
  useMenuDraftRemove,
  useMenuDraftStore,
} from "@/features/meal-record/stores/menuDraft.store";
import { PATH } from "@/router/path";
import { getMealDetailPath, getMealSearchPath } from "@/router/pathHelpers";
import {
  MEAL_TIME,
  MEAL_TYPE_OPTIONS,
  type MealType,
  type RegisterMealRequestDto,
} from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";
import { MealMenuCard } from "@/shared/commons/card/MealMenuCard";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { ConfirmModal } from "@/shared/commons/modals/ConfirmModal";
import { toast } from "@/shared/commons/toast/toast";

import styles from "./styles/MealRecordPage.module.css";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";

const MEAL_TYPE_TO_TIME: Record<MealType, RegisterMealRequestDto["time"]> = {
  "0": MEAL_TIME.BREAKFAST,
  "1": MEAL_TIME.LUNCH,
  "2": MEAL_TIME.DINNER,
  "3": MEAL_TIME.SNACK,
  "4": MEAL_TIME.LATE_NIGHT_SNACK,
};

function buildMenuSignature(menus: Array<{ id: number; quantity: number }>) {
  return menus
    .map((menu) => [menu.id, menu.quantity] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([id, quantity]) => `${id}:${quantity}`)
    .join("|");
}

export default function MealRecordPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
  const draftKey = formatMenuDraftKey(dateKey, mealType);

  const { data: currentMenus, isPending: isSummaryReady } = useDayMealsQuery(dateKey);
  const initDraft = useMenuDraftInit();
  const removeMenu = useMenuDraftRemove();
  const clearDraft = useMenuDraftClear();
  const draftMenus = useMenuDraftMenus(dateKey, mealType);
  const allDrafts = useMenuDraftStore((store) => store.drafts);
  const hasCurrentDraft = Boolean(allDrafts[draftKey]);

  const currentMenuItems = (() => {
    if (!currentMenus) return [];
    return currentMenus.menusByTime[mealType];
  })();

  const normalizedCurrentMenuItems = useMemo(
    () =>
      currentMenuItems.map((menu) => ({
        ...menu,
        calories:
          menu.quantity > 0 && Number.isFinite(menu.quantity)
            ? menu.calories / menu.quantity
            : menu.calories,
      })),
    [currentMenuItems],
  );

  useEffect(() => {
    if (!currentMenus) {
      return;
    }

    const seedMenus = currentMenus.menusByTime[mealType].map((menu) => ({
      id: menu.id,
      quantity: menu.quantity,
    }));

    initDraft({
      key: draftKey,
      existingMenuCount: seedMenus.length,
      seedMenus,
    });
  }, [currentMenus, dateKey, draftKey, initDraft, mealType]);

  const menuById = useMemo(
    () => new Map(normalizedCurrentMenuItems.map((menu) => [menu.id, menu])),
    [normalizedCurrentMenuItems],
  );

  const displayMenuItems = useMemo(() => {
    if (!hasCurrentDraft) {
      return normalizedCurrentMenuItems;
    }

    return draftMenus.reduce<typeof normalizedCurrentMenuItems>((menus, draftMenu) => {
      const baseMenu = menuById.get(draftMenu.id);
      if (!baseMenu) {
        return menus;
      }

      menus.push({
        ...baseMenu,
        quantity: draftMenu.quantity,
      });
      return menus;
    }, []);
  }, [draftMenus, hasCurrentDraft, menuById, normalizedCurrentMenuItems]);

  const changedRequests = useMemo(() => {
    if (!currentMenus) {
      return [] as RegisterMealRequestDto[];
    }

    return MEAL_TYPE_OPTIONS.reduce<RegisterMealRequestDto[]>((requests, option) => {
      const type = option.key;
      const key = formatMenuDraftKey(dateKey, type);
      const draftMenusByType = allDrafts[key]?.existingMenus;
      if (!draftMenusByType) {
        return requests;
      }

      const currentMenusByType = currentMenus.menusByTime[type].map((menu) => ({
        id: menu.id,
        quantity: menu.quantity,
      }));
      if (buildMenuSignature(currentMenusByType) === buildMenuSignature(draftMenusByType)) {
        return requests;
      }

      requests.push({
        date: dateKey,
        time: MEAL_TYPE_TO_TIME[type],
        menu_ids: draftMenusByType.map((menu) => menu.id),
        menu_quantities: draftMenusByType.map((menu) => menu.quantity),
      });
      return requests;
    }, []);
  }, [allDrafts, currentMenus, dateKey]);

  const hasUnsavedChanges = changedRequests.length > 0;

  const totalCalories = useMemo(() => {
    return displayMenuItems.reduce((sum, menu) => {
      return sum + menu.calories * menu.quantity;
    }, 0);
  }, [displayMenuItems]);

  const { mutateAsync: registerMealAsync, isPending: isRegisterPending } =
    useTodayMealRecordRegisterMutation();

  const clearAllDrafts = () => {
    MEAL_TYPE_OPTIONS.forEach((option) => {
      clearDraft(formatMenuDraftKey(dateKey, option.key));
    });
  };

  const handleChangeMealType = (nextMealType: MealType) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("date", dateKey);
    nextParams.set("mealType", String(nextMealType));
    setSearchParams(nextParams);
  };

  const handleRemoveMenu = (menuId: number) => {
    removeMenu({ key: draftKey, id: menuId });
  };

  const handleComplete = async () => {
    if (changedRequests.length === 0) {
      return;
    }

    try {
      // 여기서 분기처리하면 될거같으넫
      for (const request of changedRequests) {
        await registerMealAsync(request);
      }

      clearAllDrafts();
      await queryClient.invalidateQueries({ queryKey: queryKeys.dayMeals(dateKey) });
      toast.success("식사 기록이 저장되었어요");
    } catch {
      toast.warning("식사 기록 저장에 실패했어요");
    }
  };

  const handleMenuDetail = (menuId: number) => {
    navigate(getMealDetailPath(dateKey, mealType, menuId, "MEAL_RECORD"));
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      setIsExitConfirmOpen(true);
      return;
    }

    clearAllDrafts();
    navigate(PATH.DIARY, { replace: true });
  };

  const handleExitConfirm = () => {
    clearAllDrafts();
    navigate(PATH.DIARY, { replace: true });
  };

  const handleMealSearchNavigate = () => {
    const seedMenus = hasCurrentDraft
      ? draftMenus
      : currentMenuItems.map((menu) => ({
          id: menu.id,
          quantity: menu.quantity,
        }));

    initDraft({
      key: draftKey,
      existingMenuCount: seedMenus.length,
      seedMenus,
    });

    navigate(getMealSearchPath(dateKey, mealType));
  };

  if (isSummaryReady) return <p> 로딩 중</p>;

  return (
    <section className={styles.page}>
      <PageHeader title="식사 기록 상세" onBack={handleBack} />

      <main className={styles.content}>
        <section className={styles.summarySection}>
          <article className={styles.summaryCard}>
            <p className="typo-title3">섭취 칼로리</p>

            <div className={styles.calorieRow}>
              <span className={`${styles.currentCalorie} typo-h2`}>
                {totalCalories.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}
              </span>
              <span className="typo-title2">kcal</span>
            </div>
          </article>
        </section>

        <div className="dividerMargin20 divider" />

        <section className={styles.mealTypeSection}>
          <div className={styles.mealTypeButtonGroup}>
            {MEAL_TYPE_OPTIONS.map((option) => {
              const isActive = option.key === mealType;

              return (
                <button
                  key={option.key}
                  type="button"
                  className={`${styles.mealTypeButton} ${isActive ? styles.mealTypeActive : ""}`}
                  onClick={() => handleChangeMealType(option.key)}
                  aria-pressed={isActive}
                >
                  <span className="typo-label3">{option.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.menuSection}>
          {displayMenuItems.length > 0 ? (
            <div className={styles.menuList}>
              {displayMenuItems.map((menu, index) => (
                <MealMenuCard
                  key={`${mealType}-${menu.id}-${index}`}
                  name={menu.name}
                  calories={menu.calories}
                  unit_quantity={menu.unit_quantity}
                  quantity={menu.quantity}
                  brand={menu.brand}
                  unit={menu.unit}
                  weight={menu.weight}
                  data_source={menu.data_source}
                  icon="delete"
                  onIconClick={() => handleRemoveMenu(menu.id)}
                  onClick={() => handleMenuDetail(menu.id)}
                />
              ))}
            </div>
          ) : (
            <button type="button" className={styles.emptyState} onClick={handleMealSearchNavigate}>
              <PlusIcon size={24} />
              <p className="typo-title2">기록하러 가볼까요?</p>
            </button>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <Button
          onClick={handleMealSearchNavigate}
          variant="outlined"
          state="default"
          size="medium"
          color="primary"
          fullWidth
        >
          추가하기
        </Button>

        <Button
          onClick={() => {
            void handleComplete();
          }}
          variant="filled"
          state={hasUnsavedChanges && !isRegisterPending ? "default" : "disabled"}
          size="medium"
          color="primary"
          fullWidth
          disabled={!hasUnsavedChanges || isRegisterPending}
        >
          완료하기
        </Button>
      </footer>

      <ConfirmModal
        open={isExitConfirmOpen}
        onOpenChange={setIsExitConfirmOpen}
        title="변경사항을 저장하지 않고 나갈까요?"
        description="완료하기를 누르지 않으면 수정 내용이 사라져요."
        cancelText="계속 수정"
        confirmText="나가기"
        onConfirm={handleExitConfirm}
      />
    </section>
  );
}
