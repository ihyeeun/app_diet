import {
  GENDER,
  type Gender,
  type StepComponentProps,
} from "@/features/onboarding/onboarding.types";

export default function StepGender({ data, update }: StepComponentProps) {
  const handleSelect = (gender: Gender) => {
    update({ gender });
  };

  return (
    <section>
      <div className="onboarding-title">
        <h2 className="typo-title1-semibold">성별이 어떻게 되시나요?</h2>
      </div>

      <div className="onboarding-gender-grid">
        <GenderCard
          label="남성"
          active={data.gender === GENDER.male}
          onClick={() => handleSelect(GENDER.male)}
        />
        <GenderCard
          label="여성"
          active={data.gender === GENDER.female}
          onClick={() => handleSelect(GENDER.female)}
        />
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
