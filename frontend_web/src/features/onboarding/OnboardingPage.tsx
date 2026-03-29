import "./css/OnboardingPage.css";
import "./css/OnboardingSteps.css";

import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import OnboardingHeader from "@/features/onboarding/components/OnboardingHeader";
import {
  isInRange,
  ONBOARDING_HEIGHT_RANGE,
  ONBOARDING_WEIGHT_RANGE,
} from "@/features/onboarding/constants/inputRanges";
import { useRegisterUserInfoMutation } from "@/features/onboarding/hooks/mutations/useRegisterUserInfoMutation";
import { PATH } from "@/router/path";
import { syncAppTab } from "@/shared/api/bridge/nativeBridge";
import { Button } from "@/shared/commons/button/Button";
import { CheckButtonModal } from "@/shared/commons/modals/CheckButtonModal";
import { toast } from "@/shared/commons/toast/toast";

import { STEP_COMPONENTS, STEPS } from "./components/steps/steps";
import type { OnboardingData } from "./onboarding.types";

function isBodyRangeValid(data: OnboardingData) {
  return (
    isInRange(data.height, ONBOARDING_HEIGHT_RANGE.min, ONBOARDING_HEIGHT_RANGE.max) &&
    isInRange(data.weight, ONBOARDING_WEIGHT_RANGE.min, ONBOARDING_WEIGHT_RANGE.max)
  );
}

function isGoalWeightRangeValid(data: OnboardingData) {
  const isWeightInDefaultRange = isInRange(
    data.goalweight,
    ONBOARDING_WEIGHT_RANGE.min,
    ONBOARDING_WEIGHT_RANGE.max,
  );

  if (!isWeightInDefaultRange) {
    return false;
  }

  if (data.goal === 0 && data.goalweight !== undefined && data.weight !== undefined) {
    return data.goalweight <= data.weight;
  }

  if (data.goal === 2 && data.goalweight !== undefined && data.weight !== undefined) {
    return data.goalweight > data.weight;
  }

  return true;
}

export default function OnboardingPage() {
  const [userData, setUserData] = useState<OnboardingData>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [isNutrientTotalModalOpen, setIsNutrientTotalModalOpen] = useState(false);
  const layoutRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const step = STEPS[stepIndex];
  const total = STEPS.length;

  const { mutate } = useRegisterUserInfoMutation({
    onSuccess: () => {
      syncAppTab("home");
      navigate(PATH.HOME);
    },
    onError: () => {
      toast.warning("등록 실패");
    },
  });

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
      if (
        userData.goal === 0 &&
        userData.goalweight !== undefined &&
        userData.weight !== undefined
      ) {
        toast.warning("다이어트 목표는 현재 몸무게보다 높게 설정할 수 없어요");
      } else if (
        userData.goal === 2 &&
        userData.goalweight !== undefined &&
        userData.weight !== undefined
      ) {
        toast.warning("근육 늘리기 목표는 현재 몸무게보다 높게 설정해야 해요");
      } else {
        toast.warning("정확한 값인지 다시 확인해주세요");
      }
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

    if (step.id === "subscribedCode") {
      mutate({
        gender: userData.gender!,
        birthYear: userData.birthYear!,
        height: userData.height!,
        weight: userData.weight!,
        activity: userData.activity!,
        goal: userData.goal!,
        target_weight: userData.goalweight!,
        target_calories: userData.targetCalories!,
        target_ratio: [userData.carbs!, userData.protein!, userData.fat!],
        subCode: userData.subscribedCode ?? "",
      });

      return;
    }
  };

  const prev = () => {
    if (stepIndex > 0) {
      setStepIndex((s) => s - 1);
    }
  };

  const StepComponent = STEP_COMPONENTS[step.id];

  // useEffect(() => {
  //   const viewport = window.visualViewport;
  //   const layout = layoutRef.current;
  //   if (!viewport || !layout) return;
  //   let prevOffset = -1;

  //   const updateKeyboardOffset = () => {
  //     const overlap = Math.max(0, window.innerHeight - (viewport.height + viewport.offsetTop));
  //     const nextOffset = overlap < 8 ? 0 : Math.round(overlap);
  //     if (prevOffset === nextOffset) return;

  //     prevOffset = nextOffset;
  //     layout.style.setProperty("--keyboard-offset", `${nextOffset}px`);
  //   };

  //   updateKeyboardOffset();
  //   viewport.addEventListener("resize", updateKeyboardOffset);
  //   viewport.addEventListener("scroll", updateKeyboardOffset);
  //   window.addEventListener("orientationchange", updateKeyboardOffset);

  //   return () => {
  //     viewport.removeEventListener("resize", updateKeyboardOffset);
  //     viewport.removeEventListener("scroll", updateKeyboardOffset);
  //     window.removeEventListener("orientationchange", updateKeyboardOffset);
  //   };
  // }, []);

  return (
    <div ref={layoutRef} className="onboarding-layout">
      <OnboardingHeader stepIndex={stepIndex} total={total} onPrev={prev} />

      <main className="onboarding-content">
        <StepComponent data={userData} update={update} />
      </main>

      <footer className="onboarding-footer">
        <Button
          onClick={next}
          disabled={!canGoNext}
          fullWidth
          variant="filled"
          size="large"
          color="primary"
          state={canGoNext ? "default" : "disabled"}
        >
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
