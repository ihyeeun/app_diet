import { syncAppFeatureGuardEnabled } from "@/shared/api/bridge/nativeBridge";

export const FREE_USER_GUARD_ENABLED = true;

export const FEATURE_GUARD = {
  CHAT: "CHAT",
  MENU_BOARD_CAMERA: "MENU_BOARD_CAMERA",
  FOOD_CAMERA: "FOOD_CAMERA",
} as const;

export type FeatureGuardTarget = (typeof FEATURE_GUARD)[keyof typeof FEATURE_GUARD];

type FeatureGuardCopy = {
  title: string;
  description: string;
};

const BLOCKED_FEATURES = new Set<FeatureGuardTarget>([
  FEATURE_GUARD.CHAT,
  FEATURE_GUARD.MENU_BOARD_CAMERA,
  FEATURE_GUARD.FOOD_CAMERA,
]);

let freeUserGuardEnabledRuntime = FREE_USER_GUARD_ENABLED;
const featureGuardChangeListeners = new Set<(enabled: boolean) => void>();

const FEATURE_GUARD_COPY: Record<FeatureGuardTarget, FeatureGuardCopy> = {
  CHAT: {
    title: "AI 코치 기능이 잠겨 있어요",
    description: "현재는 이용할 수 없는 기능이에요.",
  },
  MENU_BOARD_CAMERA: {
    title: "메뉴판 촬영 기능이 잠겨 있어요",
    description: "현재는 이용할 수 없는 기능이에요.",
  },
  FOOD_CAMERA: {
    title: "식사 기록 카메라 기능이 잠겨 있어요",
    description: "현재는 이용할 수 없는 기능이에요.",
  },
};

export type FeatureBlockedLocationState = {
  blockedFeature?: FeatureGuardTarget;
};

export function isFeatureBlocked(feature: FeatureGuardTarget) {
  if (!freeUserGuardEnabledRuntime) return false;
  return BLOCKED_FEATURES.has(feature);
}

function syncFeatureGuardStateToApp() {
  syncAppFeatureGuardEnabled(freeUserGuardEnabledRuntime);
}

function emitFeatureGuardChange() {
  syncFeatureGuardStateToApp();
  featureGuardChangeListeners.forEach((listener) => {
    listener(freeUserGuardEnabledRuntime);
  });
}

export function isFreeUserGuardEnabled() {
  return freeUserGuardEnabledRuntime;
}

export function setFreeUserGuardEnabled(enabled: boolean) {
  if (freeUserGuardEnabledRuntime === enabled) return freeUserGuardEnabledRuntime;

  freeUserGuardEnabledRuntime = enabled;
  emitFeatureGuardChange();
  return freeUserGuardEnabledRuntime;
}

export function toggleFreeUserGuardEnabled() {
  return setFreeUserGuardEnabled(!freeUserGuardEnabledRuntime);
}

export function subscribeFeatureGuardChange(listener: (enabled: boolean) => void) {
  featureGuardChangeListeners.add(listener);
  return () => {
    featureGuardChangeListeners.delete(listener);
  };
}

export function getFeatureGuardCopy(feature: FeatureGuardTarget): FeatureGuardCopy {
  return FEATURE_GUARD_COPY[feature];
}

export function toFeatureBlockedLocationState(
  feature: FeatureGuardTarget,
): FeatureBlockedLocationState {
  return {
    blockedFeature: feature,
  };
}

export function getBlockedFeatureFromLocationState(state: unknown): FeatureGuardTarget | null {
  if (!state || typeof state !== "object") return null;

  const blockedFeature = (state as FeatureBlockedLocationState).blockedFeature;

  if (blockedFeature === FEATURE_GUARD.CHAT) return FEATURE_GUARD.CHAT;
  if (blockedFeature === FEATURE_GUARD.MENU_BOARD_CAMERA) return FEATURE_GUARD.MENU_BOARD_CAMERA;
  if (blockedFeature === FEATURE_GUARD.FOOD_CAMERA) return FEATURE_GUARD.FOOD_CAMERA;

  return null;
}

syncFeatureGuardStateToApp();
