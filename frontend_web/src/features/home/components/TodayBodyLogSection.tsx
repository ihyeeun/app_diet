import { PlusIcon } from "lucide-react";
import { useState } from "react";

import ActionCard from "@/features/home/components/cards/ActionCard";
import {
  useRegisterStepsMutation,
  useRegisterWeightMutation,
} from "@/features/home/hooks/mutations/useBodyLogMutation";
import { useGetBodyLog } from "@/features/home/hooks/queries/useBodyLogQuery";
import style from "@/features/home/styles/TodayBodyLogSection.module.css";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { Button } from "@/shared/commons/button/Button";
import { EditorInput } from "@/shared/commons/input/EditorInput";
import { toast } from "@/shared/commons/toast/toast";
import { toOneDecimalPlace } from "@/shared/utils/numberFormat";

type TodayMetricType = "weight" | "steps";

function toInteger(value: number) {
  return Math.trunc(value);
}

export default function TodayBodyLogSection({ date }: { date: string }) {
  const { data: bodyLog } = useGetBodyLog(date);

  const { mutate: registerWeight } = useRegisterWeightMutation({
    onSuccess: () => {
      toast.success("체중이 기록되었어요");
      closeEditor();
      // TODO: 등록된 체중 값으로 bodyLog 업데이트
    },
    onError: () => {
      toast.error("체중 기록에 실패했어요");
    },
  });
  const { mutate: registerSteps } = useRegisterStepsMutation({
    onSuccess: () => {
      toast.success("걸음 수가 기록되었어요");
      closeEditor();
    },
    onError: () => {
      toast.error("걸음 수 기록에 실패했어요");
    },
  });

  const [editingMetric, setEditingMetric] = useState<TodayMetricType | null>(null);

  // TODO : 여기서 0 대신에 현재 몸무게 값을 넣도록 해줘야한다.
  const [draftValue, setDraftValue] = useState<number | undefined>(0);

  const isWeightEditing = editingMetric === "weight";

  const openEditor = (metricType: TodayMetricType) => {
    setEditingMetric(metricType);
    setDraftValue(metricType === "weight" ? (bodyLog?.weight ?? 0) : (bodyLog?.steps ?? 0));
  };

  const closeEditor = () => {
    setEditingMetric(null);
    setDraftValue(undefined);
  };

  const inputTitle =
    editingMetric === "weight" ? "오늘의 체중" : editingMetric === "steps" ? "오늘의 걸음 수" : "";

  const handleDraftChange = (value?: number | undefined) => {
    if (value === undefined) {
      setDraftValue(undefined);
      return;
    }

    if (isWeightEditing) {
      setDraftValue(toOneDecimalPlace(value));
      return;
    }

    setDraftValue(toInteger(value));
  };

  const submitWeight = () => {
    if (draftValue === undefined) {
      toast.warning("체중을 입력해주세요");
      return;
    }

    const nextWeight = toOneDecimalPlace(draftValue);
    if (nextWeight < 1 || nextWeight > 999.9) {
      toast.warning("체중은 1 ~ 999.9kg 사이로 입력해주세요");
      return;
    }

    registerWeight({ date, weight: nextWeight });
  };

  const submitSteps = () => {
    if (draftValue === undefined) {
      toast.warning("걸음 수를 입력해주세요");
      return;
    }

    const nextSteps = toInteger(draftValue);
    if (nextSteps < 0 || nextSteps > 999999) {
      toast.warning("걸음 수는 0 ~ 999,999 사이로 입력해주세요");
      return;
    }

    registerSteps({ date, steps: nextSteps });
  };

  return (
    <>
      <div className={style.todayContainer}>
        <TodayMetricCard
          title="오늘의 체중"
          value={bodyLog?.weight ?? 0}
          unit="kg"
          onClick={() => openEditor("weight")}
        />
        <TodayMetricCard
          title="오늘의 걸음 수"
          value={bodyLog?.steps ?? 0}
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
              <Button onClick={isWeightEditing ? submitWeight : submitSteps} fullWidth>
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
