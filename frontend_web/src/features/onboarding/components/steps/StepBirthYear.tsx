import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import WheelPicker from "@/shared/commons/picker/WheelPicker";
import { makeYearOptions } from "@/shared/commons/picker/yearOptions";

export default function StepBirthYear({ data, update }: StepComponentProps) {
  const currentYear = new Date().getFullYear();
  const years = makeYearOptions({ from: currentYear, count: 110 }).map(String);

  const value = data.birthYear ? String(data.birthYear) : String(currentYear);

  return (
    <section>
      <h2>출생년도를 선택해 주세요</h2>

      <WheelPicker
        value={value}
        options={years}
        suffix="년"
        onChange={(v) => update({ birthYear: Number(v) })}
      />
    </section>
  );
}
