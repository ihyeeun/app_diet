import { useTargetCaloriesMutation } from "@/features/onboarding/hooks/mutations/useRecommendMutation";
import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import { calculateGoalWeek } from "@/features/onboarding/utils/calculateGoalWeek";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { Button } from "@/shared/commons/button/Button";
import { EditorInput } from "@/shared/commons/input/EditorInput";
import { toast } from "@/shared/commons/toast/toast";
import { Field } from "@base-ui/react/field";
import { useEffect, useMemo, useState } from "react";

const GOAL_CALORIES_MIN = 1;
const GOAL_CALORIES_MAX = 99999;
const GOAL_CALORIES_STEP = 1;

function toInteger(value: number) {
  return Math.trunc(value);
}

function formattargetCalories(value?: number) {
  if (value === undefined) return "--";
  return toInteger(value).toString();
}

function hasRequiredRecommendPayload(data: StepComponentProps["data"]) {
  return (
    data.gender !== undefined &&
    data.birthYear !== undefined &&
    data.weight !== undefined &&
    data.height !== undefined &&
    data.activity !== undefined &&
    data.goal !== undefined
  );
}

export default function SteptargetCalories({ data, update }: StepComponentProps) {
  const [open, setOpen] = useState(false);
  const [drafttargetCalories, setDrafttargetCalories] = useState<number | undefined>(undefined);

  const {
    mutate,
    isPending,
    data: responseData,
  } = useTargetCaloriesMutation({
    onError: (error) => {
      console.error(error);
    },
  });

  const requestPayload = useMemo(
    () => ({
      gender: data.gender,
      birthYear: data.birthYear,
      weight: data.weight,
      height: data.height,
      activity: data.activity,
      goal: data.goal,
    }),
    [data.gender, data.birthYear, data.weight, data.height, data.activity, data.goal],
  );

  useEffect(() => {
    if (!hasRequiredRecommendPayload(requestPayload)) {
      return;
    }

    mutate(requestPayload);
  }, [mutate, requestPayload]);

  useEffect(() => {
    if (responseData === undefined) {
      return;
    }

    update({ targetCalories: toInteger(responseData) });
  }, [responseData, update]);

  const visibletargetCalories = data.targetCalories ?? responseData;
  const normalizedVisibletargetCalories =
    visibletargetCalories === undefined ? undefined : toInteger(visibletargetCalories);

  const goalWeeks = useMemo(() => {
    if (normalizedVisibletargetCalories === undefined) {
      return undefined;
    }

    try {
      return calculateGoalWeek(data, normalizedVisibletargetCalories);
    } catch {
      return null;
    }
  }, [data, normalizedVisibletargetCalories]);

  const goalWeekMessage = useMemo(() => {
    if (goalWeeks === undefined) {
      return "목표 달성 기간을 계산하고 있어요";
    }

    if (goalWeeks === null) {
      return "해당 칼로리로는 목표 달성이 어려워요";
    }

    return `목표 달성까지 약 ${goalWeeks}주 걸려요`;
  }, [goalWeeks]);

  const openEditor = () => {
    setDrafttargetCalories(normalizedVisibletargetCalories);
    setOpen(true);
  };

  const handleConfirmtargetCalories = () => {
    if (drafttargetCalories === undefined) {
      toast.warning("목표 칼로리를 입력해주세요");
      return;
    }

    const nexttargetCalories = toInteger(drafttargetCalories);

    if (nexttargetCalories < GOAL_CALORIES_MIN || nexttargetCalories > GOAL_CALORIES_MAX) {
      toast.warning("목표 칼로리는 1~99999 사이로 입력해주세요");
      return;
    }

    update({ targetCalories: nexttargetCalories });
    setOpen(false);
  };

  return (
    <section>
      <div className="onboarding-title onboarding-title-group">
        <h2 className="typo-title1-semibold">목표 칼로리를 선택해주세요</h2>
        <p className="onboarding-subtitle">
          {isPending
            ? "추천 목표 칼로리를 계산하고 있어요"
            : `추천하는 목표 칼로리는 ${formattargetCalories(responseData)}kcal예요`}
          <br />
          기초대사량을 고려해 최소 섭취량으로 설정했어요
        </p>
      </div>

      <Field.Root className="onboarding-field-padding">
        <button className="onboarding-goal-kcal-trigger" type="button" onClick={openEditor}>
          <p className="onboarding-goal-kcal-value">
            {formattargetCalories(visibletargetCalories)} kcal
          </p>
        </button>
      </Field.Root>

      <p className="onboarding-goal-kcal-helper">{goalWeekMessage}</p>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)}>
        <div className="onboarding-goal-kcal-sheet">
          <h3>목표 칼로리</h3>
          <EditorInput
            type="number"
            inputMode="numeric"
            value={drafttargetCalories}
            max={GOAL_CALORIES_MAX}
            min={GOAL_CALORIES_MIN}
            step={GOAL_CALORIES_STEP}
            placeholder="목표 칼로리 입력"
            unit="kcal"
            clampOnChange={false}
            normalizeOnBlur={false}
            onChange={(value) => {
              setDrafttargetCalories(value === undefined ? undefined : toInteger(value));
            }}
          />
          <div className="onboarding-goal-kcal-actions">
            <Button onClick={handleConfirmtargetCalories} fullWidth>
              수정하기
            </Button>
          </div>
        </div>
      </BottomSheet>
    </section>
  );
}
