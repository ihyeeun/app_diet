import type { StepComponentProps } from "@/features/onboarding/onboarding.types";

export default function StepActivity({ data, update }: StepComponentProps) {
  return (
    <section>
      <div className="onboarding-title">
        <h2 className="typo-title1-semibold">평소에 얼마나 움직이시나요?</h2>
      </div>

      <div className="onboarding-option-list onboarding-option-list--padded">
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
