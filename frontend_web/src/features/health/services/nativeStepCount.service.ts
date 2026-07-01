import {
  isNativeApp,
  readNativeStepCountRecords as readNativeStepCountRecordsFromApp,
  requestNativeHealthPermissionStatus,
  requestNativeHealthReadPermission,
} from "@/shared/api/bridge/nativeBridge";
import type {
  HealthConnectionSource,
  HealthPermissionStatus,
} from "@/shared/api/bridge/nativeBridge.types";
import { isValidDateKey } from "@/shared/utils/dateFormat";

const MAX_STEPS = 999999;

export type NativeStepCountRecord = {
  date: string;
  source: Exclude<HealthConnectionSource, null>;
  steps: number;
};

export type NativeStepCountRecordsResult = {
  permissionStatus: HealthPermissionStatus | null;
  readAt?: string;
  records: NativeStepCountRecord[];
  source: HealthConnectionSource;
};

export type NativeStepCountResult = {
  permissionStatus: HealthPermissionStatus | null;
  readAt?: string;
  source: HealthConnectionSource;
  steps: number | null;
};

type ReadNativeStepCountOptions = {
  shouldRequestPermission?: boolean;
};

export function canUseNativeStepCount(startDate: string, endDate: string, enabled = true) {
  return enabled && isNativeApp() && isValidDateKey(startDate) && isValidDateKey(endDate);
}

function normalizeStepCount(steps: number) {
  return Math.min(MAX_STEPS, Math.max(0, Math.trunc(steps)));
}

function canReadNativeStepCount(
  permissionStatus: HealthPermissionStatus | null,
  source: HealthConnectionSource,
) {
  if (source === "health_connect") return permissionStatus === "granted";
  if (source === "apple_health") return true;

  return permissionStatus === "granted";
}

async function resolveNativeStepCountPermission({
  shouldRequestPermission = false,
}: ReadNativeStepCountOptions = {}) {
  const currentPermission = await requestNativeHealthPermissionStatus();

  if (!shouldRequestPermission || currentPermission.permissionStatus === "granted") {
    return currentPermission;
  }

  return requestNativeHealthReadPermission();
}

export async function readNativeStepCountRecordsRange(
  startDate: string,
  endDate: string,
  options?: ReadNativeStepCountOptions,
): Promise<NativeStepCountRecordsResult> {
  let permissionStatus: HealthPermissionStatus | null = null;
  let source: HealthConnectionSource = null;

  try {
    const permission = await resolveNativeStepCountPermission(options);
    permissionStatus = permission.permissionStatus;
    source = permission.source;
  } catch {
    return {
      permissionStatus,
      records: [],
      source,
    };
  }

  if (!canReadNativeStepCount(permissionStatus, source)) {
    return {
      permissionStatus,
      records: [],
      source,
    };
  }

  try {
    const result = await readNativeStepCountRecordsFromApp({
      startDate,
      endDate,
    });
    const records = result.records.map((record) => ({
      ...record,
      steps: normalizeStepCount(record.steps),
    }));

    return {
      permissionStatus,
      readAt: result.readAt,
      records,
      source: records[0]?.source ?? source,
    };
  } catch {
    return {
      permissionStatus,
      records: [],
      source,
    };
  }
}

export async function readNativeStepCount(
  date: string,
  options?: ReadNativeStepCountOptions,
): Promise<NativeStepCountResult> {
  const result = await readNativeStepCountRecordsRange(date, date, options);
  const record = result.records.find((item) => item.date === date);

  return {
    permissionStatus: result.permissionStatus,
    readAt: result.readAt,
    source: record?.source ?? result.source,
    steps: record ? record.steps : null,
  };
}
