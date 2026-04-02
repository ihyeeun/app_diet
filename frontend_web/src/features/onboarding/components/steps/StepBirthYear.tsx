import { useEffect } from "react";

import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import WheelPicker from "@/shared/commons/picker/WheelPicker";
import {
  getBirthYearRange,
  isValidBirthYear,
  makeYearOptions,
} from "@/shared/commons/picker/yearOptions";

export default function StepBirthYear({ data, update }: StepComponentProps) {
  const { min: minYear, max: maxYear } = getBirthYearRange();
  const years = makeYearOptions({ from: maxYear, count: maxYear - minYear + 1 }).map(String);
  const selectedYear = isValidBirthYear(data.birthYear) ? data.birthYear : 2000;

  useEffect(() => {
    if (data.birthYear === selectedYear) return;
    update({ birthYear: selectedYear });
  }, [data.birthYear, selectedYear, update]);

  return (
    <section className="onboarding-birth-year-section">
      <div className="onboarding-title">
        <h2 className="typo-title1">출생 연도를 알려주세요</h2>
      </div>

      <WheelPicker
        value={String(selectedYear)}
        options={years}
        suffix="년"
        height={"100%"}
        itemHeight={80}
        onChange={(v) => update({ birthYear: Number(v) })}
      />
    </section>
  );
}
