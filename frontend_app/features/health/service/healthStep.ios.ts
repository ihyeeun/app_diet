import {
  HealthPermissionStatus,
  HealthStepCountRecord,
  HealthStepsRequestPayload,
} from "@/features/health/types/healthSteps.types";
import {
  AuthorizationStatus,
  authorizationStatusFor,
  isHealthDataAvailable,
  queryStatisticsCollectionForQuantity,
  requestAuthorization,
} from "@kingstinct/react-native-healthkit";

const STEP_COUNT_TYPE = "HKQuantityTypeIdentifierStepCount" as const;
const APPLE_HEALTH_SOURCE = "apple_health" as const;

function mapIosPermissionStatus(status: AuthorizationStatus): HealthPermissionStatus {
  if (status === AuthorizationStatus.sharingAuthorized) return "granted";
  if (status === AuthorizationStatus.sharingDenied) return "denied";
  if (status === AuthorizationStatus.notDetermined) return "not_determined";
  return "unknown";
}

export async function getIosHealthPermissionStatus() {
  const isAvailable = isHealthDataAvailable();

  if (!isAvailable) {
    return {
      permissionStatus: "unknown",
      source: APPLE_HEALTH_SOURCE,
    };
  }

  return {
    permissionStatus: mapIosPermissionStatus(authorizationStatusFor(STEP_COUNT_TYPE)),
    source: APPLE_HEALTH_SOURCE,
  };
}

export async function requestIosHealthReadPermission() {
  await requestAuthorization({
    toRead: [STEP_COUNT_TYPE],
  });

  return getIosHealthPermissionStatus();
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function readIosStepCountRecords(payload: HealthStepsRequestPayload) {
  const permission = await getIosHealthPermissionStatus();

  if (permission.permissionStatus !== "granted") {
    return {
      records: [] as HealthStepCountRecord[],
      readAt: new Date().toISOString(),
    };
  }

  const startDate = parseDateKey(payload.startDate);
  const endDateExclusive = addDays(parseDateKey(payload.endDate), 1);

  const statistics = await queryStatisticsCollectionForQuantity(
    STEP_COUNT_TYPE,
    ["cumulativeSum"],
    startDate,
    { day: 1 },
    {
      unit: "count",
      filter: {
        date: {
          startDate,
          endDate: endDateExclusive,
          strictStartDate: true,
          strictEndDate: true,
        },
      },
    },
  );

  const records: HealthStepCountRecord[] = statistics.map((item) => ({
    date: formatDateKey(item.startDate ?? startDate),
    steps: Math.trunc(item.sumQuantity?.quantity ?? 0),
    source: APPLE_HEALTH_SOURCE,
  }));

  return {
    records,
  };
}
