import type { ChangeEvent, RefObject } from "react";
import { ChevronLeft } from "lucide-react";
import styles from "./SearchInputHeader.module.css";

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  onBack?: () => void;
  onClear?: () => void;
  placeholder?: string;
  backButtonAriaLabel?: string;
  inputAriaLabel?: string;
  safeAreaTop?: boolean;
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
};

export function SearchInputHeader({
  value,
  onValueChange,
  onBack,
  onClear,
  placeholder = "검색어를 입력하세요",
  backButtonAriaLabel = "뒤로가기",
  inputAriaLabel = "검색어 입력",
  safeAreaTop = true,
  className,
  inputRef,
}: Props) {
  const classes = [styles.root, safeAreaTop ? styles.safeAreaTop : "", className ?? ""]
    .filter(Boolean)
    .join(" ");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange(event.target.value);
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }

    onValueChange("");
  };

  return (
    <header className={classes}>
      <div className={styles.navBar}>
        <button
          type="button"
          className={styles.backButton}
          onClick={onBack}
          disabled={!onBack}
          aria-label={backButtonAriaLabel}
        >
          <ChevronLeft size={24} />
        </button>

        <div className={styles.fieldWrap}>
          <input
            ref={inputRef}
            className={`${styles.input} typo-body3`}
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            aria-label={inputAriaLabel}
            maxLength={300}
          />

          {value && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="검색어 지우기"
            >
              <img src="/icons/CircleClose.svg" alt="검색어 지우기" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
