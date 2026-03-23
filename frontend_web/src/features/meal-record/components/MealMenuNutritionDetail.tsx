import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/shared/commons/button/Button";
import { formatNutritionValue } from "@/features/meal-record/utils/mealMenuNutrition";
import type { MealMenuNutrientGroupSection } from "@/features/meal-record/types/mealMenuNutrition.types";
import styles from "../styles/MealMenuNutritionDetail.module.css";

type MealMenuNutritionDetailProps = {
  menuTitle: string;
  calories: number;
  carbohydrateGram: number;
  proteinGram: number;
  fatGram: number;
  detailGroups: MealMenuNutrientGroupSection[];
  isDetailOpen: boolean;
  onToggleDetail: () => void;
  onEditAndAdd?: () => void;
  showEditSection?: boolean;
  detailListId?: string;
};

export function MealMenuNutritionDetail({
  menuTitle,
  calories,
  carbohydrateGram,
  proteinGram,
  fatGram,
  detailGroups,
  isDetailOpen,
  onToggleDetail,
  onEditAndAdd,
  showEditSection = true,
  detailListId = "meal-record-detail-list",
}: MealMenuNutritionDetailProps) {
  return (
    <>
      <section className={styles.summarySection}>
        <div className={styles.summaryHead}>
          <p className={`typo-title2 ${styles.foodName}`}>{menuTitle}</p>
          <div className={styles.calorieText}>
            <span className="typo-h2">{formatNutritionValue(calories)}</span>
            <span className="typo-title2">kcal</span>
          </div>
        </div>

        <div className={styles.macroRow}>
          <article className={styles.macroItem}>
            <p className={`typo-title4 ${styles.macroLabel}`}>탄수화물</p>
            <p className={`typo-body1 ${styles.macroValue}`}>
              {formatNutritionValue(carbohydrateGram)}
              <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
            </p>
          </article>

          <article className={styles.macroItem}>
            <p className={`typo-title4 ${styles.macroLabel}`}>단백질</p>
            <p className={`typo-body1 ${styles.macroValue}`}>
              {formatNutritionValue(proteinGram)}
              <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
            </p>
          </article>

          <article className={styles.macroItem}>
            <p className={`typo-title4 ${styles.macroLabel}`}>지방</p>
            <p className={`typo-body1 ${styles.macroValue}`}>
              {formatNutritionValue(fatGram)}
              <span className={`typo-body1 ${styles.macroUnit}`}>g</span>
            </p>
          </article>
        </div>
      </section>

      <section className={styles.detailSection}>
        <button
          type="button"
          className={styles.detailToggleButton}
          onClick={onToggleDetail}
          aria-expanded={isDetailOpen}
          aria-controls={detailListId}
        >
          <span className="typo-title3">상세 영양성분 보기</span>
          {isDetailOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </button>

        {isDetailOpen && (
          <>
            <div className="divider dividerMargin20" />

            {showEditSection && onEditAndAdd && (
              <section className={styles.editSection}>
                <p className={`typo-label3 ${styles.editDescription}`}>영양성분이 잘못되었나요?</p>
                <Button
                  variant="text"
                  state="default"
                  size="small"
                  color="assistive"
                  onClick={onEditAndAdd}
                >
                  수정해서 담기
                </Button>
              </section>
            )}

            <div id={detailListId} className={styles.detailList}>
              {detailGroups.map((group, groupIndex) => (
                <section key={group.group} className={styles.detailGroup}>
                  <div className={styles.detailGroupRows}>
                    {group.rows.map((row) => (
                      <div key={row.key}>
                        {groupIndex > 0 && row.variant === "main" && (
                          <div className={styles.groupDivider} />
                        )}
                        <article className={styles.detailRow}>
                          <p
                            className={`${row.variant === "sub" ? "typo-body4" : "typo-title4"} ${
                              row.variant === "sub" ? styles.detailLabelSub : styles.detailLabelMain
                            }`}
                          >
                            {row.label}
                          </p>
                          <div className={styles.detailValue}>
                            <span className={`${row.variant === "sub" ? "typo-body4" : "typo-body2"}`}>
                              {formatNutritionValue(row.value ?? 0)}
                            </span>
                            <span className={`${styles.detailUnit} typo-label2`}>{row.unit}</span>
                          </div>
                        </article>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </section>
    </>
  );
}
