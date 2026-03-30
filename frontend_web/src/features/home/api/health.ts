import { appApiData } from "@/shared/api/appApi";
import type { DateRequestDto, WeightStepsResponseDto } from "@/shared/api/types/api.dto";

const END_POINT = {
  BODY_STATS: "/home/weightSteps",
  REGISTER_WEIGHT: "/home/registerWeight",
  REGISTER_STEPS: "/home/registerSteps",
};

export async function getBodyStats(date: DateRequestDto) {
  const response = await appApiData<WeightStepsResponseDto>({
    method: "POST",
    endpoint: END_POINT.BODY_STATS,
    body: date,
  });

  return response;
}

export async function registerWeight({ date, weight }: { date: string; weight: number }) {
  await appApiData({
    method: "POST",
    endpoint: END_POINT.REGISTER_WEIGHT,
    body: {
      date,
      weight,
    },
  });
}

export async function registerStep({ date, steps }: { date: string; steps: number }) {
  await appApiData({
    method: "POST",
    endpoint: END_POINT.REGISTER_STEPS,
    body: {
      date,
      steps,
    },
  });
}
