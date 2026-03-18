import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  type MacroRatios,
} from "@/shared/utils/nutritionScore";
import styles from "./styles/MealRecordPage.module.css";
import { PATH } from "@/router/path";

const MEAL_TYPE_OPTIONS = [
  { key: "breakfast", label: "아침" },
  { key: "lunch", label: "점심" },
  { key: "dinner", label: "저녁" },
  { key: "snack", label: "간식" },
] as const;

type MealType = (typeof MEAL_TYPE_OPTIONS)[number]["key"];

type MealMenuItem = {
  id: string;
  title: string;
  calories: number;
  unitAmountText: string;
  carbohydrateGram: number;
  proteinGram: number;
  fatGram: number;
  brandChipLabel?: string;
  personalChipLabel?: string;
};

type MealPhotoGroup = {
  id: string;
  imageSrc: string;
  imageAlt: string;
  items: MealMenuItem[];
};

type MealRecordState = {
  targetCalories: number;
  targetMacroRatios: MacroRatios;
  menuItems: MealMenuItem[];
  photoGroups: MealPhotoGroup[];
  addQueue: MealMenuItem[];
};

type MealRecordByType = Record<MealType, MealRecordState>;

const MEAL_TYPE_SET: Set<MealType> = new Set(MEAL_TYPE_OPTIONS.map((option) => option.key));
const DEFAULT_TARGET_MACRO_RATIOS: MacroRatios = {
  carbohydrate: 50,
  protein: 30,
  fat: 20,
};

function getTodayDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getSafeDateKey(value: string | null) {
  if (!value) return getTodayDateKey();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return getTodayDateKey();
}

function getMealType(value: string | null): MealType {
  if (value && MEAL_TYPE_SET.has(value as MealType)) {
    return value as MealType;
  }

  return "lunch";
}

function getMealRecordSearchPath(dateKey: string, mealType: MealType) {
  const params = new URLSearchParams({
    date: dateKey,
    mealType,
  });
  return `${PATH.MEAL_RECORD_SEARCH}?${params.toString()}`;
}

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

function getInitialMealRecords(): MealRecordByType {
  return {
    breakfast: {
      targetCalories: 2100,
      targetMacroRatios: { ...DEFAULT_TARGET_MACRO_RATIOS },
      menuItems: [
        {
          id: "bf-1",
          title: "그릭요거트볼",
          calories: 285,
          unitAmountText: "1그릇 (190g)",
          carbohydrateGram: 29,
          proteinGram: 18,
          fatGram: 11,
          brandChipLabel: "아침한끼",
        },
        {
          id: "bf-2",
          title: "바나나",
          calories: 93,
          unitAmountText: "1개 (100g)",
          carbohydrateGram: 24,
          proteinGram: 1,
          fatGram: 0,
        },
      ],
      photoGroups: [],
      addQueue: [
        {
          id: "bf-add-1",
          title: "삶은 달걀",
          calories: 77,
          unitAmountText: "1개 (50g)",
          carbohydrateGram: 1,
          proteinGram: 6,
          fatGram: 5,
          personalChipLabel: "기본식",
        },
      ],
    },
    lunch: {
      targetCalories: 2100,
      targetMacroRatios: { ...DEFAULT_TARGET_MACRO_RATIOS },
      menuItems: [
        {
          id: "lu-1",
          title: "상하이버거",
          calories: 501,
          unitAmountText: "1단품 (246g)",
          carbohydrateGram: 46,
          proteinGram: 27,
          fatGram: 24,
          brandChipLabel: "맥도날드",
        },
        {
          id: "lu-2",
          title: "곤약김밥",
          calories: 262.5,
          unitAmountText: "1줄 (220g)",
          carbohydrateGram: 38,
          proteinGram: 12,
          fatGram: 8,
          brandChipLabel: "헬스고메",
        },
      ],
      photoGroups: [
        {
          id: "lu-photo-1",
          imageSrc: "/icons/Food.svg",
          imageAlt: "점심으로 찍은 음식 사진",
          items: [
            {
              id: "lu-3",
              title: "토마토 파스타",
              calories: 355,
              unitAmountText: "1접시 (210g)",
              carbohydrateGram: 56,
              proteinGram: 14,
              fatGram: 9,
            },
            {
              id: "lu-4",
              title: "치킨 샐러드",
              calories: 202,
              unitAmountText: "1볼 (180g)",
              carbohydrateGram: 16,
              proteinGram: 22,
              fatGram: 7,
            },
          ],
        },
      ],
      addQueue: [
        {
          id: "lu-add-1",
          title: "아메리카노",
          calories: 12,
          unitAmountText: "1잔 (355ml)",
          carbohydrateGram: 2,
          proteinGram: 1,
          fatGram: 0,
          personalChipLabel: "카페",
        },
      ],
    },
    dinner: {
      targetCalories: 2100,
      targetMacroRatios: { ...DEFAULT_TARGET_MACRO_RATIOS },
      menuItems: [
        {
          id: "dn-1",
          title: "현미밥",
          calories: 301,
          unitAmountText: "1공기 (210g)",
          carbohydrateGram: 64,
          proteinGram: 7,
          fatGram: 2,
        },
        {
          id: "dn-2",
          title: "연어구이",
          calories: 296,
          unitAmountText: "1토막 (160g)",
          carbohydrateGram: 0,
          proteinGram: 33,
          fatGram: 18,
          personalChipLabel: "홈메이드",
        },
      ],
      photoGroups: [],
      addQueue: [
        {
          id: "dn-add-1",
          title: "된장국",
          calories: 98,
          unitAmountText: "1그릇 (250g)",
          carbohydrateGram: 11,
          proteinGram: 8,
          fatGram: 3,
        },
      ],
    },
    snack: {
      targetCalories: 2100,
      targetMacroRatios: { ...DEFAULT_TARGET_MACRO_RATIOS },
      menuItems: [
        {
          id: "sn-1",
          title: "단백질바",
          calories: 187,
          unitAmountText: "1개 (55g)",
          carbohydrateGram: 20,
          proteinGram: 16,
          fatGram: 4,
          brandChipLabel: "운동간식",
        },
      ],
      photoGroups: [],
      addQueue: [
        {
          id: "sn-add-1",
          title: "아몬드",
          calories: 87,
          unitAmountText: "10알 (15g)",
          carbohydrateGram: 3,
          proteinGram: 3,
          fatGram: 8,
        },
      ],
    },
  };
}

export default function MealRecordPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [mealRecords, setMealRecords] = useState<MealRecordByType>(() => getInitialMealRecords());

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
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

  const carbohydratePercent = Math.round(nutritionScore.macro.carbohydrate.actualRatio);
  const proteinPercent = Math.round(nutritionScore.macro.protein.actualRatio);
  const fatPercent = Math.round(nutritionScore.macro.fat.actualRatio);

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
  const mealRecordSearchPath = getMealRecordSearchPath(dateKey, mealType);

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
              탄단지 균형 {balanceLabel} ({carbohydratePercent}% / {proteinPercent}% / {fatPercent}
              %)
            </p>

            <p></p>
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
          onClick={() => navigate(mealRecordSearchPath)}
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
