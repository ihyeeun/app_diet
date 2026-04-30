import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import OnboardingHeader from "@/features/onboarding/components/OnboardingHeader";
import {
  isInRange,
  ONBOARDING_HEIGHT_RANGE,
  ONBOARDING_WEIGHT_RANGE,
} from "@/features/onboarding/constants/inputRanges";
import { useRegisterUserInfoMutation } from "@/features/onboarding/hooks/mutations/useRegisterUserInfoMutation";
import styles from "@/features/onboarding/styles/OnboardingPage.module.css";
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
  return isInRange(data.target_weight, ONBOARDING_WEIGHT_RANGE.min, ONBOARDING_WEIGHT_RANGE.max);
}

export default function OnboardingPage() {
  const [userData, setUserData] = useState<OnboardingData>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [isNutrientTotalModalOpen, setIsNutrientTotalModalOpen] = useState(false);
  const navigate = useNavigate();

  const step = STEPS[stepIndex];
  const total = STEPS.length;

  const { mutate } = useRegisterUserInfoMutation({
    onSuccess: () => {
      syncAppTab("home");
      navigate(PATH.HOME, { replace: true });
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

    if (step.id === "subscribedCode") {
      mutate({
        gender: userData.gender!,
        birthYear: userData.birthYear!,
        height: userData.height!,
        weight: userData.weight!,
        activity: userData.activity!,
        goal: userData.goal!,
        target_weight: userData.target_weight!,
        target_calories: userData.target_calories!,
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

  return (
    <div className={styles.page}>
      <OnboardingHeader stepIndex={stepIndex} total={total} onPrev={prev} />

      <main className={styles.main}>
        <StepComponent data={userData} update={update} />
      </main>

      <footer className={styles.footer}>
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
