import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

import style from "@/features/home/styles/TodayBodyLogSection.module.css";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { Button } from "@/shared/commons/button/Button";
import { toast } from "@/shared/commons/toast/toast";
import { toOneDecimalPlace } from "@/shared/utils/numberFormat";

interface WeightLogBottomSheetProps {
  initialWeight?: number;
  onClose: () => void;
  onSubmit: (weight: number) => void;
}

export default function WeightLogBottomSheet({
  initialWeight,
  onClose,
  onSubmit,
}: WeightLogBottomSheetProps) {
  const [draftWeight, setDraftWeight] = useState<number | undefined>(initialWeight);

  const canDecrease = draftWeight !== undefined && draftWeight > 1;
  const canIncrease = draftWeight === undefined || draftWeight < 999.9;

  const handleSubmit = () => {
    if (draftWeight === undefined) {
      toast.warning("체중을 입력해주세요");
      return;
    }

    const nextWeight = toOneDecimalPlace(draftWeight);
    if (nextWeight < 1 || nextWeight > 999.9) {
      toast.warning("체중은 1 ~ 999.9kg 사이로 입력해주세요");
      return;
    }

    onSubmit(nextWeight);
  };

  return (
    <BottomSheet isOpen onClose={onClose} className={style.bodyLogBottomSheet}>
      <div className={style.sheetContainer}>
        <h3 className={`${style.sheetTitle} typo-title2`}>오늘의 체중</h3>
        <BaseNumberField.Root
          value={draftWeight ?? null}
          min={1}
          max={999.9}
          step={0.1}
          format={{
            maximumFractionDigits: 1,
            minimumFractionDigits: 0,
            useGrouping: false,
          }}
          onValueChange={(nextValue) => {
            if (nextValue == null) {
              setDraftWeight(undefined);
              return;
            }

            setDraftWeight(toOneDecimalPlace(nextValue));
          }}
        >
          <BaseNumberField.Group className={style.weightNumberFieldGroup}>
            <BaseNumberField.Decrement
              className={style.weightAdjustButton}
              aria-label="체중 0.1kg 감소"
              disabled={!canDecrease}
            >
              <Minus size={24} />
            </BaseNumberField.Decrement>

            <div className={style.weightValueDisplay}>
              <BaseNumberField.Input
                className={`typo-h2 ${style.weightNumberInput}`}
                inputMode="decimal"
                placeholder="0"
                aria-label="오늘의 체중 입력"
              />
              <span className={`typo-title2 ${style.weightUnit}`}>kg</span>
            </div>

            <BaseNumberField.Increment
              className={style.weightAdjustButton}
              aria-label="체중 0.1kg 증가"
              disabled={!canIncrease}
            >
              <Plus size={24} />
            </BaseNumberField.Increment>
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
