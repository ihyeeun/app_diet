import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { OnboardingData } from "./onboarding.types";
import { STEP_COMPONENTS, STEPS } from "./components/steps/steps";
import { Button } from "@/shared/commons/button/Button";
import "./css/OnboardingPage.css";
import "./css/OnboardingSteps.css";
import { CheckButtonModal } from "@/shared/commons/modals/CheckButtonModal";
import OnboardingHeader from "@/features/onboarding/components/OnboardingHeader";
import {
  ONBOARDING_HEIGHT_RANGE,
  ONBOARDING_WEIGHT_RANGE,
  isInRange,
} from "@/features/onboarding/constants/inputRanges";
import { toast } from "@/shared/commons/toast/toast";

function isBodyRangeValid(data: OnboardingData) {
  return (
    isInRange(data.heightCm, ONBOARDING_HEIGHT_RANGE.min, ONBOARDING_HEIGHT_RANGE.max) &&
    isInRange(data.weightKg, ONBOARDING_WEIGHT_RANGE.min, ONBOARDING_WEIGHT_RANGE.max)
  );
}

function isGoalWeightRangeValid(data: OnboardingData) {
  return isInRange(data.goalWeightKg, ONBOARDING_WEIGHT_RANGE.min, ONBOARDING_WEIGHT_RANGE.max);
}

export default function OnboardingPage() {
  const [userData, setUserData] = useState<OnboardingData>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [isNutrientTotalModalOpen, setIsNutrientTotalModalOpen] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);

  const step = STEPS[stepIndex];
  const total = STEPS.length;

  const update = useCallback((patch: Partial<OnboardingData>) => {
    setUserData((d) => ({ ...d, ...patch }));
  }, []);

  const canGoNext = useMemo(() => {
    return step.isValid(userData);
  }, [step, userData]);

  const next = () => {
    if (step.id === "body" && !isBodyRangeValid(userData)) {
      toast.warning("정확한 값인지 다시 확인해주세요");
      return;
    }

    if (step.id === "goalWeight" && !isGoalWeightRangeValid(userData)) {
      toast.warning("정확한 값인지 다시 확인해주세요");
      return;
    }

    if (step.id === "nutrient") {
      const carbs = userData.carbs ?? 0;
      const protein = userData.protein ?? 0;
      const fat = userData.fat ?? 0;
      const nutrientTotal = carbs + protein + fat;
      const isNutrientTotalValid = Math.abs(nutrientTotal - 100) < 0.001;

      if (!isNutrientTotalValid) {
        setIsNutrientTotalModalOpen(true);
        return;
      }
    }

    if (stepIndex < total - 1) {
      setStepIndex((s) => s + 1);
    }
  };

  const prev = () => {
    if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
    }
  };

  const StepComponent = STEP_COMPONENTS[step.id];

  useEffect(() => {
    const viewport = window.visualViewport;
    const layout = layoutRef.current;
    if (!viewport || !layout) return;
    let prevOffset = -1;

    const updateKeyboardOffset = () => {
      const overlap = Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop));
      const nextOffset = overlap < 8 ? 0 : Math.round(overlap);
      if (prevOffset === nextOffset) return;

      prevOffset = nextOffset;
      layout.style.setProperty("--keyboard-offset", `${nextOffset}px`);
    };

    updateKeyboardOffset();
    viewport.addEventListener("resize", updateKeyboardOffset);
    viewport.addEventListener("scroll", updateKeyboardOffset);
    window.addEventListener("orientationchange", updateKeyboardOffset);

    return () => {
      viewport.removeEventListener("resize", updateKeyboardOffset);
      viewport.removeEventListener("scroll", updateKeyboardOffset);
      window.removeEventListener("orientationchange", updateKeyboardOffset);
    };
  }, []);

  return (
    <div ref={layoutRef} className="onboarding-layout">
      <OnboardingHeader stepIndex={stepIndex} total={total} onPrev={prev} />

      <main className="onboarding-content">
        <StepComponent data={userData} update={update} />
      </main>

      <footer className="onboarding-footer">
        <Button onClick={next} disabled={!canGoNext} fullWidth>
          {step.nextText ?? "다음"}
        </Button>
      </footer>

      <CheckButtonModal
        open={isNutrientTotalModalOpen}
        onOpenChange={setIsNutrientTotalModalOpen}
        title="영양소 비율 확인"
        description="탄단지 비율의 합을 100으로 맞춰주세요"
      />
    </div>
  );
}
