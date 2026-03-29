import { useMemo, useState } from "react";
import { toast } from "@/shared/commons/toast/toast";
import type { MealMenuItem, MealServingInputMode } from "@/shared/api/types/api.dto";
import {
  SERVING_INPUT_STEP,
  buildScaledMenu,
  formatCompactDecimal,
  getServingDefaultValue,
  normalizeServingInput,
  parseMenuServing,
  resolveServingValues,
  sanitizeServingInput,
} from "../utils/mealRecordServing";

type OpenServingAmountSheetParams = {
  menu: MealMenuItem;
  selectedMenu?: MealMenuItem | null;
  initialMode?: MealServingInputMode;
};

type UseServingAmountSheetParams = {
  onSubmitMenu: (nextMenu: MealMenuItem) => boolean | void;
};

export function useServingAmountSheet({ onSubmitMenu }: UseServingAmountSheetParams) {
  const [isOpen, setIsOpen] = useState(false);
  const [menu, setMenu] = useState<MealMenuItem | null>(null);
  const [inputMode, setInputMode] = useState<MealServingInputMode>("unit");
  const [inputValue, setInputValue] = useState("");

  const serving = useMemo(() => (menu ? parseMenuServing(menu) : null), [menu]);

  const parsedInputValue = useMemo(() => {
    const parsedValue = Number(inputValue);
    if (!Number.isFinite(parsedValue)) {
      return null;
    }

    return parsedValue;
  }, [inputValue]);

  const previewMenu = useMemo(() => {
    if (!menu || !serving || parsedInputValue === null || parsedInputValue <= 0) {
      return menu;
    }

    const resolvedServing = resolveServingValues(serving, inputMode, parsedInputValue);
    if (!Number.isFinite(resolvedServing.scaleFactor) || resolvedServing.scaleFactor <= 0) {
      return menu;
    }

    return buildScaledMenu({
      menu,
      serving,
      resolved: resolvedServing,
      mode: inputMode,
      inputValue: parsedInputValue,
    });
  }, [inputMode, menu, parsedInputValue, serving]);

  const close = () => {
    setIsOpen(false);
    setMenu(null);
    setInputMode("unit");
    setInputValue("");
  };

  const open = ({ menu: nextMenu, selectedMenu, initialMode }: OpenServingAmountSheetParams) => {
    const nextInputMode = initialMode ?? selectedMenu?.serving_input_mode ?? "unit";
    const parsedServing = parseMenuServing(nextMenu);
    const initialInput =
      selectedMenu?.serving_input_value ?? getServingDefaultValue(parsedServing, nextInputMode);

    setMenu(nextMenu);
    setInputMode(nextInputMode);
    setInputValue(formatCompactDecimal(normalizeServingInput(initialInput)));
    setIsOpen(true);
  };

  const onModeChange = (nextMode: MealServingInputMode) => {
    if (!serving || nextMode === inputMode) {
      return;
    }

    setInputMode(nextMode);

    const parsedCurrentValue = Number(inputValue);
    if (!Number.isFinite(parsedCurrentValue) || parsedCurrentValue <= 0) {
      const fallbackValue = getServingDefaultValue(serving, nextMode);
      setInputValue(formatCompactDecimal(normalizeServingInput(fallbackValue)));
      return;
    }

    const resolvedCurrent = resolveServingValues(serving, inputMode, parsedCurrentValue);
    if (!Number.isFinite(resolvedCurrent.scaleFactor) || resolvedCurrent.scaleFactor <= 0) {
      const fallbackValue = getServingDefaultValue(serving, nextMode);
      setInputValue(formatCompactDecimal(normalizeServingInput(fallbackValue)));
      return;
    }

    const convertedValue =
      nextMode === "weight" ? resolvedCurrent.totalWeight : resolvedCurrent.unitCount;
    setInputValue(formatCompactDecimal(normalizeServingInput(convertedValue)));
  };

  const onInputStep = (delta: number) => {
    if (!serving) {
      return;
    }

    const currentValue = Number(inputValue);
    const baseValue = Number.isFinite(currentValue)
      ? currentValue
      : getServingDefaultValue(serving, inputMode);
    const nextValue = normalizeServingInput(baseValue + delta);

    setInputValue(formatCompactDecimal(nextValue));
  };

  const onInputChange = (nextValue: string) => {
    setInputValue(sanitizeServingInput(nextValue));
  };

  const onInputBlur = () => {
    if (!serving) {
      setInputValue("");
      return;
    }

    const trimmedValue = inputValue.trim();

    if (!trimmedValue || trimmedValue === ".") {
      setInputValue(
        formatCompactDecimal(normalizeServingInput(getServingDefaultValue(serving, inputMode))),
      );
      return;
    }

    const parsedValue = Number(trimmedValue);
    if (!Number.isFinite(parsedValue)) {
      setInputValue(
        formatCompactDecimal(normalizeServingInput(getServingDefaultValue(serving, inputMode))),
      );
      return;
    }

    setInputValue(formatCompactDecimal(normalizeServingInput(parsedValue)));
  };

  const submit = () => {
    if (!menu || !serving) {
      return;
    }

    const nextInputValue = Number(inputValue);
    if (!Number.isFinite(nextInputValue) || nextInputValue <= 0) {
      toast.warning("입력값을 다시 확인해주세요");
      return;
    }

    const normalizedInput = normalizeServingInput(nextInputValue);
    setInputValue(formatCompactDecimal(normalizedInput));
    const resolvedServing = resolveServingValues(serving, inputMode, normalizedInput);
    if (!Number.isFinite(resolvedServing.scaleFactor) || resolvedServing.scaleFactor <= 0) {
      toast.warning("입력값을 다시 확인해주세요");
      return;
    }

    const nextMenu = buildScaledMenu({
      menu,
      serving,
      resolved: resolvedServing,
      mode: inputMode,
      inputValue: normalizedInput,
    });

    const submitResult = onSubmitMenu(nextMenu);
    if (submitResult === false) {
      return;
    }

    close();
  };

  return {
    isOpen,
    menu,
    serving,
    previewMenu,
    inputMode,
    inputValue,
    open,
    close,
    onModeChange,
    onInputChange,
    onInputBlur,
    onDecrease: () => onInputStep(-SERVING_INPUT_STEP),
    onIncrease: () => onInputStep(SERVING_INPUT_STEP),
    onSubmit: submit,
  };
}
