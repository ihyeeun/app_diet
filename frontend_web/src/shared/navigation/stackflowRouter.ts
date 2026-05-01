import { historySyncPlugin } from "@stackflow/plugin-history-sync";
import { stackflow } from "@stackflow/react";
import {
  createPath,
  type Path,
  type To,
  UNSAFE_createBrowserHistory,
} from "react-router-dom";

import { PATH } from "@/router/path";

const STACKFLOW_STATE_TAG = "@stackflow/plugin-history-sync";
const STACKFLOW_USER_STATE_KEY = "__stackflowNavigationState";

function EmptyActivity() {
  return null;
}

const ACTIVITY_ROUTES = {
  Root: PATH.ROOT,
  Home: PATH.HOME,
  TodayMealScore: PATH.TODAY_MEAL_SCORE,
  Onboarding: PATH.ONBOARDING,
  Recommend: PATH.RECOMMEND,
  Profile: PATH.PROFILE,
  Settings: PATH.SETTINGS,
  SettingsFeedback: PATH.SETTINGS_FEEDBACK,
  SettingsSubCode: PATH.SETTINGS_SUB_CODE,
  Terms: PATH.TERMS,
  MealRecord: PATH.MEAL_RECORD,
  MealRecordAddSearch: PATH.MEAL_RECORD_ADD_SEARCH,
  MealDetail: PATH.MEAL_DETAIL,
  MenuBoardCamera: PATH.MENU_BOARD_CAMERA,
  FoodCamera: PATH.FOOD_CAMERA,
  NutrientAdd: PATH.NUTRIENT_ADD,
  NutrientCamera: PATH.NUTRIENT_CAMERA,
  NutrientAddRegister: PATH.NUTRIENT_ADD_REGISTER,
  NutrientAddModify: PATH.NUTRIENT_ADD_MODIFY,
  BrandSearch: PATH.BRAND_SEARCH,
  Chat: PATH.CHAT,
  RecommendResult: PATH.RECOMMEND_RESULT,
  RecommendDetail: PATH.RECOMMEND_DETAIL,
  Diary: PATH.DIARY,
  GoalEdit: PATH.GOAL_EDIT,
  GoalEditTargetCalories: PATH.GOAL_EDIT_TARGET_CALORIES,
  GoalEditNutrient: PATH.GOAL_EDIT_NUTRIENT,
  AccountDelete: "/account-delete",
} as const;

type ActivityName = keyof typeof ACTIVITY_ROUTES;
type ActivityParams = Record<string, string>;

type StackflowTaggedState = {
  _TAG: string;
  flattedState: string;
};

type PendingNavigationMethod = "push" | "replace";

type PendingNavigationEntry = {
  method: PendingNavigationMethod;
  state: unknown;
};

const appHistory = UNSAFE_createBrowserHistory({ v5Compat: true });
const sourceHistoryListeners = new Set<Parameters<typeof appHistory.listen>[0]>();

appHistory.listen((update) => {
  sourceHistoryListeners.forEach((listener) => {
    listener(update);
  });
});

appHistory.listen = (listener) => {
  sourceHistoryListeners.add(listener);
  return () => {
    sourceHistoryListeners.delete(listener);
  };
};

let isStackflowReady = false;
const pendingNavigationQueue: PendingNavigationEntry[] = [];
let shouldBypassInterception = false;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStackflowTaggedState(value: unknown): value is StackflowTaggedState {
  return (
    isRecord(value) &&
    typeof value._TAG === "string" &&
    value._TAG === STACKFLOW_STATE_TAG &&
    typeof value.flattedState === "string"
  );
}

function enqueuePendingNavigationState(method: PendingNavigationMethod, state: unknown) {
  pendingNavigationQueue.push({ method, state });
}

function dequeuePendingNavigationState(method: PendingNavigationMethod): unknown {
  const index = pendingNavigationQueue.findIndex((entry) => entry.method === method);
  if (index < 0) return undefined;

  const [entry] = pendingNavigationQueue.splice(index, 1);
  return entry?.state;
}

function mergeTaggedStateWithNavigationState(
  taggedState: StackflowTaggedState,
  pendingState: unknown,
) {
  if (pendingState === undefined) {
    return taggedState;
  }

  if (isRecord(pendingState)) {
    return {
      ...pendingState,
      ...taggedState,
    };
  }

  return {
    ...taggedState,
    [STACKFLOW_USER_STATE_KEY]: pendingState,
  };
}

function normalizePathname(pathname: string) {
  if (pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

function toPathString(to: To) {
  if (typeof to === "string") return to;
  return createPath(to as Partial<Path>);
}

function resolveActivityForPath(to: To): { activityName: ActivityName; params: ActivityParams } | null {
  const rawPath = toPathString(to);
  let url: URL;
  try {
    url = new URL(rawPath, window.location.origin);
  } catch {
    return null;
  }

  const pathname = normalizePathname(url.pathname);
  const activityName = (Object.entries(ACTIVITY_ROUTES) as Array<[ActivityName, string]>).find(
    ([, routePath]) => normalizePathname(routePath) === pathname,
  )?.[0];
  if (!activityName) return null;

  return {
    activityName,
    params: Object.fromEntries(url.searchParams.entries()),
  };
}

const originalPush = appHistory.push.bind(appHistory);
const originalReplace = appHistory.replace.bind(appHistory);

const { Stack: InternalStackflowStack, actions: stackflowActions } = stackflow({
  transitionDuration: 270,
  activities: {
    Root: EmptyActivity,
    Home: EmptyActivity,
    TodayMealScore: EmptyActivity,
    Onboarding: EmptyActivity,
    Recommend: EmptyActivity,
    Profile: EmptyActivity,
    Settings: EmptyActivity,
    SettingsFeedback: EmptyActivity,
    SettingsSubCode: EmptyActivity,
    Terms: EmptyActivity,
    MealRecord: EmptyActivity,
    MealRecordAddSearch: EmptyActivity,
    MealDetail: EmptyActivity,
    MenuBoardCamera: EmptyActivity,
    FoodCamera: EmptyActivity,
    NutrientAdd: EmptyActivity,
    NutrientCamera: EmptyActivity,
    NutrientAddRegister: EmptyActivity,
    NutrientAddModify: EmptyActivity,
    BrandSearch: EmptyActivity,
    Chat: EmptyActivity,
    RecommendResult: EmptyActivity,
    RecommendDetail: EmptyActivity,
    Diary: EmptyActivity,
    GoalEdit: EmptyActivity,
    GoalEditTargetCalories: EmptyActivity,
    GoalEditNutrient: EmptyActivity,
    AccountDelete: EmptyActivity,
  },
  plugins: [
    historySyncPlugin({
      routes: ACTIVITY_ROUTES,
      fallbackActivity: () => "Home",
      history: appHistory as unknown as Parameters<typeof historySyncPlugin>[0]["history"],
    }),
    () => ({
      key: "stackflow-ready-bridge",
      render() {
        return null;
      },
      onInit() {
        isStackflowReady = true;
      },
    }),
  ],
});

appHistory.push = (to: To, state?: unknown) => {
  if (shouldBypassInterception) {
    originalPush(to, state);
    return;
  }

  if (isStackflowTaggedState(state)) {
    const pendingState = dequeuePendingNavigationState("push");
    originalPush(to, mergeTaggedStateWithNavigationState(state, pendingState));
    return;
  }

  const resolved = resolveActivityForPath(to);
  if (!resolved || !isStackflowReady) {
    originalPush(to, state);
    return;
  }

  enqueuePendingNavigationState("push", state);
  stackflowActions.push(resolved.activityName, resolved.params);
};

appHistory.replace = (to: To, state?: unknown) => {
  if (shouldBypassInterception) {
    originalReplace(to, state);
    return;
  }

  if (isStackflowTaggedState(state)) {
    const pendingState = dequeuePendingNavigationState("replace");
    originalReplace(to, mergeTaggedStateWithNavigationState(state, pendingState));
    return;
  }

  const resolved = resolveActivityForPath(to);
  if (!resolved || !isStackflowReady) {
    originalReplace(to, state);
    return;
  }

  enqueuePendingNavigationState("replace", state);
  stackflowActions.replace(resolved.activityName, resolved.params);
};

export function bypassStackflowInterception<T>(callback: () => T): T {
  shouldBypassInterception = true;
  try {
    return callback();
  } finally {
    shouldBypassInterception = false;
  }
}

export { appHistory };

export function getStackflowStackComponent() {
  return InternalStackflowStack;
}
