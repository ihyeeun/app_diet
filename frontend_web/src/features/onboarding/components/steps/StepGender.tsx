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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
      style={{
        padding: "16px 20px",
        borderRadius: "8px",
        border: active ? "1px solid #FD8F2E" : "1px solid #e5e5e5",
        background: active ? "#fd8f2e20" : "#fff",
        textAlign: "center",
        cursor: "pointer",
        height: "134px",
        width: "100%",
        color: "black",
      }}
    >
      <div style={{ fontSize: 17, fontWeight: 600 }}>{label}</div>
    </button>
  );
}
