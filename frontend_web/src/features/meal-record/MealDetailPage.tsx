import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  MealMenuNutrientDetail,
  type MealMenuNutrientSelection,
} from "@/features/meal-record/components/MealMenuNutrientDetail";
import { useMealDeleteMutation } from "@/features/meal-record/hooks/mutations/useMealDetailMutation";
import { useMealDetatilQuery } from "@/features/meal-record/hooks/queries/useMealDetailQuery";
import {
  formatMenuDraftKey,
  useMenuDraftInit,
  useMenuDraftMenus,
  useMenuDraftSelectedCount,
  useMenuDraftUpsert,
} from "@/features/meal-record/stores/menuDraft.store";
import styles from "@/features/meal-record/styles/MealDetailPage.module.css";
import type { NutrientModifyLocationState } from "@/features/nutrient-entry/types/nutrientEntry.state";
import { PATH } from "@/router/path";
import type { PageKey } from "@/router/pathHelpers";
import { MENU_DATA_SOURCE, MENU_UNIT } from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { ConfirmModal } from "@/shared/commons/modals/ConfirmModal";
import { toast } from "@/shared/commons/toast/toast";

import { MAX_MEAL_RECORD_MENUS } from "./constants/menu.constants";
import { getMealRecordAddSearchPath, getMealRecordPath } from "./utils/mealRecord.paths";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";

export default function MealDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selection, setSelection] = useState<MealMenuNutrientSelection | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
  const rawPageKey = searchParams.get("pageKey");
  const pageKey: PageKey | null =
    rawPageKey === "MEAL_SEARCH" || rawPageKey === "MEAL_RECORD" ? rawPageKey : null;
  const draftKey = formatMenuDraftKey(dateKey, mealType);

  const rawMenuId = searchParams.get("menuId");
  const parsedMenuId = rawMenuId ? Number(rawMenuId) : null;
  const menuId =
    parsedMenuId !== null && Number.isInteger(parsedMenuId) && parsedMenuId > 0
      ? parsedMenuId
      : null;

  const initDraft = useMenuDraftInit();
  const upsertMenu = useMenuDraftUpsert();
  const selectedMenus = useMenuDraftMenus(dateKey, mealType);
  const selectedCount = useMenuDraftSelectedCount(dateKey, mealType);

  const { data: meal, isPending, isError } = useMealDetatilQuery(menuId);
  const { mutate: deleteMealMutation, isPending: isDeletePending } = useMealDeleteMutation({
    onSuccess: () => {
      toast.success("삭제되었어요");
      handleGoBack();
    },
  });

  useEffect(() => {
    initDraft({
      key: draftKey,
      existingMenuCount: 0,
    });
  }, [draftKey, initDraft]);

  useEffect(() => {
    if (menuId !== null) {
      return;
    }

    navigate(PATH.HOME, { replace: true });
  }, [dateKey, mealType, menuId, navigate]);

  useEffect(() => {
    if (!isError) {
      return;
    }

    toast.warning("메뉴 정보를 불러오지 못했어요");
    navigate(PATH.HOME, { replace: true });
  }, [dateKey, isError, mealType, navigate]);

  const existingSelection = useMemo(() => {
    if (menuId === null) {
      return null;
    }

    return selectedMenus.find((item) => item.id === menuId) ?? null;
  }, [menuId, selectedMenus]);
  const isAlreadyQueued = existingSelection !== null;

  const handleAddMenu = () => {
    if (!meal || !selection) {
      toast.warning("입력값을 다시 확인해주세요");
      return;
    }

    if (!isAlreadyQueued && selectedCount + 1 > MAX_MEAL_RECORD_MENUS) {
      toast.warning("최대 100개까지 기록할 수 있어요");
      return;
    }

    upsertMenu({
      key: draftKey,
      id: selection.menu.id,
      quantity: selection.quantity,
    });

    handleGoBack();
  };

  if (isPending) {
    return <p>로딩 중..</p>;
  }

  if (!meal || menuId === null) {
    return null;
  }

  const isPersonalMenuData = meal.data_source === MENU_DATA_SOURCE.PERSONAL;

  const handleGoBack = () => {
    if (pageKey === "MEAL_SEARCH") {
      // TODO 검색어까지 같이 넘겨주면 더 좋을 거 같음
      navigate(getMealRecordAddSearchPath(dateKey, mealType));
      return;
    }

    if (pageKey === "MEAL_RECORD") {
      navigate(getMealRecordPath(dateKey, mealType));
      return;
    }

    navigate(PATH.HOME, { replace: true });
  };

  const handleModify = () => {
    const nextPageKey = pageKey ?? "MEAL_RECORD";
    const modifyQueryParams = new URLSearchParams({
      date: dateKey,
      mealType,
      menuId: String(meal.id),
      pageKey: nextPageKey,
    });

    const state: NutrientModifyLocationState = {
      dataSource: meal.data_source,
      source: "meal-record",
      menuId: meal.id,
      menu: meal,
      quantity: existingSelection?.quantity ?? 1,
      dateKey,
      mealType,
      pageKey: nextPageKey,
      brandName: meal.brand,
      foodName: meal.name,
      servingUnit: meal.unit === MENU_UNIT.MILLILITER ? "ml" : "g",
    };

    navigate(`${PATH.NUTRIENT_ADD_MODIFY}?${modifyQueryParams.toString()}`, { state });
  };

  const handleDelete = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMealMutation(menuId);
  };

  return (
    <section className={styles.page}>
      <PageHeader
        title="영양성분 상세"
        onBack={handleGoBack}
        rightSlot={
          isPersonalMenuData && (
            <div className={styles.headerButtons}>
              <Button
                variant="text"
                state="default"
                size="small"
                color="assistive"
                onClick={handleModify}
              >
                수정
              </Button>
              <Button
                variant="text"
                state="default"
                size="small"
                color="assistive"
                onClick={handleDelete}
              >
                삭제
              </Button>
            </div>
          )
        }
      />

      <main className={styles.main}>
        <div className={styles.content}>
          <MealMenuNutrientDetail
            menu={meal}
            initialQuantity={existingSelection?.quantity}
            isDetailOpen={isDetailOpen}
            onToggleDetail={() => setIsDetailOpen((prev) => !prev)}
            onSelectionChange={setSelection}
            onEditAndAdd={() => {}}
            showEditSection={!isPersonalMenuData}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <Button
          variant="filled"
          size="large"
          color="primary"
          fullWidth
          onClick={handleAddMenu}
          state={selection ? "default" : "disabled"}
          disabled={!selection}
        >
          {isAlreadyQueued ? "수정해서 담기" : "담기"}
        </Button>
      </footer>

      <ConfirmModal
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="영양 성분 삭제"
        description="영양 성분을 삭제할까요?"
        cancelText="취소"
        confirmText="삭제"
        confirmDisabled={isDeletePending}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
}
