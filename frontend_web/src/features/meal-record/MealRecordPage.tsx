import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { queryKeys } from "@/features/home/hooks/queries/queryKey";
import { type DayMealSummary } from "@/features/home/utils/dayMealSummary";
import { PATH } from "@/router/path";
import { MEAL_TYPE_OPTIONS, type MealType } from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";
import { MealMenuCard } from "@/shared/commons/card/MealMenuCard";
import { PageHeader } from "@/shared/commons/header/PageHeader";

import styles from "./styles/MealRecordPage.module.css";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";

export default function MealRecordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));

  const currentMenus = queryClient.getQueryData<DayMealSummary>(queryKeys.dayMeals(dateKey));

  // const draftKey = buildMealRecordDraftKey(dateKey, mealType);

  const currentMenuItems = (() => {
    if (!currentMenus) return [];

    return currentMenus.menusByTime[mealType];
  })();

  const handleChangeMealType = (nextMealType: MealType) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("date", dateKey);
    nextParams.set("mealType", String(nextMealType));
    setSearchParams(nextParams);
  };

  const handleRemoveMenu = (menuId: number) => {
    //   setRemovedMenuMap((prev) => ({
    //     ...prev,
    //     [`${dateKey}:${mealType}:${menuId}`]: true,
    //   }));
    // };

    // const hasMenus = allMenus.length > 0;
    // const mealRecordAddPath = getMealRecordAddPath(dateKey, mealType);
    // const nutrientEntryContext: NutrientEntryContextState = {
    //   source: "meal-record",
    //   dateKey,
    //   mealType,
    //   existingMenuCount: allMenus.length,
    // };

    // const handleComplete = () => {
    //   const requestBody = buildRegisterMealRequest({
    //     dateKey,
    //     mealType,
    //     image: "imageUrl",
    //     menus: allMenus,
    //   });

    //   console.info("meal register payload", requestBody);
    //   clearDraft(draftKey);
    navigate(PATH.HOME);
  };

  const handleMenuDetail = (menuId: number) => {};
  // navigate(getMealRecordMenuDetailPath(menuId), {
  //   state: {

  return (
    <section className={styles.page}>
      <PageHeader title="식사 기록 상세" onBack={() => navigate(PATH.HOME)} />

      <main className={styles.content}>
        <section className={styles.summarySection}>
          <article className={styles.summaryCard}>
            <div className={styles.summaryTitleRow}>
              <p className="typo-title3">칼로리</p>
            </div>

            <div className={styles.calorieRow}>
              <p className="typo-title2">
                <span className={`${styles.currentCalorie} typo-h2`}>
                  {currentMenus?.totalCalories?.toLocaleString("ko-KR")}
                </span>{" "}
                kcal
              </p>

              <div className={styles.dividerContainerHorizontal}>
                <div className="divider-horizontal" />
              </div>

              <p className={`${styles.targetCalorie} typo-title2`}>
                {/* {formatInt(currentRecord.targetCalories)} kcal */}
              </p>
            </div>

            <div className={styles.progressRow}>
              <div className={styles.progressContainer}>
                {/* <ScoreProgress value={progressValue} variant="primary-white" /> */}
              </div>
            </div>

            {/* <p className={`${styles.balanceText} typo-label4`}>
              <span
                className={`${styles.balanceDot} ${
                  isMacroBalanced ? styles.balanceDotPositive : styles.balanceDotNegative
                }`}
                aria-hidden="true"
              />
              탄단지 균형 {balanceLabel}
            </p> */}
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
          {currentMenuItems.length > 0 ? (
            <div className={styles.menuList}>
              {currentMenuItems.map((menu, index) => (
                <MealMenuCard
                  key={`${mealType}-${menu.id}-${index}`}
                  name={menu.name}
                  calories={menu.calories}
                  unit_quantity={menu.unit_quantity}
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
            <div className={styles.emptyState}>
              <p className="typo-body4">
                아직 기록된 메뉴가 없어요. <br /> 아래 버튼으로 메뉴를 추가해보세요.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <Button
          // onClick={() => navigate(mealRecordAddPath, { state: nutrientEntryContext })}
          variant="outlined"
          state="default"
          size="medium"
          color="primary"
          fullWidth
        >
          추가하기
        </Button>

        <Button
          onClick={() => {}}
          variant="filled"
          state="default"
          size="medium"
          color="primary"
          fullWidth
        >
          완료하기
        </Button>
      </footer>
    </section>
  );
}
