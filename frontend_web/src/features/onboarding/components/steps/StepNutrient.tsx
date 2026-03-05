import type { StepComponentProps } from "@/features/onboarding/onboarding.types";
import NumberField from "@/shared/commons/input/NumberField";

export default function StepNutrient({ data, update }: StepComponentProps) {
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "16px 0px" }}>
        <h2>추천하는 탄단지 비율이에요</h2>
        <p>비율을 수정할 수 있어요</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
          <NutrientCard label="지방" value={data.fat} onChange={(v) => update({ fat: v })} />{" "}
        </div>
        <p style={{ textAlign: "center", fontSize: 18 }}>목표 칼로리 0000Kcal</p>
      </div>
    </div>
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

      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <span>000g</span>
        <span>000kcal</span>
      </div>
    </div>
  );
}
