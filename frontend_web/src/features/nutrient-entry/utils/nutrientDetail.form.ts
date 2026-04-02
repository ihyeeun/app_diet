// import {
//   DEFAULT_SERVING_UNIT,
//   INITIAL_FORM,
//   MAX_NUTRIENT_VALUE,
//   MENU_UNIT_TEXT_REGEX,
//   MIN_NUTRIENT_VALUE,
//   NUTRIENT_CHILD_RULES,
//   NUTRIENT_FORM_KEYS,
// } from "@/features/nutrient-entry/constants/nutrientDetail.constants";
// import type {
//   NutrientDetailForm,
//   NutrientDetailFormFieldKey,
// } from "@/features/nutrient-entry/types/nutrientDetail.form";
// import type { NutrientModeType } from "@/features/nutrient-entry/types/nutrientEntry.state";
// import { type MealMenuItem, MENU_UNIT, type NutrientServingUnit } from "@/shared/api/types/api.dto";

// type NutrientEntryMode = "register" | "modify";

// const MODE_ALIAS_MAP: Record<string, NutrientEntryMode> = {
//   register: "register",
//   create: "register",
//   modify: "modify",
//   edit: "modify",
//   update: "modify",
// };

// export function sanitizeDecimalInput(value: string) {
//   const numericOnly = value.replace(/[^0-9.]/g, "");
//   const [integerPart, ...decimalParts] = numericOnly.split(".");

//   if (decimalParts.length === 0) {
//     return integerPart;
//   }

//   return `${integerPart}.${decimalParts.join("").slice(0, 1)}`;
// }

// export function normalizeDecimalInput(value: string) {
//   const trimmed = value.trim();

//   if (!trimmed || trimmed === ".") {
//     return "";
//   }

//   const parsed = Number(trimmed);
//   if (Number.isNaN(parsed)) {
//     return "";
//   }

//   const clamped = Math.min(MAX_NUTRIENT_VALUE, Math.max(MIN_NUTRIENT_VALUE, parsed));
//   return clamped.toFixed(1);
// }

// export function toNumber(value: string) {
//   const parsed = Number(value);
//   if (!Number.isFinite(parsed)) {
//     return 0;
//   }

//   return parsed;
// }

// export function toNullableNumber(value: string) {
//   const trimmed = value.trim();
//   if (!trimmed || trimmed === ".") {
//     return null;
//   }

//   const parsed = Number(trimmed);
//   if (!Number.isFinite(parsed)) {
//     return null;
//   }

//   return parsed;
// }

// export function toMenuId(value: unknown) {
//   if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
//     return null;
//   }

//   return value;
// }

// function parseMenuTextWeight(unitQuantity?: string) {
//   if (typeof unitQuantity !== "string") {
//     return null;
//   }

//   const matched = unitQuantity.match(MENU_UNIT_TEXT_REGEX);
//   if (!matched) {
//     return null;
//   }

//   const parsed = Number(matched[1]);
//   if (!Number.isFinite(parsed) || parsed <= 0) {
//     return null;
//   }

//   return parsed;
// }

// function toFormNumberString(value: number | null | undefined) {
//   if (typeof value !== "number" || !Number.isFinite(value)) {
//     return "";
//   }

//   return normalizeDecimalInput(String(value));
// }

// export function normalizeNutrientFormValues(form: NutrientDetailForm): NutrientDetailForm {
//   const nextForm = { ...form };

//   NUTRIENT_FORM_KEYS.forEach((key) => {
//     nextForm[key] = normalizeDecimalInput(form[key]);
//   });

//   return nextForm;
// }

// export function formatCompactDecimal(value: number) {
//   const rounded = Math.round(value * 10) / 10;
//   return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
// }

// export function buildServingLabel(weight: string, unit: NutrientServingUnit) {
//   const normalizedWeight = normalizeDecimalInput(weight);
//   if (!normalizedWeight) {
//     return "총 용량";
//   }

//   const numericWeight = Number(normalizedWeight);
//   if (!Number.isFinite(numericWeight) || numericWeight <= 0) {
//     return "총 용량";
//   }

//   return `총 용량  ${formatCompactDecimal(numericWeight)}${unit}`;
// }

// export function resolveEntryMode(modeType: NutrientModeType | undefined, menuId: number | null) {
//   const normalizedMode = typeof modeType === "string" ? modeType.trim().toLowerCase() : "";
//   const resolvedByAlias = MODE_ALIAS_MAP[normalizedMode];
//   if (resolvedByAlias) {
//     return resolvedByAlias;
//   }

//   return menuId !== null ? "modify" : "register";
// }

// export function resolveServingUnit({
//   servingUnit,
//   menu,
// }: {
//   servingUnit?: NutrientServingUnit;
//   menu?: MealMenuItem;
// }): NutrientServingUnit {
//   if (servingUnit === "ml" || servingUnit === "g") {
//     return servingUnit;
//   }

//   return menu?.unit === MENU_UNIT.MILLILITER ? "ml" : DEFAULT_SERVING_UNIT;
// }

// export function buildInitialForm(menu?: MealMenuItem): NutrientDetailForm {
//   if (!menu) {
//     return { ...INITIAL_FORM };
//   }

//   const fallbackWeight = parseMenuTextWeight(menu.unit_quantity);
//   const resolvedWeight =
//     typeof menu.weight === "number" && Number.isFinite(menu.weight) ? menu.weight : fallbackWeight;

//   return {
//     calories: toFormNumberString(menu.calories),
//     carbs: toFormNumberString(menu.carbs),
//     protein: toFormNumberString(menu.protein),
//     fat: toFormNumberString(menu.fat),
//     weight: toFormNumberString(resolvedWeight),
//     sugars: toFormNumberString(menu.sugars),
//     sugar_alchol: toFormNumberString(menu.sugar_alchol),
//     dietary_fiber: toFormNumberString(menu.dietary_fiber),
//     trans_fat: toFormNumberString(menu.trans_fat),
//     sat_fat: toFormNumberString(menu.sat_fat),
//     un_sat_fat: toFormNumberString(menu.un_sat_fat),
//     cholesterol: toFormNumberString(menu.cholesterol),
//     sodium: toFormNumberString(menu.sodium),
//     caffeine: toFormNumberString(menu.caffeine),
//     potassium: toFormNumberString(menu.potassium),
//     alcohol: toFormNumberString(menu.alcohol),
//   };
// }

// export function hasChildNutrientOverflow(form: NutrientDetailForm) {
//   return NUTRIENT_CHILD_RULES.some((rule) => {
//     const parentValue = toNumber(form[rule.parent]);
//     const childrenSum = rule.children.reduce((sum, key) => sum + toNumber(form[key]), 0);
//     return childrenSum > parentValue + 1e-9;
//   });
// }

// export function updateSteppedInputValue(
//   key: NutrientDetailFormFieldKey,
//   form: NutrientDetailForm,
//   delta: number,
// ) {
//   const parsedCurrentValue = Number(form[key]);
//   const baseValue = Number.isFinite(parsedCurrentValue) ? parsedCurrentValue : MIN_NUTRIENT_VALUE;
//   const steppedValue = baseValue + delta;
//   const clampedValue = Math.min(MAX_NUTRIENT_VALUE, Math.max(MIN_NUTRIENT_VALUE, steppedValue));

//   return normalizeDecimalInput(String(clampedValue));
// }
