import { ChevronLeft } from "lucide-react";
import "../css/OnboardingHeader.css";

type Props = {
  stepIndex: number;
  total: number;
  onPrev: () => void;
};

export default function OnboardingHeader({ stepIndex, total, onPrev }: Props) {
  return (
    <header className="onboarding-header">
      <button
        type="button"
        className="onboarding-back"
        onClick={onPrev}
        disabled={stepIndex === 0}
        aria-label="이전"
      >
        <ChevronLeft />
      </button>

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
