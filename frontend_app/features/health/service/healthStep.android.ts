// frontend_app/features/health/service/healthStep.android.ts

import { BridgeHandledError } from "@/src/shared/api/bridge/bridgeError";
import type {
  HealthStepCountRecord,
  HealthStepsRequestPayload,
} from "@/features/health/types/healthSteps.types";

export async function getAndroidHealthPermissionStatus() {
  return {
    permissionStatus: "unknown" as const,
    source: "health_connect" as const,
  };
}

export async function requestAndroidHealthReadPermission() {
  return {
    permissionStatus: "unknown" as const,
    source: "health_connect" as const,
  };
}

export async function readAndroidStepCountRecords(_payload: HealthStepsRequestPayload) {
  throw new BridgeHandledError(
    "Android 걸음 수 연동은 아직 준비되지 않았어요",
    400,
    "HEALTH_STEPS_ANDROID_NOT_IMPLEMENTED",
  );
}
