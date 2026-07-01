import { useEffect, useState } from "react";

import {
  canUseNativeStepCount,
  readNativeStepCount,
} from "@/features/health/services/nativeStepCount.service";
import { useRegisterStepsMutation } from "@/features/home/hooks/mutations/useBodyLogMutation";

const nativeStepSyncCompletedDates = new Set<string>();
const nativeStepSyncingDates = new Set<string>();

type NativeStepReadState = {
  date: string;
  steps: number;
};

type UseSyncNativeStepCountOptions = {
  enabled?: boolean;
  savedSteps?: number | null;
};

export function useSyncNativeStepCount(
  date: string,
  { enabled = true, savedSteps }: UseSyncNativeStepCountOptions = {},
) {
  const canSyncNativeSteps = canUseNativeStepCount(date, date, enabled);
  const [readState, setReadState] = useState<NativeStepReadState | null>(null);
  const { mutateAsync: registerNativeSteps } = useRegisterStepsMutation();

  useEffect(() => {
    if (!canSyncNativeSteps) return;
    if (nativeStepSyncCompletedDates.has(date) || nativeStepSyncingDates.has(date)) return;

    const syncNativeStepCount = async () => {
      nativeStepSyncingDates.add(date);

      try {
        const result = await readNativeStepCount(date, {
          shouldRequestPermission: true,
        });

        if (result.steps === null) {
          return;
        }

        setReadState({
          date,
          steps: result.steps,
        });

        if (savedSteps === result.steps) {
          return;
        }

        await registerNativeSteps({
          date,
          steps: result.steps,
        });
      } catch {
        // 자동 동기화 실패는 화면 진입을 막지 않고, 사용자는 직접 걸음 수를 입력할 수 있다.
      } finally {
        nativeStepSyncingDates.delete(date);
        nativeStepSyncCompletedDates.add(date);
      }
    };

    void syncNativeStepCount();
  }, [canSyncNativeSteps, date, registerNativeSteps, savedSteps]);

  return {
    hasReadNativeSteps: readState?.date === date,
    nativeSteps: readState?.date === date ? readState.steps : null,
  };
}
