import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { Button } from "@/shared/commons/button/Button";
import ScoreProgress from "@/shared/commons/progress/Progress";
import { MealMenuCard } from "@/shared/commons/card/MealMenuCard";
import {
  calculateCalorieIntakePercent,
  calculateNutritionScore,
  getCalorieProgressPercent,
  getNutritionGradeLabel,
  toMacroRatiosFromGrams,
} from "@/shared/utils/nutritionScore";
import styles from "./styles/MealRecordPage.module.css";
import { PATH } from "@/router/path";
import { getInitialMealRecords } from "./utils/mealRecord.mockData";
import { getPendingMenusFromState } from "./utils/mealRecord.navigation";
import { getMealRecordAddPath } from "./utils/mealRecord.paths";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";
import {
  MEAL_TYPE_OPTIONS,
  type MealRecordByType,
  type MealRecordState,
  type MealType,
} from "./types/mealRecord.types";
import type { NutritionEntryContextState } from "@/features/nutrition-entry/nutritionEntry.types";

function formatKcal(value: number) {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

function formatInt(value: number) {
  return Math.round(value).toLocaleString("ko-KR");
}

function flattenMenus(record: MealRecordState) {
  return [...record.menuItems, ...record.photoGroups.flatMap((group) => group.items)];
}

export default function MealRecordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
  const pendingMenusFromNavigation = getPendingMenusFromState(location.state);
  const [mealRecords, setMealRecords] = useState<MealRecordByType>(() => {
    const initialRecords = getInitialMealRecords();
    if (pendingMenusFromNavigation.length === 0) return initialRecords;

    const targetRecord = initialRecords[mealType];
    const existingMenuIds = new Set(flattenMenus(targetRecord).map((menu) => menu.id));
    const menusToAppend = pendingMenusFromNavigation.filter(
      (menu) => !existingMenuIds.has(menu.id),
    );
    if (menusToAppend.length === 0) return initialRecords;

    return {
      ...initialRecords,
      [mealType]: {
        ...targetRecord,
        menuItems: [...targetRecord.menuItems, ...menusToAppend],
      },
    };
  });
  const currentRecord = mealRecords[mealType];

  const allMenus = useMemo(() => flattenMenus(currentRecord), [currentRecord]);

  const totalCalories = useMemo(
    () => allMenus.reduce((sum, menu) => sum + menu.calories, 0),
    [allMenus],
  );

  const totalCarbohydrate = useMemo(
    () => allMenus.reduce((sum, menu) => sum + menu.carbohydrateGram, 0),
    [allMenus],
  );

  const totalProtein = useMemo(
    () => allMenus.reduce((sum, menu) => sum + menu.proteinGram, 0),
    [allMenus],
  );

  const totalFat = useMemo(() => allMenus.reduce((sum, menu) => sum + menu.fatGram, 0), [allMenus]);

  const nutritionScore = useMemo(
    () =>
      calculateNutritionScore({
        actualCalories: totalCalories,
        targetCalories: currentRecord.targetCalories,
        actualMacroRatios: toMacroRatiosFromGrams({
          carbohydrate: totalCarbohydrate,
          protein: totalProtein,
          fat: totalFat,
        }),
        targetMacroRatios: currentRecord.targetMacroRatios,
      }),
    [
      totalCalories,
      totalCarbohydrate,
      totalProtein,
      totalFat,
      currentRecord.targetCalories,
      currentRecord.targetMacroRatios,
    ],
  );

  // const carbohydratePercent = Math.round(nutritionScore.macro.carbohydrate.actualRatio);
  // const proteinPercent = Math.round(nutritionScore.macro.protein.actualRatio);
  // const fatPercent = Math.round(nutritionScore.macro.fat.actualRatio);

  const isMacroBalanced = nutritionScore.macroBalanceGrade === "appropriate";
  const balanceLabel = getNutritionGradeLabel(nutritionScore.macroBalanceGrade);
  const caloriePercent = calculateCalorieIntakePercent(totalCalories, currentRecord.targetCalories);
  const progressValue = getCalorieProgressPercent(totalCalories, currentRecord.targetCalories);

  const handleChangeMealType = (nextMealType: MealType) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("date", dateKey);
    nextParams.set("mealType", nextMealType);
    setSearchParams(nextParams);
  };

  const handleRemoveMenu = (menuId: string) => {
    setMealRecords((prev) => {
      const record = prev[mealType];

      const nextMenuItems = record.menuItems.filter((item) => item.id !== menuId);
      const nextPhotoGroups = record.photoGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.id !== menuId),
        }))
        .filter((group) => group.items.length > 0);

      return {
        ...prev,
        [mealType]: {
          ...record,
          menuItems: nextMenuItems,
          photoGroups: nextPhotoGroups,
        },
      };
    });
  };

  const hasMenus = allMenus.length > 0;
  const mealRecordAddPath = getMealRecordAddPath(dateKey, mealType);
  const nutritionEntryContext: NutritionEntryContextState = {
    source: "meal-record",
    dateKey,
    mealType,
    existingMenuCount: allMenus.length,
  };

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
                  {formatKcal(totalCalories)}
                </span>{" "}
                kcal
              </p>

              <div className={styles.dividerContainerHorizontal}>
                <div className="divider-horizontal" />
              </div>

              <p className={`${styles.targetCalorie} typo-title2`}>
                {formatInt(currentRecord.targetCalories)} kcal
              </p>
            </div>

            <div className={styles.progressRow}>
              <div className={styles.progressContainer}>
                <ScoreProgress value={progressValue} variant="primary-white" />
              </div>
              <p className={`${styles.progressText} typo-title4`}>{caloriePercent}%</p>
            </div>

            <p className={`${styles.balanceText} typo-label4`}>
              <span
                className={`${styles.balanceDot} ${
                  isMacroBalanced ? styles.balanceDotPositive : styles.balanceDotNegative
                }`}
                aria-hidden="true"
              />
              탄단지 균형 {balanceLabel}
            </p>
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
          {hasMenus ? (
            <div className={styles.menuList}>
              {currentRecord.menuItems.map((menu) => (
                <MealMenuCard
                  key={menu.id}
                  title={menu.title}
                  calories={menu.calories}
                  unitAmountText={menu.unitAmountText}
                  brandChipLabel={menu.brandChipLabel}
                  personalChipLabel={menu.personalChipLabel}
                  icon="delete"
                  onIconClick={() => handleRemoveMenu(menu.id)}
                />
              ))}

              {currentRecord.photoGroups.map((group) => (
                <article key={group.id} className={styles.photoGroupCard}>
                  <div className={styles.imgContainer}>
                    <img src={group.imageSrc} alt={group.imageAlt} className={styles.photoImage} />
                  </div>

                  <div className="divider dividerMargin16" />

                  <div className={styles.photoGroupMenuList}>
                    {group.items.map((menu) => (
                      <MealMenuCard
                        key={menu.id}
                        title={menu.title}
                        calories={menu.calories}
                        unitAmountText={menu.unitAmountText}
                        brandChipLabel={menu.brandChipLabel}
                        personalChipLabel={menu.personalChipLabel}
                        icon="delete"
                        onIconClick={() => handleRemoveMenu(menu.id)}
                      />
                    ))}
                  </div>
                </article>
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
          onClick={() => navigate(mealRecordAddPath, { state: nutritionEntryContext })}
          variant="outlined"
          state="default"
          size="medium"
          color="primary"
          fullWidth
        >
          추가하기
        </Button>

        <Button
          onClick={() => navigate(PATH.HOME)}
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
