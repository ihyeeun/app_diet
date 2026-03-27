import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { Button } from "@/shared/commons/button/Button";
import ScoreProgress from "@/shared/commons/progress/Progress";
import { MealMenuCard } from "@/shared/commons/card/MealMenuCard";
import {
  calculateNutritionScore,
  getCalorieProgressPercent,
  getNutritionGradeLabel,
  toMacroRatiosFromGrams,
} from "@/shared/utils/nutritionScore";
import styles from "./styles/MealRecordPage.module.css";
import { PATH } from "@/router/path";
import { getPendingMenusFromState } from "./utils/mealRecord.navigation";
import { getMealRecordAddPath } from "./utils/mealRecord.paths";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";
import {
  buildMealRecordDraftKey,
  useMealRecordDraftStore,
} from "@/features/meal-record/stores/mealRecordDraft.store";
import { buildRegisterMealRequest } from "@/features/meal-record/utils/mealRecord.payload";
import { useDayMealsQuery } from "@/features/meal-record/hooks/queries/useDayMealsQuery";
import {
  DEFAULT_TARGET_MACRO_RATIOS,
  MEAL_TIME,
  MEAL_TYPE_OPTIONS,
  type MealMenuItem,
  type MealRecordByType,
  type MealRecordResponseDto,
  type MealRecordState,
  type MealTime,
  type MealType,
  type NutritionEntryContextState,
} from "@/shared/api/types/nutrition.dto";

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

const DEFAULT_TARGET_CALORIES = 2100;

const MEAL_TIME_TO_MEAL_TYPE: Record<MealTime, MealType> = {
  [MEAL_TIME.BREAKFAST]: "breakfast",
  [MEAL_TIME.LUNCH]: "lunch",
  [MEAL_TIME.DINNER]: "dinner",
  [MEAL_TIME.SNACK]: "snack",
  [MEAL_TIME.LATE_NIGHT_SNACK]: "snack",
};

function createEmptyMealRecordState(): MealRecordState {
  return {
    targetCalories: DEFAULT_TARGET_CALORIES,
    targetMacroRatios: { ...DEFAULT_TARGET_MACRO_RATIOS },
    menuItems: [],
    photoGroups: [],
    addQueue: [],
  };
}

function createEmptyMealRecords(): MealRecordByType {
  return {
    breakfast: createEmptyMealRecordState(),
    lunch: createEmptyMealRecordState(),
    dinner: createEmptyMealRecordState(),
    snack: createEmptyMealRecordState(),
  };
}

function buildMealRecordsFromResponse(response: MealRecordResponseDto | undefined): MealRecordByType {
  const records = createEmptyMealRecords();
  if (!response) {
    return records;
  }

  response.meal_list.forEach((meal, index) => {
    const mealType = MEAL_TIME_TO_MEAL_TYPE[meal.time];
    if (!mealType) {
      return;
    }

    const mappedMenus: MealMenuItem[] = meal.menu_list.map((menu, menuIndex) => ({
      ...menu,
      serving_input_value: meal.menu_quantities[menuIndex] ?? 1,
    }));

    if (meal.image) {
      records[mealType] = {
        ...records[mealType],
        photoGroups: [
          ...records[mealType].photoGroups,
          {
            id: `${mealType}-photo-${index}`,
            imageSrc: meal.image,
            imageAlt: `${mealType} 식사 사진`,
            items: mappedMenus,
          },
        ],
      };
      return;
    }

    records[mealType] = {
      ...records[mealType],
      menuItems: [...records[mealType].menuItems, ...mappedMenus],
    };
  });

  return records;
}

export default function MealRecordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
  const draftKey = buildMealRecordDraftKey(dateKey, mealType);
  const {
    data: dayMealRecord,
    isPending: isDayMealPending,
    isError: isDayMealError,
  } = useDayMealsQuery(dateKey);

  const draft = useMealRecordDraftStore((state) => state.drafts[draftKey]);
  const menuSnapshotById = useMealRecordDraftStore(
    (state) => state.menuSnapshotById,
  );
  const clearDraft = useMealRecordDraftStore((state) => state.clearDraft);
  const pendingMenusFromDraft = useMemo(
    () =>
      (draft?.selections ?? []).reduce<MealMenuItem[]>(
        (menus, selection) => {
          const snapshot = menuSnapshotById[selection.menuId];
          if (!snapshot) {
            return menus;
          }

          menus.push({
            ...snapshot,
            serving_input_value: selection.quantity,
          });

          return menus;
        },
        [],
      ),
    [draft?.selections, menuSnapshotById],
  );

  const pendingMenusFromNavigation = getPendingMenusFromState(location.state);
  const pendingMenus = useMemo(() => {
    if (pendingMenusFromNavigation.length === 0 && pendingMenusFromDraft.length === 0) {
      return [];
    }

    const uniqueMenus = new Map<number, (typeof pendingMenusFromNavigation)[number]>();

    pendingMenusFromNavigation.forEach((menu) => {
      uniqueMenus.set(menu.id, menu);
    });
    pendingMenusFromDraft.forEach((menu) => {
      if (uniqueMenus.has(menu.id)) return;
      uniqueMenus.set(menu.id, menu);
    });

    return Array.from(uniqueMenus.values());
  }, [pendingMenusFromDraft, pendingMenusFromNavigation]);
  const [removedMenuMap, setRemovedMenuMap] = useState<Record<string, true>>({});

  const baseMealRecords = useMemo(
    () => buildMealRecordsFromResponse(dayMealRecord),
    [dayMealRecord],
  );

  const currentRecord = useMemo(() => {
    const baseRecord = baseMealRecords[mealType];
    const existingMenuIds = new Set(flattenMenus(baseRecord).map((menu) => menu.id));
    const menusToAppend = pendingMenus.filter((menu) => !existingMenuIds.has(menu.id));

    const isRemoved = (menuId: number) => removedMenuMap[`${dateKey}:${mealType}:${menuId}`] === true;

    return {
      ...baseRecord,
      menuItems: [...baseRecord.menuItems, ...menusToAppend].filter((menu) => !isRemoved(menu.id)),
      photoGroups: baseRecord.photoGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((menu) => !isRemoved(menu.id)),
        }))
        .filter((group) => group.items.length > 0),
    };
  }, [baseMealRecords, dateKey, mealType, pendingMenus, removedMenuMap]);

  const allMenus = useMemo(() => flattenMenus(currentRecord), [currentRecord]);

  const totalCalories = useMemo(
    () => allMenus.reduce((sum, menu) => sum + menu.calories, 0),
    [allMenus],
  );

  const totalCarbohydrate = useMemo(
    () => allMenus.reduce((sum, menu) => sum + (menu.carbs ?? 0), 0),
    [allMenus],
  );

  const totalProtein = useMemo(
    () => allMenus.reduce((sum, menu) => sum + (menu.protein ?? 0), 0),
    [allMenus],
  );

  const totalFat = useMemo(() => allMenus.reduce((sum, menu) => sum + (menu.fat ?? 0), 0), [allMenus]);

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
  const progressValue = getCalorieProgressPercent(totalCalories, currentRecord.targetCalories);

  const handleChangeMealType = (nextMealType: MealType) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("date", dateKey);
    nextParams.set("mealType", nextMealType);
    setSearchParams(nextParams);
  };

  const handleRemoveMenu = (menuId: number) => {
    setRemovedMenuMap((prev) => ({
      ...prev,
      [`${dateKey}:${mealType}:${menuId}`]: true,
    }));
  };

  const hasMenus = allMenus.length > 0;
  const mealRecordAddPath = getMealRecordAddPath(dateKey, mealType);
  const nutritionEntryContext: NutritionEntryContextState = {
    source: "meal-record",
    dateKey,
    mealType,
    existingMenuCount: allMenus.length,
  };
  const handleComplete = () => {
    const requestBody = buildRegisterMealRequest({
      dateKey,
      mealType,
      image: "imageUrl",
      menus: allMenus,
    });

    console.info("meal register payload", requestBody);
    clearDraft(draftKey);
    navigate(PATH.HOME);
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
          {isDayMealPending ? (
            <div className={styles.emptyState}>
              <p className="typo-body4">식사 기록을 불러오는 중이에요.</p>
            </div>
          ) : isDayMealError ? (
            <div className={styles.emptyState}>
              <p className="typo-body4">식사 기록을 불러오지 못했어요.</p>
            </div>
          ) : hasMenus ? (
            <div className={styles.menuList}>
              {currentRecord.menuItems.map((menu) => (
                <MealMenuCard
                  key={menu.id}
                  name={menu.name}
                  calories={menu.calories}
                  unit_quantity={menu.unit_quantity}
                  brand={menu.brand}
                  data_source={menu.data_source}
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
                        name={menu.name}
                        calories={menu.calories}
                        unit_quantity={menu.unit_quantity}
                        brand={menu.brand}
                        data_source={menu.data_source}
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
          onClick={handleComplete}
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
