import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { Button } from "@/shared/commons/button/Button";
import { EditorInput } from "@/shared/commons/input/EditorInput";
import { Field } from "@base-ui/react/field";

import { useState } from "react";

export default function StepGoalKalories({ data, update }: StepComponentProps) {
  const [open, setOpen] = useState(false);

  return (
    <section>
      <div className="onboarding-title onboarding-title-group">
        <h2 className="typo-title1-semibold">목표 칼로리를 선택해주세요</h2>
        <p className="onboarding-subtitle">
          추천하는 목표 칼로리는 ~~kcal예요
          <br />
          기초대사량을 고려해 최소 섭취량으로 설정했어요
        </p>
      </div>

      <Field.Root className="onboarding-field-padding">
        <button
          className="onboarding-goal-kcal-trigger"
          type="button"
          onClick={() => setOpen(true)}
        >
          <p className="onboarding-goal-kcal-value">{data.goalKalories} kcal</p>
        </button>
      </Field.Root>

      <p className="onboarding-goal-kcal-helper">
        목표 달성까지 약 000주 걸려요
      </p>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)}>
        <div className="onboarding-goal-kcal-sheet">
          <h3>목표 칼로리</h3>
          <EditorInput
            type="number"
            inputMode="numeric"
            value={data.goalKalories}
            max={99999}
            min={1}
            placeholder="목표 칼로리 입력"
            unit="kcal"
            onChange={(v) => update({ goalKalories: v })}
          />
          <div className="onboarding-goal-kcal-actions">
            <Button onClick={() => setOpen(false)} fullWidth>
              수정하기
            </Button>
          </div>
        </div>
      </BottomSheet>
    </section>
  );
}
