import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import NumberField from "@/shared/commons/input/NumberField";

export default function StepNutrient({ data, update }: StepComponentProps) {
  return (
    <section>
      <div className="onboarding-title onboarding-title-group onboarding-title-group--compact">
        <h2 className="typo-title1-semibold">추천하는 탄단지 비율이에요</h2>
        <p className="onboarding-subtitle">비율을 수정할 수 있어요</p>
      </div>
      <div className="onboarding-nutrient-content">
        <p className="onboarding-nutrient-goal">목표 칼로리 0000Kcal</p>
        <div className="onboarding-nutrient-list">
          <NutrientCard
            label="탄수화물"
            value={data.carbs}
            onChange={(v) => update({ carbs: v })}
          />
          <NutrientCard
            label="단백질"
            value={data.protein}
            onChange={(v) => update({ protein: v })}
          />
          <NutrientCard label="지방" value={data.fat} onChange={(v) => update({ fat: v })} />
        </div>
      </div>
    </section>
  );
}

type NutrientCardProps = {
  label: string;
  value?: number;
  onChange: (v?: number) => void;
};

function NutrientCard({ label, value, onChange }: NutrientCardProps) {
  return (
    <div className="onboarding-nutrient-card">
      <label className="onboarding-nutrient-label">{label}</label>
      <NumberField value={value} onChange={onChange} min={0} max={100} step={0.5} unit="%" />

      <div className="onboarding-nutrient-divider" />

      <div className="onboarding-nutrient-meta">
        <span>000g</span>
        <span>000kcal</span>
      </div>
    </div>
  );
}
