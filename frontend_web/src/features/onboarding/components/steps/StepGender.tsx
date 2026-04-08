import { type StepComponentProps } from "@/features/onboarding/onboarding.types";
import styles from "@/features/onboarding/styles/OnboardingSteps.module.css";

export default function StepGender({ data, update }: StepComponentProps) {
  return (
    <section className={styles.content}>
      <div className={styles.onboardingTitle}>
        <h2 className="typo-title1">성별이 어떻게 되시나요?</h2>
      </div>

      <div className={styles.onboardingGenderGrid}>
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
      className={[styles.onboardingGenderCard, active ? styles.onboardingGenderCardActive : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="typo-title3">{label}</p>
    </button>
  );
}
