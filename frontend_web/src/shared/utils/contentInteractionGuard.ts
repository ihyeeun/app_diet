function isEditableTarget(target: EventTarget | null) {
  const element =
    target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null;

  if (!element) {
    return false;
  }

  return (
    !!element.closest("input, textarea, select") ||
    (element instanceof HTMLElement && element.isContentEditable)
  );
}

function preventOutsideEditable(event: Event) {
  if (isEditableTarget(event.target)) {
    return;
  }

  event.preventDefault();
}

export const initContentInteractionGuard = () => {
  document.addEventListener("copy", preventOutsideEditable, true);
  document.addEventListener("cut", preventOutsideEditable, true);
  document.addEventListener("contextmenu", preventOutsideEditable, true);
  document.addEventListener("dragstart", preventOutsideEditable, true);
  document.addEventListener("selectstart", preventOutsideEditable, true);

  return () => {
    document.removeEventListener("copy", preventOutsideEditable, true);
    document.removeEventListener("cut", preventOutsideEditable, true);
    document.removeEventListener("contextmenu", preventOutsideEditable, true);
    document.removeEventListener("dragstart", preventOutsideEditable, true);
    document.removeEventListener("selectstart", preventOutsideEditable, true);
  };
};
