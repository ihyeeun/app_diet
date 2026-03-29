import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";
import { MENU_DATA_SOURCE } from "@/shared/api/types/nutrient.dto";

import { MAX_MEAL_RECORD_MENUS } from "./constants/menu.constants";
import { getMealRecordAddSearchPath } from "./utils/mealRecord.paths";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";
import styles from "@/features/meal-record/styles/MealDetailPage.module.css";
import { useMealDetatilQuery } from "@/features/meal-record/hooks/queries/useMealDetailQuery";
import {
  buildMealRecordDraftKey,
  useMealRecordDraftStore,
} from "@/features/meal-record/stores/mealRecordDraft.store";
import {
  MealMenuNutrientDetail,
  type MealMenuNutrientSelection,
} from "@/features/meal-record/components/MealMenuNutrientDetail";

export default function MealDetailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selection, setSelection] = useState<MealMenuNutrientSelection | null>(null);

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
  const draftKey = buildMealRecordDraftKey(dateKey, mealType);

  const rawMenuId = searchParams.get("menuId");
  const parsedMenuId = rawMenuId ? Number(rawMenuId) : null;
  const menuId =
    parsedMenuId !== null && Number.isInteger(parsedMenuId) && parsedMenuId > 0
      ? parsedMenuId
      : null;

  const ensureDraft = useMealRecordDraftStore((state) => state.ensureDraft);
  const upsertMenuSelection = useMealRecordDraftStore((state) => state.upsertMenuSelection);
  const draft = useMealRecordDraftStore((state) => state.drafts[draftKey]);
  const menuSnapshotById = useMealRecordDraftStore((state) => state.menuSnapshotById);

  const { data: meal, isPending, isError } = useMealDetatilQuery(menuId);

  useEffect(() => {
    ensureDraft({
      key: draftKey,
      existingMenuCount: 0,
    });
  }, [draftKey, ensureDraft]);

  useEffect(() => {
    if (menuId !== null) {
      return;
    }

    navigate(getMealRecordAddSearchPath(dateKey, mealType), { replace: true });
  }, [dateKey, mealType, menuId, navigate]);

  useEffect(() => {
    if (!isError) {
      return;
    }

    toast.warning("메뉴 정보를 불러오지 못했어요");
    navigate(getMealRecordAddSearchPath(dateKey, mealType), { replace: true });
  }, [dateKey, isError, mealType, navigate]);

  const existingSelection = useMemo(() => {
    if (!draft || menuId === null) {
      return null;
    }

    return draft.selections.find((item) => item.menuId === menuId) ?? null;
  }, [draft, menuId]);

  const selectedSnapshot = useMemo(() => {
    if (menuId === null) {
      return null;
    }

    return menuSnapshotById[menuId] ?? null;
  }, [menuId, menuSnapshotById]);

  const existingMenuCount = draft?.existingMenuCount ?? 0;
  const selectedCount = draft?.selections.length ?? 0;
  const isAlreadyQueued = existingSelection !== null;
  const initialMode = selectedSnapshot?.serving_input_mode;

  const handleAddMenu = () => {
    if (!meal || !selection) {
      toast.warning("입력값을 다시 확인해주세요");
      return;
    }

    if (!isAlreadyQueued && existingMenuCount + selectedCount + 1 > MAX_MEAL_RECORD_MENUS) {
      toast.warning("최대 100개까지 기록할 수 있어요");
      return;
    }

    upsertMenuSelection({
      key: draftKey,
      menu: selection.menu,
    });

    navigate(-1);
  };

  if (isPending) {
    return <p>로딩 중..</p>;
  }

  if (!meal || menuId === null) {
    return null;
  }

  const isPersonalMenuData = meal.data_source === MENU_DATA_SOURCE.PERSONAL;

  return (
    <section className={styles.page}>
      <PageHeader
        title="영양성분 상세"
        onBack={() => navigate(getMealRecordAddSearchPath(dateKey, mealType))}
        rightSlot={
          isPersonalMenuData && (
            <Button variant="text" state="default" size="small" color="assistive">
              삭제
            </Button>
          )
        }
      />

      <main className={styles.main}>
        <div className={styles.content}>
          <MealMenuNutrientDetail
            menu={meal}
            initialQuantity={existingSelection?.quantity}
            initialMode={initialMode}
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
    </section>
  );
}
