import "@/features/onboarding/css/OnboardingPage.css";
import "@/features/onboarding/css/OnboardingSteps.css";

import { Field } from "@base-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import StepActivity from "@/features/onboarding/components/steps/StepActivity";
import StepBirthYear from "@/features/onboarding/components/steps/StepBirthYear";
import StepGender from "@/features/onboarding/components/steps/StepGender";
import StepGoal from "@/features/onboarding/components/steps/StepGoal";
import StepGoalCalories from "@/features/onboarding/components/steps/StepGoalCalories";
import StepGoalWeight from "@/features/onboarding/components/steps/StepGoalWeight";
import StepNutrient from "@/features/onboarding/components/steps/StepNutrient";
import {
  isInRange,
  ONBOARDING_HEIGHT_RANGE,
  ONBOARDING_WEIGHT_RANGE,
} from "@/features/onboarding/constants/inputRanges";
import type { OnboardingData } from "@/features/onboarding/onboarding.types";
import {
  updateActivity,
  updateBirthYear,
  updateGender,
  updateGoal,
  updateHeight,
  updateTargetCalories,
  updateTargetRatio,
  updateTargetWeight,
  updateWeight,
} from "@/features/profile/api/profile";
import { queryKeys } from "@/features/profile/hooks/queries/queryKey";
import { useGetProfileQuery } from "@/features/profile/hooks/queries/useProfileQuery";
import styles from "@/features/profile/styles/GoalEditPage.module.css";
import type { ProfileResponseDto } from "@/shared/api/types/api.dto";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { NumberInput } from "@/shared/commons/input/NumberInput";
import { CheckButtonModal } from "@/shared/commons/modals/CheckButtonModal";
import { isValidBirthYear } from "@/shared/commons/picker/yearOptions";
import { toast } from "@/shared/commons/toast/toast";
import { useSetTargets } from "@/shared/stores/targetNutrient.store";

type GoalEditStage = "summary" | "targetCalories" | "nutrient";
type EditableField =
  | "gender"
  | "birthYear"
  | "height"
  | "weight"
  | "activity"
  | "goal"
  | "goalWeight";

type GoalEditDraft = Pick<
  OnboardingData,
  | "gender"
  | "birthYear"
  | "height"
  | "weight"
  | "activity"
  | "goal"
  | "goalweight"
  | "targetCalories"
  | "carbs"
  | "protein"
  | "fat"
>;

type SummaryField = {
  id: EditableField;
  label: string;
};

const SUMMARY_FIELDS: SummaryField[] = [
  { id: "gender", label: "성별" },
  { id: "birthYear", label: "출생 연도" },
  { id: "height", label: "키" },
  { id: "weight", label: "현재 몸무게" },
  { id: "activity", label: "활동량" },
  { id: "goal", label: "목표" },
  { id: "goalWeight", label: "목표 몸무게" },
];

const ACTIVITY_LABELS = [
  "대부분 앉아서 생활해요",
  "가벼운 이동이 있어요",
  "움직이는 시간이 꽤 많아요",
  "가만히 있는 시간은 거의 없어요",
] as const;

const GOAL_LABELS = ["다이어트", "체중 유지", "근육 늘리기"] as const;

const GOAL_CALORIES_MIN = 1;
const GOAL_CALORIES_MAX = 99999;
const RATIO_TOLERANCE = 0.001;

function toGoalEditDraft(profile: ProfileResponseDto): GoalEditDraft {
  return {
    gender: profile.gender,
    birthYear: profile.birthYear,
    height: profile.height,
    weight: profile.weight,
    activity: profile.activity,
    goal: profile.goal,
    goalweight: profile.target_weight,
    targetCalories: profile.target_calories,
    carbs: profile.target_ratio[0],
    protein: profile.target_ratio[1],
    fat: profile.target_ratio[2],
  };
}

function formatDecimal(value?: number) {
  if (value === undefined) return "-";
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function getSummaryValue(field: EditableField, draft: GoalEditDraft) {
  if (field === "gender") {
    if (draft.gender === 0) return "남성";
    if (draft.gender === 1) return "여성";
    return "-";
  }

  if (field === "birthYear") {
    return draft.birthYear !== undefined ? `${draft.birthYear}년` : "-";
  }

  if (field === "height") {
    return draft.height !== undefined ? `${formatDecimal(draft.height)}cm` : "-";
  }

  if (field === "weight") {
    return draft.weight !== undefined ? `${formatDecimal(draft.weight)}kg` : "-";
  }

  if (field === "activity") {
    return draft.activity !== undefined ? (ACTIVITY_LABELS[draft.activity] ?? "-") : "-";
  }

  if (field === "goal") {
    return draft.goal !== undefined ? (GOAL_LABELS[draft.goal] ?? "-") : "-";
  }

  return draft.goalweight !== undefined ? `${formatDecimal(draft.goalweight)}kg` : "-";
}

function isGoalWeightRangeValid(data: GoalEditDraft) {
  const isWeightInDefaultRange = isInRange(
    data.goalweight,
    ONBOARDING_WEIGHT_RANGE.min,
    ONBOARDING_WEIGHT_RANGE.max,
  );

  if (!isWeightInDefaultRange) {
    return false;
  }

  if (data.goal === 0 && data.goalweight !== undefined && data.weight !== undefined) {
    return data.goalweight <= data.weight;
  }

  if (data.goal === 2 && data.goalweight !== undefined && data.weight !== undefined) {
    return data.goalweight > data.weight;
  }

  return true;
}

function validateStartPlan(draft: GoalEditDraft) {
  if (draft.gender === undefined) return "성별을 선택해주세요";
  if (!isValidBirthYear(draft.birthYear)) return "출생 연도를 다시 확인해주세요";

  if (!isInRange(draft.height, ONBOARDING_HEIGHT_RANGE.min, ONBOARDING_HEIGHT_RANGE.max)) {
    return "키를 다시 확인해주세요";
  }

  if (!isInRange(draft.weight, ONBOARDING_WEIGHT_RANGE.min, ONBOARDING_WEIGHT_RANGE.max)) {
    return "현재 몸무게를 다시 확인해주세요";
  }

  if (draft.activity === undefined) return "활동량을 선택해주세요";
  if (draft.goal === undefined) return "목표를 선택해주세요";

  if (!isGoalWeightRangeValid(draft)) {
    if (draft.goal === 0 && draft.goalweight !== undefined && draft.weight !== undefined) {
      return "다이어트 목표는 현재 몸무게보다 높게 설정할 수 없어요";
    }

    if (draft.goal === 2 && draft.goalweight !== undefined && draft.weight !== undefined) {
      return "근육 늘리기 목표는 현재 몸무게보다 높게 설정해야 해요";
    }

    return "목표 몸무게를 다시 확인해주세요";
  }

  return null;
}

function hasNutrientTotal(draft: GoalEditDraft) {
  if (draft.carbs === undefined || draft.protein === undefined || draft.fat === undefined) {
    return false;
  }

  const nutrientTotal = draft.carbs + draft.protein + draft.fat;
  return Math.abs(nutrientTotal - 100) < RATIO_TOLERANCE;
}

function isRatioChanged(initial: GoalEditDraft, draft: GoalEditDraft) {
  if (
    draft.carbs === undefined ||
    draft.protein === undefined ||
    draft.fat === undefined ||
    initial.carbs === undefined ||
    initial.protein === undefined ||
    initial.fat === undefined
  ) {
    return false;
  }

  return (
    Math.abs(draft.carbs - initial.carbs) >= RATIO_TOLERANCE ||
    Math.abs(draft.protein - initial.protein) >= RATIO_TOLERANCE ||
    Math.abs(draft.fat - initial.fat) >= RATIO_TOLERANCE
  );
}

function toUpdatedProfile(previous: ProfileResponseDto, draft: GoalEditDraft): ProfileResponseDto {
  const nextTargetRatio: [number, number, number] = [
    draft.carbs ?? previous.target_ratio[0],
    draft.protein ?? previous.target_ratio[1],
    draft.fat ?? previous.target_ratio[2],
  ];

  return {
    ...previous,
    gender: draft.gender ?? previous.gender,
    birthYear: draft.birthYear ?? previous.birthYear,
    height: draft.height ?? previous.height,
    weight: draft.weight ?? previous.weight,
    activity: draft.activity ?? previous.activity,
    goal: draft.goal ?? previous.goal,
    target_weight: draft.goalweight ?? previous.target_weight,
    target_calories: draft.targetCalories ?? previous.target_calories,
    target_ratio: nextTargetRatio,
  };
}

export default function GoalEditPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setTargets = useSetTargets();
  const { data: profile, isPending } = useGetProfileQuery();

  const [stage, setStage] = useState<GoalEditStage>("summary");
  const [draft, setDraft] = useState<GoalEditDraft | null>(null);
  const [initialDraft, setInitialDraft] = useState<GoalEditDraft | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [sheetData, setSheetData] = useState<GoalEditDraft>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNutrientTotalModalOpen, setIsNutrientTotalModalOpen] = useState(false);

  useEffect(() => {
    if (!profile || draft) {
      return;
    }

    const mapped = toGoalEditDraft(profile);
    setDraft(mapped);
    setInitialDraft(mapped);
  }, [profile, draft]);

  const updateDraft = useCallback((patch: Partial<OnboardingData>) => {
    setDraft((previous) => (previous ? { ...previous, ...patch } : previous));
  }, []);

  const updateSheetData = useCallback((patch: Partial<OnboardingData>) => {
    setSheetData((previous) => ({ ...previous, ...patch }));
  }, []);

  const openEditor = (field: EditableField) => {
    if (!draft) return;
    setEditingField(field);
    setSheetData({ ...draft });
  };

  const closeEditor = () => {
    setEditingField(null);
    setSheetData({});
  };

  const applyEditor = () => {
    if (!draft || !editingField) return;

    if (editingField === "gender") {
      if (sheetData.gender === undefined) {
        toast.warning("성별을 선택해주세요");
        return;
      }

      updateDraft({ gender: sheetData.gender });
      toast.success("수정되었어요");
      closeEditor();
      return;
    }

    if (editingField === "birthYear") {
      if (!isValidBirthYear(sheetData.birthYear)) {
        toast.warning("출생 연도를 다시 확인해주세요");
        return;
      }

      updateDraft({ birthYear: sheetData.birthYear });
      toast.success("수정되었어요");
      closeEditor();
      return;
    }

    if (editingField === "height") {
      if (!isInRange(sheetData.height, ONBOARDING_HEIGHT_RANGE.min, ONBOARDING_HEIGHT_RANGE.max)) {
        toast.warning("키를 다시 확인해주세요");
        return;
      }

      updateDraft({ height: sheetData.height });
      toast.success("수정되었어요");
      closeEditor();
      return;
    }

    if (editingField === "weight") {
      if (!isInRange(sheetData.weight, ONBOARDING_WEIGHT_RANGE.min, ONBOARDING_WEIGHT_RANGE.max)) {
        toast.warning("현재 몸무게를 다시 확인해주세요");
        return;
      }

      updateDraft({ weight: sheetData.weight });
      toast.success("수정되었어요");
      closeEditor();
      return;
    }

    if (editingField === "activity") {
      if (sheetData.activity === undefined) {
        toast.warning("활동량을 선택해주세요");
        return;
      }

      updateDraft({ activity: sheetData.activity });
      toast.success("수정되었어요");
      closeEditor();
      return;
    }

    if (editingField === "goal") {
      if (sheetData.goal === undefined) {
        toast.warning("목표를 선택해주세요");
        return;
      }

      updateDraft({ goal: sheetData.goal });
      toast.success("수정되었어요");
      closeEditor();
      return;
    }

    const nextDraft: GoalEditDraft = {
      ...draft,
      goalweight: sheetData.goalweight,
    };

    if (!isGoalWeightRangeValid(nextDraft)) {
      if (
        nextDraft.goal === 0 &&
        nextDraft.goalweight !== undefined &&
        nextDraft.weight !== undefined
      ) {
        toast.warning("다이어트 목표는 현재 몸무게보다 높게 설정할 수 없어요");
        return;
      }

      if (
        nextDraft.goal === 2 &&
        nextDraft.goalweight !== undefined &&
        nextDraft.weight !== undefined
      ) {
        toast.warning("근육 늘리기 목표는 현재 몸무게보다 높게 설정해야 해요");
        return;
      }

      toast.warning("목표 몸무게를 다시 확인해주세요");
      return;
    }

    updateDraft({ goalweight: sheetData.goalweight });
    toast.success("수정되었어요");
    closeEditor();
  };

  const canStartPlan = useMemo(() => {
    if (!draft) return false;
    return validateStartPlan(draft) === null;
  }, [draft]);

  const handleStartPlan = () => {
    if (!draft) return;

    const errorMessage = validateStartPlan(draft);
    if (errorMessage) {
      toast.warning(errorMessage);
      return;
    }

    setStage("targetCalories");
  };

  const handleGoNutrient = () => {
    if (!draft) return;

    if (draft.targetCalories === undefined || draft.targetCalories < GOAL_CALORIES_MIN) {
      toast.warning("목표 칼로리를 입력해주세요");
      return;
    }

    if (draft.targetCalories > GOAL_CALORIES_MAX) {
      toast.warning("목표 칼로리는 1~99999 사이로 입력해주세요");
      return;
    }

    setStage("nutrient");
  };

  const handleComplete = async () => {
    if (!draft || !initialDraft) {
      return;
    }

    const errorMessage = validateStartPlan(draft);
    if (errorMessage) {
      toast.warning(errorMessage);
      return;
    }

    if (draft.targetCalories === undefined) {
      toast.warning("목표 칼로리를 입력해주세요");
      return;
    }

    if (!hasNutrientTotal(draft)) {
      setIsNutrientTotalModalOpen(true);
      return;
    }

    const updateTasks: Array<() => Promise<ProfileResponseDto>> = [];

    if (draft.gender !== undefined && draft.gender !== initialDraft.gender) {
      updateTasks.push(() => updateGender(draft.gender!));
    }

    if (draft.birthYear !== undefined && draft.birthYear !== initialDraft.birthYear) {
      updateTasks.push(() => updateBirthYear(draft.birthYear!));
    }

    if (draft.height !== undefined && draft.height !== initialDraft.height) {
      updateTasks.push(() => updateHeight(draft.height!));
    }

    if (draft.weight !== undefined && draft.weight !== initialDraft.weight) {
      updateTasks.push(() => updateWeight(draft.weight!));
    }

    if (draft.activity !== undefined && draft.activity !== initialDraft.activity) {
      updateTasks.push(() => updateActivity(draft.activity!));
    }

    if (draft.goal !== undefined && draft.goal !== initialDraft.goal) {
      updateTasks.push(() => updateGoal(draft.goal!));
    }

    if (draft.goalweight !== undefined && draft.goalweight !== initialDraft.goalweight) {
      updateTasks.push(() => updateTargetWeight(draft.goalweight!));
    }

    if (
      draft.targetCalories !== undefined &&
      draft.targetCalories !== initialDraft.targetCalories
    ) {
      updateTasks.push(() => updateTargetCalories(draft.targetCalories!));
    }

    if (isRatioChanged(initialDraft, draft)) {
      updateTasks.push(() => updateTargetRatio([draft.carbs!, draft.protein!, draft.fat!]));
    }

    if (updateTasks.length === 0) {
      toast.show({ title: "변경된 내용이 없어요" });
      return;
    }

    try {
      setIsSubmitting(true);

      for (const updateTask of updateTasks) {
        await updateTask();
      }

      queryClient.setQueryData<ProfileResponseDto>(queryKeys.profile, (previous) => {
        if (!previous) {
          return previous;
        }

        return toUpdatedProfile(previous, draft);
      });

      setTargets({
        target_calories: draft.targetCalories!,
        target_ratio: [draft.carbs!, draft.protein!, draft.fat!],
      });
      setInitialDraft({ ...draft });

      toast.success("목표가 수정되었어요");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.warning("목표 수정에 실패했어요");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (stage === "summary") {
      navigate(-1);
      return;
    }

    if (stage === "targetCalories") {
      setStage("summary");
      return;
    }

    setStage("targetCalories");
  };

  const renderEditorBody = () => {
    if (!editingField) {
      return null;
    }

    if (editingField === "gender") {
      return <StepGender data={sheetData} update={updateSheetData} />;
    }

    if (editingField === "birthYear") {
      return <StepBirthYear data={sheetData} update={updateSheetData} />;
    }

    if (editingField === "height") {
      return (
        <section>
          <div className="onboarding-title">
            <h2 className="typo-title1">키가 몇인가요?</h2>
          </div>
          <Field.Root className="onboarding-field-padding">
            <div className="onboarding-goal-weight-card">
              <NumberInput
                value={sheetData.height}
                onChange={(value) => updateSheetData({ height: value })}
                placeholder="165"
                min={ONBOARDING_HEIGHT_RANGE.min}
                max={ONBOARDING_HEIGHT_RANGE.max}
                step={1}
                unit="cm"
                normalizeOnBlur={false}
              />
            </div>
          </Field.Root>
        </section>
      );
    }

    if (editingField === "weight") {
      return (
        <section>
          <div className="onboarding-title">
            <h2 className="typo-title1">현재 몸무게가 몇인가요?</h2>
          </div>
          <Field.Root className="onboarding-field-padding">
            <div className="onboarding-goal-weight-card">
              <NumberInput
                value={sheetData.weight}
                onChange={(value) => updateSheetData({ weight: value })}
                placeholder="55"
                min={ONBOARDING_WEIGHT_RANGE.min}
                max={ONBOARDING_WEIGHT_RANGE.max}
                step={0.1}
                unit="kg"
                normalizeOnBlur={false}
              />
            </div>
          </Field.Root>
        </section>
      );
    }

    if (editingField === "activity") {
      return <StepActivity data={sheetData} update={updateSheetData} />;
    }

    if (editingField === "goal") {
      return <StepGoal data={sheetData} update={updateSheetData} />;
    }

    return <StepGoalWeight data={sheetData} update={updateSheetData} />;
  };

  const isFooterDisabled = isSubmitting || (stage === "summary" && !canStartPlan);

  return (
    <div className={styles.page}>
      <PageHeader title="목표 재설정" onBack={handleBack} />

      <main className={styles.main}>
        {isPending && !draft && <p className={styles.loadingText}>불러오는 중...</p>}
        {!isPending && !draft && <p className={styles.loadingText}>프로필을 불러오지 못했어요</p>}

        {draft && stage === "summary" && (
          <section className={styles.summarySection}>
            {SUMMARY_FIELDS.map((field) => (
              <button
                key={field.id}
                type="button"
                className={styles.summaryItem}
                onClick={() => openEditor(field.id)}
              >
                <span className={`${styles.summaryLabel} typo-title3`}>{field.label}</span>
                <span className={styles.summaryValueRow}>
                  <span className={`${styles.summaryValue} typo-label6`}>
                    {getSummaryValue(field.id, draft)}
                  </span>
                  <ChevronRight className={styles.summaryChevron} size={24} />
                </span>
              </button>
            ))}
          </section>
        )}

        {draft && stage === "targetCalories" && (
          <section className={styles.stageSection}>
            <StepGoalCalories data={draft} update={updateDraft} />
          </section>
        )}

        {draft && stage === "nutrient" && (
          <section className={styles.stageSection}>
            <StepNutrient data={draft} update={updateDraft} />
          </section>
        )}
      </main>

      <footer className={styles.footer}>
        {stage === "summary" && (
          <Button
            onClick={handleStartPlan}
            disabled={isFooterDisabled}
            fullWidth
            variant="filled"
            size="large"
            state={isFooterDisabled ? "disabled" : "default"}
          >
            새로운 식단 계획 받기
          </Button>
        )}

        {stage === "targetCalories" && (
          <Button
            onClick={handleGoNutrient}
            disabled={isSubmitting}
            fullWidth
            variant="filled"
            size="large"
            state={isSubmitting ? "disabled" : "default"}
          >
            다음
          </Button>
        )}

        {stage === "nutrient" && (
          <Button
            onClick={handleComplete}
            disabled={isSubmitting}
            fullWidth
            variant="filled"
            size="large"
            state={isSubmitting ? "disabled" : "default"}
          >
            {isSubmitting ? "완료 중..." : "완료"}
          </Button>
        )}
      </footer>

      <BottomSheet isOpen={editingField !== null} onClose={closeEditor}>
        <div className={styles.sheetContent}>
          <div className={styles.sheetBody}>{renderEditorBody()}</div>
          <div className={styles.sheetActions}>
            <Button fullWidth onClick={applyEditor} variant="filled" size="large" color="primary">
              수정하기
            </Button>
          </div>
        </div>
      </BottomSheet>

      <CheckButtonModal
        open={isNutrientTotalModalOpen}
        onOpenChange={setIsNutrientTotalModalOpen}
        title="영양소 비율 확인"
        description="탄단지 비율의 합을 100으로 맞춰주세요"
      />
    </div>
  );
}
