import "../css/OnboardingHeader.css";

import { ChevronLeft } from "lucide-react";

type Props = {
  stepIndex: number;
  total: number;
  onPrev: () => void;
};

export default function OnboardingHeader({ stepIndex, total, onPrev }: Props) {
  return (
    <header className="onboarding-header">
      <div className="onboarding-navigation">
        <button
          type="button"
          className="onboarding-back"
          onClick={onPrev}
          disabled={stepIndex === 0}
          aria-label="이전"
        >
          <ChevronLeft size={24} />
        </button>
      </div>

      <div className="onboarding-progress">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={["progress-segment", i <= stepIndex ? "filled" : ""]
              .filter(Boolean)
              .join(" ")}
          />
        ))}
      </div>

      <div />
    </header>
  );
}
