import { Button } from "@/shared/commons/button/Button";

import styles from "../styles/MealRecordSearchPage.module.css";

type BrandRequestSheetContentProps = {
  value: string;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onValueChange: (nextValue: string) => void;
  onSubmit: () => void;
};

export function BrandRequestSheetContent({
  value,
  isSubmitting,
  isSubmitDisabled,
  onValueChange,
  onSubmit,
}: BrandRequestSheetContentProps) {
  return (
    <div className={styles.brandRequestSheetContainer}>
      <div className={styles.brandRequestSheetContent}>
        <div className={styles.brandRequestSheetTitleContainer}>
          <p className="typo-title2">브랜드 추가 요청</p>
          <p className={`${styles.brandRequestSheetDescription} typo-body3`}>
            요청하신 브랜드는 검토 후 순차적으로 추가돼요
          </p>
        </div>

        <input
          className={`${styles.brandRequestInput} typo-body3`}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            onSubmit();
          }}
          placeholder="브랜드명"
          aria-label="브랜드 요청 입력"
          maxLength={300}
          disabled={isSubmitting}
        />
      </div>

      <Button
        variant="filled"
        size="large"
        color="primary"
        fullWidth
        state={isSubmitDisabled ? "disabled" : "default"}
        disabled={isSubmitDisabled}
        onClick={onSubmit}
      >
        {isSubmitting ? "요청 중..." : "요청하기"}
      </Button>
    </div>
  );
}
