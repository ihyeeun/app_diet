import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import { Field, Input } from "@base-ui/react";
import "@/shared/commons/input/input.css";

export default function StepSubscribedCode({ data, update }: StepComponentProps) {
  return (
    <section>
      <div className="onboarding-title">
        <h2>구독 코드가 있다면 입력해주세요</h2>
      </div>
      <Field.Root style={{ padding: "0px 5px" }}>
        <Input
          type="text"
          inputMode="text"
          placeholder="구독코드"
          style={{
            fontSize: 40,
            border: "1px solid #e5e5e5",
            borderRadius: "8px",
            width: "100%",
            padding: "16px 20px",
            textAlign: "right",
          }}
          className="input"
          value={data.subscribedCode}
          onChange={(e) => update({ subscribedCode: e.target.value })}
        />
      </Field.Root>
    </section>
  );
}
