import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { PATH } from "@/router/path";
import { toast } from "@/shared/commons/toast/toast";
import type {
  NutritionAddLocationState,
  NutritionEntryContextState,
} from "@/features/nutrition-entry/nutritionEntry.types";
import type { MealMenuItem, MealRecordLocationState } from "./types/mealRecord.types";
import { getMealRecordAddSearchPath, getMealRecordPath } from "./utils/mealRecord.paths";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";
import styles from "./styles/MealRecordSearchDetailPage.module.css";

type MealRecordSearchDetailLocationState = NutritionEntryContextState & {
  menu?: MealMenuItem;
};

type NutrientGroup =
  | "serving"
  | "carbohydrate"
  | "protein"
  | "fat"
  | "sodium"
  | "caffeine"
  | "potassium"
  | "cholesterol"
  | "alcohol";

type NutrientRow = {
  key: string;
  label: string;
  value: number | null;
  unit: "g" | "mg" | "ml";
  group: NutrientGroup;
  variant?: "main" | "sub";
};

type NutrientGroupSection = {
  group: NutrientGroup;
  rows: NutrientRow[];
};

const MAX_MEAL_RECORD_MENUS = 100;
const SERVING_AMOUNT_REGEX = /\(([\d.]+)\s*(g|ml)\)/i;
const NUTRIENT_GROUP_ORDER: NutrientGroup[] = [
  "serving",
  "carbohydrate",
  "protein",
  "fat",
  "sodium",
  "caffeine",
  "potassium",
  "cholesterol",
  "alcohol",
];

function parseServingAmount(unitAmountText: string) {
  const matched = unitAmountText.match(SERVING_AMOUNT_REGEX);
  if (!matched) {
    return {
      amount: 0,
      unit: "g" as const,
    };
  }

  const parsedAmount = Number(matched[1]);
  return {
    amount: Number.isFinite(parsedAmount) ? parsedAmount : 0,
    unit: matched[2]?.toLowerCase() === "ml" ? ("ml" as const) : ("g" as const),
  };
}

function formatNutritionValue(value: number) {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
}

function toNullableNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }

  return value;
}

function buildDetailRows(menu: MealMenuItem, servingAmount: ReturnType<typeof parseServingAmount>) {
  const parsedWeightFromUnitText = servingAmount.amount > 0 ? servingAmount.amount : null;
  const totalWeight = toNullableNumber(menu.totalWeightGram) ?? parsedWeightFromUnitText;

  const rows: NutrientRow[] = [
    {
      key: "totalWeight",
      label: "총량",
      value: totalWeight,
      unit: servingAmount.unit,
      group: "serving",
      variant: "main",
    },
    {
      key: "carbohydrate",
      label: "탄수화물",
      value: toNullableNumber(menu.carbohydrateGram),
      unit: "g",
      group: "carbohydrate",
      variant: "main",
    },
    {
      key: "sugar",
      label: "당",
      value: toNullableNumber(menu.sugarGram),
      unit: "g",
      group: "carbohydrate",
      variant: "sub",
    },
    {
      key: "sugarAlcohol",
      label: "당알코올(대체당)",
      value: toNullableNumber(menu.sugarAlcoholGram),
      unit: "g",
      group: "carbohydrate",
      variant: "sub",
    },
    {
      key: "dietaryFiber",
      label: "식이섬유",
      value: toNullableNumber(menu.dietaryFiberGram),
      unit: "g",
      group: "carbohydrate",
      variant: "sub",
    },
    {
      key: "protein",
      label: "단백질",
      value: toNullableNumber(menu.proteinGram),
      unit: "g",
      group: "protein",
      variant: "main",
    },
    {
      key: "fat",
      label: "지방",
      value: toNullableNumber(menu.fatGram),
      unit: "g",
      group: "fat",
      variant: "main",
    },
    {
      key: "saturatedFat",
      label: "포화지방",
      value: toNullableNumber(menu.saturatedFatGram),
      unit: "g",
      group: "fat",
      variant: "sub",
    },
    {
      key: "transFat",
      label: "트랜스지방",
      value: toNullableNumber(menu.transFatGram),
      unit: "g",
      group: "fat",
      variant: "sub",
    },
    {
      key: "unsaturatedFat",
      label: "불포화지방",
      value: toNullableNumber(menu.unsaturatedFatGram),
      unit: "g",
      group: "fat",
      variant: "sub",
    },
    {
      key: "sodium",
      label: "나트륨",
      value: toNullableNumber(menu.sodiumMg),
      unit: "mg",
      group: "sodium",
      variant: "main",
    },
    {
      key: "caffeine",
      label: "카페인",
      value: toNullableNumber(menu.caffeineMg),
      unit: "mg",
      group: "caffeine",
      variant: "main",
    },
    {
      key: "potassium",
      label: "칼륨",
      value: toNullableNumber(menu.potassiumMg),
      unit: "mg",
      group: "potassium",
      variant: "main",
    },
    {
      key: "cholesterol",
      label: "콜레스테롤",
      value: toNullableNumber(menu.cholesterolMg),
      unit: "mg",
      group: "cholesterol",
      variant: "main",
    },
    {
      key: "alcohol",
      label: "알코올",
      value: toNullableNumber(menu.alcoholGram),
      unit: "g",
      group: "alcohol",
      variant: "main",
    },
  ];

  return rows;
}

function buildDetailGroups(rows: NutrientRow[]): NutrientGroupSection[] {
  return NUTRIENT_GROUP_ORDER.map((group) => ({
    group,
    rows: rows.filter((row) => row.group === group && row.value !== null),
  })).filter((section) => section.rows.length > 0);
}

function buildNutritionEditState({
  baseContext,
  menu,
  pendingMenus,
  servingAmount,
}: {
  baseContext: NutritionEntryContextState;
  menu: MealMenuItem;
  pendingMenus: MealMenuItem[];
  servingAmount: ReturnType<typeof parseServingAmount>;
}): NutritionAddLocationState {
  const initialNutrition: NutritionAddLocationState["initialNutrition"] = {
    calories: menu.calories,
    carbohydrate: menu.carbohydrateGram,
    protein: menu.proteinGram,
    fat: menu.fatGram,
  };
  const totalWeight =
    toNullableNumber(menu.totalWeightGram) ??
    (servingAmount.amount > 0 ? servingAmount.amount : null);

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
  const pendingMenus = Array.isArray(locationState.pendingMenus) ? locationState.pendingMenus : [];
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
    () => (menu ? buildDetailRows(menu, servingAmount) : []),
    [menu, servingAmount],
  );
  const detailGroups = useMemo(() => buildDetailGroups(detailRows), [detailRows]);

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

  const handleAddMenu = () => {
    const isAlreadyQueued = pendingMenus.some((item) => item.id === menu.id);
    const nextPendingMenus = isAlreadyQueued ? pendingMenus : [...pendingMenus, menu];

    if (
      (baseNutritionEntryContext.existingMenuCount ?? 0) + nextPendingMenus.length >
      MAX_MEAL_RECORD_MENUS
    ) {
      toast.warning("최대 100개까지 기록할 수 있어요");
      return;
    }

    navigate(getMealRecordPath(dateKey, mealType), {
      state: {
        pendingMenus: nextPendingMenus,
      } satisfies MealRecordLocationState,
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
        <section className={styles.summarySection}>
          <div className={styles.summaryHead}>
            <p className={`typo-title2 ${styles.foodName}`}>{menu.title}</p>
            <div className={styles.calorieText}>
              <span className="typo-h2">{formatNutritionValue(menu.calories)}</span>
              <span className="typo-title2">kcal</span>
            </div>
          </div>

          <div className={styles.macroRow}>
            <article className={styles.macroItem}>
              <p className={`typo-title4 ${styles.macroLabel}`}>탄수화물</p>
              <p className={`typo-body1 ${styles.macroValue}`}>
                {formatNutritionValue(menu.carbohydrateGram)}
                <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
              </p>
            </article>

            <article className={styles.macroItem}>
              <p className={`typo-title4 ${styles.macroLabel}`}>단백질</p>
              <p className={`typo-body1 ${styles.macroValue}`}>
                {formatNutritionValue(menu.proteinGram)}
                <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
              </p>
            </article>

            <article className={styles.macroItem}>
              <p className={`typo-title4 ${styles.macroLabel}`}>지방</p>
              <p className={`typo-body1 ${styles.macroValue}`}>
                {formatNutritionValue(menu.fatGram)}
                <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
              </p>
            </article>
          </div>
        </section>

        <section className={styles.detailSection}>
          <button
            type="button"
            className={styles.detailToggleButton}
            onClick={() => setIsDetailOpen((prev) => !prev)}
            aria-expanded={isDetailOpen}
            aria-controls="meal-record-detail-list"
          >
            <span className="typo-title3">상세 영양성분 보기</span>
            {isDetailOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>

          {isDetailOpen && (
            <>
              {/* TODO 개인용 데이터인 경우에는 노출 x */}
              <div className="divider dividerMargin20" />
              <section className={styles.editSection}>
                <p className={`typo-label3 ${styles.editDescription}`}>영양성분이 잘못되었나요?</p>
                <Button
                  variant="text"
                  state="default"
                  size="small"
                  color="assistive"
                  onClick={handleEditAndAdd}
                >
                  수정해서 담기
                </Button>
              </section>

              <div id="meal-record-detail-list" className={styles.detailList}>
                {detailGroups.map((group, groupIndex) => (
                  <section key={group.group} className={styles.detailGroup}>
                    <div className={styles.detailGroupRows}>
                      {group.rows.map((row) => (
                        <>
                          {groupIndex > 0 && row.variant === "main" && (
                            <div className={styles.groupDivider} />
                          )}
                          <article key={row.key} className={styles.detailRow}>
                            <p
                              className={`${row.variant === "sub" ? "typo-body4" : "typo-title4"} ${
                                row.variant === "sub"
                                  ? styles.detailLabelSub
                                  : styles.detailLabelMain
                              }`}
                            >
                              {row.label}
                            </p>
                            <div className={styles.detailValue}>
                              <span
                                className={`${row.variant === "sub" ? "typo-body4" : "typo-body2"}`}
                              >
                                {formatNutritionValue(row.value ?? 0)}
                              </span>
                              <span className={`${styles.detailUnit} typo-label2`}>{row.unit}</span>
                            </div>
                          </article>
                        </>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <Button variant="filled" size="large" color="primary" fullWidth onClick={handleAddMenu}>
          {/* TODO 이미 담긴 메뉴라면 수정해서 담기로 변경해야함 */}
          담기
        </Button>
      </footer>
    </section>
  );
}
