import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { Button } from "@/shared/commons/button/Button";
import { NumberInput } from "@/shared/commons/input/NumberInput";
import { Field } from "@base-ui/react/field";

import { useState } from "react";

export default function StepGoalKalories({ data, update }: StepComponentProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "16px 0px" }}>
        <h2>목표 칼로리를 선택해주세요</h2>
        <p>
          추천하는 목표 칼로리는 ~~kcal예요
          <br />
          기초대사량을 고려해 최소 섭취량으로 설정했어요
        </p>
      </div>

      <Field.Root>
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "8px",
            border: "1px solid #e5e5e5",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
          onClick={() => setOpen(true)}
        >
          <NumberInput
            inputMode="numeric"
            value={data.goalKalories}
            onChange={(value) => update({ goalKalories: value })}
            min={1}
            max={99999}
            step={0.1}
            unit="kcal"
          />
        </div>
      </Field.Root>

      <p>목표 달성까지 약 000주 걸려요</p>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "16px 20px" }}>
          <label>목표 칼로리</label>
          <NumberInput
            inputMode="numeric"
            unit="kcal"
            onChange={(v) => update({ goalKalories: v })}
            value={data.goalKalories}
            max={99999}
            min={1}
          />
          <Button onClick={() => setOpen(false)} fullWidth>
            수정하기
          </Button>
        </div>
      </BottomSheet>
    </div>
  );
}
