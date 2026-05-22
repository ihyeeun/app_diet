import { useEffect, useState } from "react";

import styles from "@/features/chat/styles/FeedbackDetailPage.module.css";
import {
  type FeedbackDetailNavigationState,
  getFeedbackResultPath,
  getSafeChatId,
  getSafeMenuId,
} from "@/features/chat/utils/recommendNavigation";
import {
  MealMenuNutrientDetail,
  type MealMenuNutrientSelection,
} from "@/features/meal-record/components/MealMenuNutrientDetail";
import { MealMenuNutrientDetailSkeleton } from "@/features/meal-record/components/MealMenuNutrientDetailSkeleton";
import { useMealDetailQuery } from "@/features/meal-record/hooks/queries/useMealDetailQuery";
import { PATH } from "@/router/path";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { Skeleton } from "@/shared/commons/skeleton/Skeleton";
import { toast } from "@/shared/commons/toast/toast";
import {
  navigateBack,
  useLocation,
  useSearchParams,
} from "@/shared/navigation/stackflowNavigation";

export default function FeedbackDetailPage() {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selection, setSelection] = useState<MealMenuNutrientSelection | null>(null);
  const location = useLocation<FeedbackDetailNavigationState>();
  const [searchParams] = useSearchParams();
  const chatId = getSafeChatId(searchParams.get("chatId"));
  const menuId = getSafeMenuId(searchParams.get("menuId"));
  const fallbackTo = chatId === null ? PATH.CHAT : getFeedbackResultPath(chatId);
  const initialSelection =
    location.state?.initialSelection?.menuId === menuId ? location.state.initialSelection : null;
  const footerLabel = initialSelection ? "수정하기" : "담기";

  const handleConfirmSelection = () => {
    if (!selection || menuId === null) {
      return;
    }

    location.state?.onConfirmSelection?.({
      menuId,
      quantity: selection.quantity,
      mode: selection.mode,
    });
    navigateBack({ fallbackTo });
  };

  const { data: meal, isPending, isError } = useMealDetailQuery(menuId);

  useEffect(() => {
    if (menuId !== null) return;

    toast.warning("잘못된 접근입니다.");
    navigateBack({ fallbackTo });
  }, [menuId, fallbackTo]);

  useEffect(() => {
    if (!isError) return;

    toast.warning("메뉴 정보를 불러오지 못했어요");
    navigateBack({ fallbackTo });
  }, [isError, fallbackTo]);

  if (isPending) {
    return (
      <section className={styles.page}>
        <PageHeader
          title="영양성분 상세"
          onBack={() => {
            navigateBack({ fallbackTo });
          }}
        />

        <main className={styles.main}>
          <div className={styles.content}>
            <MealMenuNutrientDetailSkeleton showEditSection={false} />
          </div>
        </main>

        <footer className={styles.footer}>
          <Skeleton width="100%" height={48} radius={8} />
        </footer>
      </section>
    );
  }
  if (!meal || menuId === null) return null;

  return (
    <section className={styles.page}>
      <PageHeader
        title="영양성분 상세"
        onBack={() => {
          navigateBack({ fallbackTo });
        }}
      />

      <main className={styles.main}>
        <div className={styles.content}>
          <MealMenuNutrientDetail
            menu={meal}
            initialQuantity={initialSelection?.quantity}
            initialMode={initialSelection?.mode}
            isDetailOpen={isDetailOpen}
            onToggleDetail={() => setIsDetailOpen((prev) => !prev)}
            onSelectionChange={setSelection}
            showEditSection={false}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <Button
          variant="filled"
          size="large"
          color="primary"
          fullWidth
          onClick={handleConfirmSelection}
          interaction={selection ? "normal" : "disable"}
          disabled={!selection}
        >
          {footerLabel}
        </Button>
      </footer>
    </section>
  );
}
