import { ChevronLeft } from "lucide-react";
import type { ChangeEvent, InputHTMLAttributes, KeyboardEvent, RefObject } from "react";

import styles from "./SearchInputHeader.module.css";

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  onBack?: () => void;
  onClear?: () => void;
  onEnter?: (value: string) => void;
  placeholder?: string;
  backButtonAriaLabel?: string;
  inputAriaLabel?: string;
  safeAreaTop?: boolean;
  className?: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  enterKeyHint?: InputHTMLAttributes<HTMLInputElement>["enterKeyHint"];
};

export function SearchInputHeader({
  value,
  onValueChange,
  onBack,
  onClear,
  onEnter,
  placeholder = "검색어를 입력하세요",
  backButtonAriaLabel = "뒤로가기",
  inputAriaLabel = "검색어 입력",
  safeAreaTop = true,
  className,
  inputRef,
  enterKeyHint = "search",
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

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!onEnter) return;
    if (event.nativeEvent.isComposing) return;
    if (event.key !== "Enter") return;

    onEnter(value);
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
            type="search"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label={inputAriaLabel}
            maxLength={300}
            enterKeyHint={enterKeyHint}
          />

          {value && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={handleClear}
              aria-label="검색어 지우기"
            >
              <img src="/icons/circle-close.svg" alt="검색어 지우기" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
