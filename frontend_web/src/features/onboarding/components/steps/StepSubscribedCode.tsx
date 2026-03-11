import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import { Field, Input } from "@base-ui/react";
import "@/shared/commons/input/input.css";

export default function StepSubscribedCode({ data, update }: StepComponentProps) {
  return (
    <section>
      <div className="onboarding-title">
        <h2 className="typo-title1-semibold">구독 코드가 있다면 입력해주세요</h2>
      </div>
      <Field.Root className="onboarding-field-padding">
        <Input
          type="text"
          inputMode="text"
          placeholder="구독코드"
          aria-label="구독 코드"
          className="input onboarding-subscribe-input"
          value={data.subscribedCode ?? ""}
          onChange={(e) => update({ subscribedCode: e.target.value })}
        />
      </Field.Root>
    </section>
  );
}
