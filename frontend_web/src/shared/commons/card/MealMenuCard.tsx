import type { KeyboardEvent, MouseEvent } from "react";
import { Check, Plus, X } from "lucide-react";
import styles from "./MealMenuCard.module.css";

export type MealMenuCardIcon = "add" | "check" | "delete";
export type MealMenuCardState = "default" | "select";

type MealMenuCardProps = {
  title: string;
  calories: number;
  unitAmountText: string;
  brandChipLabel?: string;
  personalChipLabel?: string;
  icon?: MealMenuCardIcon;
  state?: MealMenuCardState;
  className?: string;
  onClick?: () => void;
  onIconClick?: () => void;
};

function formatCalories(value: number) {
  return value.toLocaleString("ko-KR", { maximumFractionDigits: 1 });
}

function getActionAriaLabel(icon: MealMenuCardIcon) {
  if (icon === "add") return "추가";
  if (icon === "check") return "선택 완료";
  return "삭제";
}

function ActionIcon({ icon }: { icon: MealMenuCardIcon }) {
  if (icon === "add") return <Plus size={24} strokeWidth={2} />;
  if (icon === "check") return <Check size={24} strokeWidth={2} />;
  return <X size={24} strokeWidth={2} />;
}

export function MealMenuCard({
  title,
  calories,
  unitAmountText,
  brandChipLabel,
  personalChipLabel,
  icon = "delete",
  state = "default",
  className,
  onClick,
  onIconClick,
}: MealMenuCardProps) {
  const classes = [
    styles.card,
    state === "select" ? styles.selected : "",
    onClick ? styles.clickable : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    onClick();
  };

  const handleIconClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onIconClick?.();
  };

  return (
    <article
      className={classes}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleCardKeyDown}
    >
      <div className={styles.content}>
        {(brandChipLabel || personalChipLabel) && (
          <div className={styles.chipList}>
            {personalChipLabel && (
              <span className={`${styles.chip} ${styles.chipPrimary} typo-label6`}>
                {personalChipLabel}
              </span>
            )}
            {brandChipLabel && (
              <span className={`${styles.chip} ${styles.chipNeutral} typo-label6`}>
                {brandChipLabel}
              </span>
            )}
          </div>
        )}
        <div>
          <p className={`${styles.title} typo-title2 ellipsis`}>{title}</p>

          <p className={styles.meta}>
            <span className={`${styles.calories} typo-title2`}>
              {formatCalories(calories)} kcal
            </span>
            <span className={`${styles.unitAmount} typo-label4`}>{unitAmountText}</span>
          </p>
        </div>
      </div>

      <button
        type="button"
        className={styles.iconButton}
        onClick={handleIconClick}
        disabled={!onIconClick}
        aria-label={getActionAriaLabel(icon)}
      >
        <ActionIcon icon={icon} />
      </button>
    </article>
  );
}
