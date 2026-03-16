import {
  fetchRecommendtargetCalories,
  postRecommendNutrient,
} from "@/features/onboarding/api/recommend";
import type { UseMutationCallback } from "@/shared/api/types/callback.types";
import { useMutation } from "@tanstack/react-query";

export function useTargetCaloriesMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: fetchRecommendtargetCalories,
    onSuccess: (data) => {
      return data;
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}

export function useRecommendNutrientMutation(callbacks?: UseMutationCallback) {
  return useMutation({
    mutationFn: postRecommendNutrient,
    onSuccess: (data) => {
      return data;
    },
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  });
}
