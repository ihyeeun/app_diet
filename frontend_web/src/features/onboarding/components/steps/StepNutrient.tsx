import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import NumberField from "@/shared/commons/input/NumberField";

export default function StepNutrient({ data, update }: StepComponentProps) {
  return (
    <section>
      <div
        className="onboarding-title"
        style={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <h2 className="typo-title1-semibold">추천하는 탄단지 비율이에요</h2>
        <p style={{ fontSize: 18, fontWeight: 500, color: "#4c4c4c" }}>비율을 수정할 수 있어요</p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          color: "#FF7700",
          padding: "0px 5px",
        }}
      >
        <p style={{ textAlign: "center", fontSize: 18, fontWeight: 500 }}>목표 칼로리 0000Kcal</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
    <div
      style={{
        padding: "16px 20px",
        borderRadius: "8px",
        border: "1px solid #e5e5e5",
        background: "#fff",
        width: "100%",
        color: "black",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <label style={{ fontSize: 18 }}>{label}</label>
      <NumberField value={value} onChange={onChange} min={0} max={100} step={0.5} unit="%" />

      <div style={{ background: "#ddd", height: 1, margin: "4px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-around", fontWeight: 600 }}>
        <span>000g</span>
        <span>000kcal</span>
      </div>
    </div>
  );
}
