import type { StepComponentProps } from "@/features/onboarding/onboarding.types";

export default function StepGoal({ data, update }: StepComponentProps) {
  return (
    <div>
      <h2>이루고 싶은 목표가 무엇인가요?</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <GoalCard
          selected={data.goal === 1}
          onClick={() => update({ goal: 1 })}
          title="다이어트"
          description="체지방을 줄이고 싶어요"
        />
        <GoalCard
          selected={data.goal === 2}
          onClick={() => update({ goal: 2 })}
          title="체중 유지"
          description="지금의 몸무게를 유지하고 싶어요"
        />
        <GoalCard
          selected={data.goal === 3}
          onClick={() => update({ goal: 3 })}
          title="근육 늘리기"
          description="근육량을 늘리고 싶어요"
        />
      </div>
    </div>
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
      className={`card ${selected ? "card--active" : ""}`}
      aria-pressed={selected}
      style={{
        padding: "16px 20px",
        width: "100%",
        borderRadius: 8,
        border: selected ? "1px solid #FD8F2E" : "1px solid #e5e5e5",
        background: selected ? "#fd8f2e20" : "#fff",
        textAlign: "left",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <p style={{ margin: 0 }}>{title}</p>
        <p style={{ margin: 0 }}>{description}</p>
      </div>
    </button>
  );
}
