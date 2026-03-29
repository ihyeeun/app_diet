import { PlusIcon } from "lucide-react";
import { useState } from "react";

import ActionCard from "@/features/home/components/cards/ActionCard";
import style from "@/features/home/styles/TodayBodyLogSection.module.css";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { Button } from "@/shared/commons/button/Button";
import { EditorInput } from "@/shared/commons/input/EditorInput";
import { toast } from "@/shared/commons/toast/toast";

type TodayMetricType = "weight" | "steps";

function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

function toInteger(value: number) {
  return Math.trunc(value);
}

export default function TodayBodyLogSection() {
  const [weight, setWeight] = useState(42.2);
  const [steps, setSteps] = useState(30000);
  const [editingMetric, setEditingMetric] = useState<TodayMetricType | null>(null);
  const [draftValue, setDraftValue] = useState<number | undefined>(undefined);

  const isWeightEditing = editingMetric === "weight";

  const openEditor = (metricType: TodayMetricType) => {
    setEditingMetric(metricType);
    setDraftValue(metricType === "weight" ? weight : steps);
  };

  const closeEditor = () => {
    setEditingMetric(null);
    setDraftValue(undefined);
  };

  const inputTitle =
    editingMetric === "weight" ? "오늘의 체중" : editingMetric === "steps" ? "오늘의 걸음 수" : "";

  const handleDraftChange = (value?: number) => {
    if (value === undefined) {
      setDraftValue(undefined);
      return;
    }

    if (isWeightEditing) {
      setDraftValue(roundToOneDecimal(value));
      return;
    }

    setDraftValue(toInteger(value));
  };

  const handleConfirm = () => {
    if (editingMetric === null) {
      return;
    }

    if (draftValue === undefined) {
      toast.warning(editingMetric === "weight" ? "체중을 입력해주세요" : "걸음 수를 입력해주세요");
      return;
    }

    if (editingMetric === "weight") {
      const nextWeight = roundToOneDecimal(draftValue);

      if (nextWeight < 1 || nextWeight > 999.9) {
        toast.warning("체중은 0 ~ 999.9kg 사이로 입력해주세요");
        return;
      }

      setWeight(nextWeight);
      closeEditor();
      return;
    }

    const nextSteps = toInteger(draftValue);

    if (nextSteps < 0 || nextSteps > 999999) {
      toast.warning("걸음 수는 0 ~ 999,999 사이로 입력해주세요");
      return;
    }

    setSteps(nextSteps);
    closeEditor();
  };

  return (
    <>
      <div className={style.todayContainer}>
        <TodayMetricCard
          title="오늘의 체중"
          value={weight}
          unit="kg"
          onClick={() => openEditor("weight")}
        />
        <TodayMetricCard
          title="오늘의 걸음 수"
          value={steps}
          unit="걸음"
          onClick={() => openEditor("steps")}
        />
      </div>

      {editingMetric !== null ? (
        <BottomSheet isOpen onClose={closeEditor}>
          <div className={style.sheetContainer}>
            <h3 className={`${style.sheetTitle} typo-title2`}>{inputTitle}</h3>
            <EditorInput
              type="number"
              inputMode={isWeightEditing ? "decimal" : "numeric"}
              value={draftValue}
              min={isWeightEditing ? 1 : 0}
              max={isWeightEditing ? 999.9 : 999999}
              step={isWeightEditing ? 0.1 : 1}
              placeholder={isWeightEditing ? "체중 입력" : "걸음 수 입력"}
              unit={isWeightEditing ? "kg" : "걸음"}
              clampOnChange={false}
              normalizeOnBlur={false}
              onChange={handleDraftChange}
            />
            <div className={style.sheetActions}>
              <Button onClick={handleConfirm} fullWidth>
                기록하기
              </Button>
            </div>
          </div>
        </BottomSheet>
      ) : null}
    </>
  );
}

function TodayMetricCard({
  title,
  value,
  unit,
  onClick,
}: {
  title: string;
  value: number;
  unit: string;
  onClick: () => void;
}) {
  return (
    <ActionCard onClick={onClick}>
      <div className={style.cardContainer}>
        <div className={style.cardTitleContainer}>
          <p className="typo-title4">{title}</p>
          <PlusIcon size={24} />
        </div>
        <div className={style.valueText}>
          <span className={`typo-h3 ${style.highlightValue}`}>{value.toLocaleString()}</span>
          <span className="typo-label1">{unit}</span>
        </div>
      </div>
    </ActionCard>
  );
}
