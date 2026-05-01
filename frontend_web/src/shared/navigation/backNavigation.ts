import type { NavigateFunction, NavigateOptions, To } from "react-router-dom";

import { isNativeApp, requestAppBack } from "@/shared/api/bridge/nativeBridge";

export function canGoBackWithLocalHistory() {
  if (typeof window === "undefined") return false;

  const historyState = window.history.state as { idx?: number } | null;
  if (typeof historyState?.idx === "number" && historyState.idx > 0) {
    return true;
  }

  return window.history.length > 1;
}

export function navigateBackOrFallback(
  navigate: NavigateFunction,
  fallbackTo: To,
  fallbackOptions?: NavigateOptions,
) {
  if (canGoBackWithLocalHistory()) {
    navigate(-1);
    return;
  }

  if (isNativeApp()) {
    requestAppBack();
    return;
  }

  navigate(fallbackTo, {
    ...fallbackOptions,
    replace: true,
  });
}
