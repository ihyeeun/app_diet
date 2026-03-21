import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { MealRecordFloatingCameraButton } from "./components/MealRecordFloatingCameraButton";
import { getMealRecordPath, getMealRecordAddSearchPath } from "./utils/mealRecord.paths";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";
import { PATH } from "@/router/path";
import type { NutritionEntryContextState } from "@/features/nutrition-entry/nutritionEntry.types";
import styles from "./styles/MealRecordAddPage.module.css";

export default function MealRecordAddPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
  const contextFromState = (location.state ?? {}) as NutritionEntryContextState;
  const nutritionEntryContext: NutritionEntryContextState = {
    source: "meal-record",
    dateKey,
    mealType,
    existingMenuCount: contextFromState.existingMenuCount ?? 0,
  };

  const handleCameraClick = () => {};
  const handleBack = () => {
    navigate(getMealRecordPath(dateKey, mealType));
  };

  return (
    <section className={styles.page}>
      <PageHeader onBack={handleBack} />

      <main className={styles.main}>
        <section className={styles.entrySection}>
          <button
            type="button"
            className={styles.entryButton}
            onClick={() =>
              navigate(getMealRecordAddSearchPath(dateKey, mealType), { state: nutritionEntryContext })
            }
          >
            <p className="typo-label4">메뉴를 검색하거나 음식 사진을 찍어 기록해보세요</p>
          </button>
          <Button
            variant="text"
            state="default"
            size="small"
            color="assistive"
            onClick={() => navigate(PATH.NUTRITION_ADD, { state: nutritionEntryContext })}
          >
            <p className={`${styles.directInputText} typo-label3`}>영양 성분 직접 입력</p>
          </Button>
        </section>
      </main>

      <footer className={styles.footer}>
        <MealRecordFloatingCameraButton
          onClick={handleCameraClick}
          ariaLabel="사진으로 기록하기"
          tone="light"
        />

        <Button variant="filled" state="disabled" size="large" color="assistive" fullWidth disabled>
          0개 담겼어요
        </Button>
      </footer>
    </section>
  );
}
