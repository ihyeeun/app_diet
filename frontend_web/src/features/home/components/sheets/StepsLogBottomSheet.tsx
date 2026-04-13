import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { useState } from "react";

import style from "@/features/home/styles/TodayBodyLogSection.module.css";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { Button } from "@/shared/commons/button/Button";
import { toast } from "@/shared/commons/toast/toast";

interface StepsLogBottomSheetProps {
  initialSteps: number;
  onClose: () => void;
  onSubmit: (steps: number) => void;
}

function toInteger(value: number) {
  return Math.trunc(value);
}

export default function StepsLogBottomSheet({
  initialSteps,
  onClose,
  onSubmit,
}: StepsLogBottomSheetProps) {
  const [draftSteps, setDraftSteps] = useState<number | undefined>(initialSteps);

  const handleStepsChange = (value: number | null) => {
    if (value === null) {
      setDraftSteps(undefined);
      return;
    }

    setDraftSteps(toInteger(value));
  };

  const handleSubmit = () => {
    if (draftSteps === undefined) {
      toast.warning("걸음 수를 입력해주세요");
      return;
    }

    const nextSteps = toInteger(draftSteps);
    if (nextSteps < 0 || nextSteps > 999999) {
      toast.warning("걸음 수는 0 ~ 999,999 사이로 입력해주세요");
      return;
    }

    onSubmit(nextSteps);
  };

  return (
    <BottomSheet isOpen onClose={onClose} className={style.bodyLogBottomSheet}>
      <div className={style.sheetContainer}>
        <h3 className={`${style.sheetTitle} typo-title2`}>오늘의 걸음 수</h3>
        <BaseNumberField.Root
          value={draftSteps ?? null}
          min={0}
          max={999999}
          step={1}
          format={{ maximumFractionDigits: 0, useGrouping: true }}
          onValueChange={handleStepsChange}
        >
          <BaseNumberField.Group className={style.stepsNumberFieldGroup}>
            <BaseNumberField.Input
              className={`typo-body3 ${style.stepsNumberInput}`}
              inputMode="numeric"
              placeholder="걸음 수 입력"
              aria-label="오늘의 걸음 수 입력"
            />
            <span className={`typo-title2 ${style.stepsUnit}`}>보</span>
          </BaseNumberField.Group>
        </BaseNumberField.Root>
        <div className={style.sheetActions}>
          <Button onClick={handleSubmit} fullWidth size="large">
            기록하기
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
