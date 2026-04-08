import { ChevronLeft } from "lucide-react";

import styles from "@/features/onboarding/styles/OnboardingHeader.module.css";

type Props = {
  stepIndex: number;
  total: number;
  onPrev: () => void;
};

export default function OnboardingHeader({ stepIndex, total, onPrev }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.navigation}>
        <button
          type="button"
          className={styles.back}
          onClick={onPrev}
          disabled={stepIndex === 0}
          aria-label="이전"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className={styles.progress}>
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={[styles.progressSegment, i <= stepIndex ? styles.filled : ""]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>

      <div />
    </header>
  );
}
