import type { NavigateFunction, NavigateOptions, To } from "react-router-dom";

export function canGoBackWithLocalHistory() {
  if (typeof window === "undefined") return false;

  const historyState = window.history.state as { idx?: number } | null;
  return typeof historyState?.idx === "number" && historyState.idx > 0;
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

  navigate(fallbackTo, {
    replace: true,
    ...fallbackOptions,
  });
}
