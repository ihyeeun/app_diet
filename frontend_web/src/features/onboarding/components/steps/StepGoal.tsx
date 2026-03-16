import type { StepComponentProps } from "@/features/onboarding/onboarding.types";

export default function StepGoal({ data, update }: StepComponentProps) {
  return (
    <section>
      <div className="onboarding-title">
        <h2 className="typo-title1-semibold">이루고 싶은 목표가 무엇인가요?</h2>
      </div>

      <div className="onboarding-option-list">
        <GoalCard
          selected={data.goal === 0}
          onClick={() => update({ goal: 0 })}
          title="다이어트"
          description="체지방을 줄이고 싶어요"
        />
        <GoalCard
          selected={data.goal === 1}
          onClick={() => update({ goal: 1 })}
          title="체중 유지"
          description="지금의 몸무게를 유지하고 싶어요"
        />
        <GoalCard
          selected={data.goal === 2}
          onClick={() => update({ goal: 2 })}
          title="근육 늘리기"
          description="근육량을 늘리고 싶어요"
        />
      </div>
    </section>
  );
}

function GoalCard({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`onboarding-option-card ${selected ? "onboarding-option-card--active" : ""}`}
      aria-pressed={selected}
    >
      <div className="onboarding-option-card-content">
        <p className="onboarding-option-card-title">{title}</p>
        <p className="onboarding-option-card-description">{description}</p>
      </div>
    </button>
  );
}
