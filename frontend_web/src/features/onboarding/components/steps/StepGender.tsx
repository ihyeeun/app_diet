import { type StepComponentProps } from "@/features/onboarding/onboarding.types";

export default function StepGender({ data, update }: StepComponentProps) {
  return (
    <section>
      <div className="onboarding-title">
        <h2 className="typo-title1-semibold">성별이 어떻게 되시나요?</h2>
      </div>

      <div className="onboarding-gender-grid">
        <GenderCard label="남성" active={data.gender === 0} onClick={() => update({ gender: 0 })} />
        <GenderCard label="여성" active={data.gender === 1} onClick={() => update({ gender: 1 })} />
      </div>
    </section>
  );
}

function GenderCard({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`onboarding-gender-card ${active ? "onboarding-gender-card--active" : ""}`}
    >
      <p className="typo-title3-semibold">{label}</p>
    </button>
  );
}
