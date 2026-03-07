import type { StepComponentProps } from "@/features/onboarding/onboarding.types";

export default function StepActivity({ data, update }: StepComponentProps) {
  return (
    <section>
      <div className="onboarding-title">
        <h2>평소에 얼마나 움직이시나요?</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "0px 5px" }}>
        <ActivityCard
          selected={data.activityLevel === 1}
          onClick={() => update({ activityLevel: 1 })}
          title="대부분 앉아서 생활해요"
          description="하루에 4,000보 이하로 걸어요"
        />
        <ActivityCard
          selected={data.activityLevel === 2}
          onClick={() => update({ activityLevel: 2 })}
          title="가벼운 이동이 있어요"
          description="하루에 4,000 ~ 7,500보 사이로 걸어요"
        />
        <ActivityCard
          selected={data.activityLevel === 3}
          onClick={() => update({ activityLevel: 3 })}
          title="움직이는 시간이 꽤 많아요"
          description="하루에 7,500 ~ 12,000보 사이로 걸어요"
        />
        <ActivityCard
          selected={data.activityLevel === 4}
          onClick={() => update({ activityLevel: 4 })}
          title="가만히 있는 시간은 거의 없어요"
          description="하루에 12,000보 이상 걸어요"
        />
      </div>
    </section>
  );
}

function ActivityCard({
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
        height: "82px",
        borderRadius: 8,
        border: selected ? "1px solid #FD8F2E" : "1px solid #e5e5e5",
        background: selected ? "#fd8f2e20" : "#fff",
        textAlign: "left",
        cursor: "pointer",
        color: "black",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <p style={{ fontSize: 17, fontWeight: 600 }}>{title}</p>
        <p style={{ fontSize: 15, fontWeight: 500, color: "#626262" }}>{description}</p>
      </div>
    </button>
  );
}
