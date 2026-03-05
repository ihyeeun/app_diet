import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import { Field, Input } from "@base-ui/react";
import "@/shared/commons/input/input.css";

export default function StepSubscribedCode({ data, update }: StepComponentProps) {
  return (
    <div>
      <h2>구독 코드가 있다면 입력해주세요</h2>
      <Field.Root>
        <Input
          type="text"
          inputMode="text"
          placeholder="구독코드"
          style={{ fontSize: 40, border: 0, width: "100%" }}
          className="input"
          value={data.subscribedCode}
          onChange={(e) => update({ subscribedCode: e.target.value })}
        />
      </Field.Root>
    </div>
  );
}
