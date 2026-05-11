import type { NavigateFunction, NavigateOptions, To } from "./stackflowNavigation";
import { canGoBackWithStack, navigateBack } from "./stackflowNavigation";

export function canGoBackWithLocalHistory() {
  return canGoBackWithStack();
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

  navigateBack({
    fallbackOptions,
    fallbackTo,
  });
}
