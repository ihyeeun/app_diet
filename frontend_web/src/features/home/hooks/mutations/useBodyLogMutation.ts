import { useMutation, useQueryClient } from "@tanstack/react-query";

import { registerStep, registerWeight } from "@/features/home/api/health";
import { queryKeys } from "@/features/home/hooks/queries/queryKey";
import type { WeightStepsResponseDto } from "@/shared/api/types/api.dto";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";

export function useRegisterWeightMutation(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, weight }: { date: string; weight: number }) =>
      registerWeight({ date, weight }),
    onSuccess: (_data, { date, weight }) => {
      queryClient.setQueryData<WeightStepsResponseDto>(queryKeys.bodyStats(date), (previous) => ({
        weight,
        steps: previous?.steps ?? 0,
      }));
      callbacks?.onSuccess?.();
    },
    onError: (error) => callbacks?.onError?.(error),
  });
}

export function useRegisterStepsMutation(callbacks?: UseMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ date, steps }: { date: string; steps: number }) => registerStep({ date, steps }),
    onSuccess: (_data, { date, steps }) => {
      queryClient.setQueryData<WeightStepsResponseDto>(queryKeys.bodyStats(date), (previous) => ({
        weight: previous?.weight ?? 0,
        steps,
      }));
      callbacks?.onSuccess?.();
    },
    onError: (error) => callbacks?.onError?.(error),
  });
}
