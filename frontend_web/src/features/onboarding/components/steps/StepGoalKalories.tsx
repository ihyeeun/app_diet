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
      <div
        className="onboarding-title"
        style={{ display: "flex", flexDirection: "column", gap: 4 }}
      >
        <h2>목표 칼로리를 선택해주세요</h2>
        <p style={{ fontSize: 16, fontWeight: 500, color: "#4c4c4c" }}>
          추천하는 목표 칼로리는 ~~kcal예요
          <br />
          기초대사량을 고려해 최소 섭취량으로 설정했어요
        </p>
      </div>

      <Field.Root style={{ padding: "0px 5px" }}>
        <div
          style={{
            padding: "16px 20px",
            borderRadius: "8px",
            border: "1px solid #e5e5e5",
            background: "#fff",
            display: "flex",
            flexDirection: "column",
            textAlign: "end",
          }}
          onClick={() => setOpen(true)}
        >
          <p style={{ fontSize: 40 }}>{data.goalKalories} kcal</p>
        </div>
      </Field.Root>

      <p style={{ padding: "16px 5px", textAlign: "center", fontSize: 18, fontWeight: "500" }}>
        목표 달성까지 약 000주 걸려요
      </p>

      <BottomSheet isOpen={open} onClose={() => setOpen(false)}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            padding: "0px 24px",
          }}
        >
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
          <div style={{ padding: "12px 0px" }}>
            <Button onClick={() => setOpen(false)} fullWidth>
              수정하기
            </Button>
          </div>
        </div>
      </BottomSheet>
    </section>
  );
}
