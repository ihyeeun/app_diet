import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/commons/button/Button";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { MealMenuCard } from "@/shared/commons/card/MealMenuCard";
import { SearchInputHeader } from "@/shared/commons/header/SearchInputHeader";
import { toast } from "@/shared/commons/toast/toast";
import { PATH } from "@/router/path";
import type { NutritionEntryContextState } from "@/features/nutrition-entry/nutritionEntry.types";
import { MAX_MEAL_RECORD_MENUS } from "./constants/menu.constants";
import { MealRecordFloatingCameraButton } from "./components/MealRecordFloatingCameraButton";
import { ServingAmountSheetContent } from "./components/ServingAmountSheetContent";
import { BrandRequestSheetContent } from "./components/BrandRequestSheetContent";
import { postMealRecordBrandRequest } from "./api/brandRequest";
import type {
  MealMenuItem,
  MealRecordLocationState,
  MealServingInputMode,
} from "./types/mealRecord.types";
import {
  getMealRecordAddPath,
  getMealRecordAddSearchDetailPath,
  getMealRecordPath,
} from "./utils/mealRecord.paths";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";
import {
  SERVING_INPUT_STEP,
  buildScaledMenu,
  formatCompactDecimal,
  getServingDefaultValue,
  normalizeServingInput,
  parseMenuServing,
  resolveServingValues,
  sanitizeServingInput,
} from "./utils/mealRecordServing";
import { SEARCH_MENU_ITEMS } from "./utils/mealRecord.mockData";
import styles from "./styles/MealRecordSearchPage.module.css";

type MealRecordSearchDetailNavigationState = NutritionEntryContextState & {
  menu: MealMenuItem;
};

export default function MealRecordSearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isBrandRequestSheetOpen, setIsBrandRequestSheetOpen] = useState(false);
  const [brandRequestKeyword, setBrandRequestKeyword] = useState("");
  const [isBrandRequestSubmitting, setIsBrandRequestSubmitting] = useState(false);
  const [isServingSheetOpen, setIsServingSheetOpen] = useState(false);
  const [servingSheetMenuId, setServingSheetMenuId] = useState<string | null>(null);
  const [servingInputMode, setServingInputMode] = useState<MealServingInputMode>("unit");
  const [servingInputValue, setServingInputValue] = useState("");
  const contextFromState = (location.state ?? {}) as NutritionEntryContextState;
  const [selectedMenus, setSelectedMenus] = useState<MealMenuItem[]>(() => {
    const pendingMenus = Array.isArray(contextFromState.pendingMenus)
      ? contextFromState.pendingMenus
      : [];
    const uniqueMenus = new Map(pendingMenus.map((menu) => [menu.id, menu]));
    return Array.from(uniqueMenus.values());
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
  const baseNutritionEntryContext: NutritionEntryContextState = {
    source: "meal-record",
    dateKey,
    mealType,
    existingMenuCount: contextFromState.existingMenuCount ?? 0,
  };

  const selectedMenuMap = useMemo(
    () => new Map(selectedMenus.map((menu) => [menu.id, menu])),
    [selectedMenus],
  );

  const selectedMenuIdSet = useMemo(
    () => new Set(selectedMenus.map((menu) => menu.id)),
    [selectedMenus],
  );

  const filteredMenus = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();
    if (!normalizedKeyword) return SEARCH_MENU_ITEMS;

    return SEARCH_MENU_ITEMS.filter((menu) => {
      const title = menu.title.toLowerCase();
      const brand = menu.brandChipLabel?.toLowerCase() ?? "";
      const personal = menu.personalChipLabel?.toLowerCase() ?? "";
      return (
        title.includes(normalizedKeyword) ||
        brand.includes(normalizedKeyword) ||
        personal.includes(normalizedKeyword)
      );
    });
  }, [searchKeyword]);

  const servingSheetBaseMenu = useMemo(() => {
    if (!servingSheetMenuId) {
      return null;
    }

    return SEARCH_MENU_ITEMS.find((menu) => menu.id === servingSheetMenuId) ?? null;
  }, [servingSheetMenuId]);

  const servingSheetSelectedMenu = useMemo(() => {
    if (!servingSheetMenuId) {
      return null;
    }

    return selectedMenuMap.get(servingSheetMenuId) ?? null;
  }, [selectedMenuMap, servingSheetMenuId]);

  const servingSheetMenu = servingSheetBaseMenu ?? servingSheetSelectedMenu;

  const servingInfo = useMemo(
    () => (servingSheetMenu ? parseMenuServing(servingSheetMenu) : null),
    [servingSheetMenu],
  );

  const parsedServingInputValue = useMemo(() => {
    const parsedValue = Number(servingInputValue);
    if (!Number.isFinite(parsedValue)) {
      return null;
    }

    return parsedValue;
  }, [servingInputValue]);

  const servingPreviewMenu = useMemo(() => {
    if (!servingSheetMenu || !servingInfo || parsedServingInputValue === null) {
      return servingSheetMenu;
    }

    if (parsedServingInputValue <= 0) {
      return servingSheetMenu;
    }

    const resolvedServing = resolveServingValues(
      servingInfo,
      servingInputMode,
      parsedServingInputValue,
    );
    if (!Number.isFinite(resolvedServing.scaleFactor) || resolvedServing.scaleFactor <= 0) {
      return servingSheetMenu;
    }

    return buildScaledMenu({
      menu: servingSheetMenu,
      serving: servingInfo,
      resolved: resolvedServing,
      mode: servingInputMode,
      inputValue: parsedServingInputValue,
    });
  }, [parsedServingInputValue, servingInfo, servingInputMode, servingSheetMenu]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const handleCameraClick = () => {};

  const resetServingSheetState = () => {
    setIsServingSheetOpen(false);
    setServingSheetMenuId(null);
    setServingInputMode("unit");
    setServingInputValue("");
  };

  const handleOpenServingSheet = (targetMenu: MealMenuItem) => {
    const selectedMenu = selectedMenuMap.get(targetMenu.id);
    const baseMenu = SEARCH_MENU_ITEMS.find((menu) => menu.id === targetMenu.id) ?? targetMenu;
    const parsedServing = parseMenuServing(baseMenu);
    const initialMode = selectedMenu?.servingInputMode ?? "unit";
    const initialInput =
      selectedMenu?.servingInputValue ?? getServingDefaultValue(parsedServing, initialMode);

    setServingSheetMenuId(baseMenu.id);
    setServingInputMode(initialMode);
    setServingInputValue(formatCompactDecimal(normalizeServingInput(initialInput)));
    setIsServingSheetOpen(true);
  };

  const handleServingModeChange = (nextMode: MealServingInputMode) => {
    if (!servingInfo || nextMode === servingInputMode) {
      return;
    }

    setServingInputMode(nextMode);

    const parsedCurrentValue = Number(servingInputValue);
    if (!Number.isFinite(parsedCurrentValue) || parsedCurrentValue <= 0) {
      const fallbackValue = getServingDefaultValue(servingInfo, nextMode);
      setServingInputValue(formatCompactDecimal(normalizeServingInput(fallbackValue)));
      return;
    }

    const resolvedCurrent = resolveServingValues(servingInfo, servingInputMode, parsedCurrentValue);
    if (!Number.isFinite(resolvedCurrent.scaleFactor) || resolvedCurrent.scaleFactor <= 0) {
      const fallbackValue = getServingDefaultValue(servingInfo, nextMode);
      setServingInputValue(formatCompactDecimal(normalizeServingInput(fallbackValue)));
      return;
    }

    const convertedValue =
      nextMode === "weight" ? resolvedCurrent.totalWeight : resolvedCurrent.unitCount;

    setServingInputValue(formatCompactDecimal(normalizeServingInput(convertedValue)));
  };

  const handleServingInputStep = (delta: number) => {
    if (!servingInfo) {
      return;
    }

    const currentValue = Number(servingInputValue);
    const baseValue = Number.isFinite(currentValue)
      ? currentValue
      : getServingDefaultValue(servingInfo, servingInputMode);
    const nextValue = normalizeServingInput(baseValue + delta);

    setServingInputValue(formatCompactDecimal(nextValue));
  };

  const handleServingInputChange = (nextValue: string) => {
    setServingInputValue(sanitizeServingInput(nextValue));
  };

  const handleServingInputBlur = () => {
    if (!servingInfo) {
      setServingInputValue("");
      return;
    }

    const trimmedValue = servingInputValue.trim();

    if (!trimmedValue || trimmedValue === ".") {
      setServingInputValue(
        formatCompactDecimal(
          normalizeServingInput(getServingDefaultValue(servingInfo, servingInputMode)),
        ),
      );
      return;
    }

    const parsedValue = Number(trimmedValue);
    if (!Number.isFinite(parsedValue)) {
      setServingInputValue(
        formatCompactDecimal(
          normalizeServingInput(getServingDefaultValue(servingInfo, servingInputMode)),
        ),
      );
      return;
    }

    setServingInputValue(formatCompactDecimal(normalizeServingInput(parsedValue)));
  };

  const handleSubmitServingSheet = () => {
    if (!servingSheetMenu || !servingInfo) {
      return;
    }

    const inputValue = Number(servingInputValue);
    if (!Number.isFinite(inputValue) || inputValue <= 0) {
      toast.warning("입력값을 다시 확인해주세요");
      return;
    }

    const normalizedInput = normalizeServingInput(inputValue);
    setServingInputValue(formatCompactDecimal(normalizedInput));
    const resolvedServing = resolveServingValues(servingInfo, servingInputMode, normalizedInput);

    if (!Number.isFinite(resolvedServing.scaleFactor) || resolvedServing.scaleFactor <= 0) {
      toast.warning("입력값을 다시 확인해주세요");
      return;
    }

    const isAlreadySelected = selectedMenuIdSet.has(servingSheetMenu.id);
    if (
      !isAlreadySelected &&
      (baseNutritionEntryContext.existingMenuCount ?? 0) + selectedMenus.length + 1 >
        MAX_MEAL_RECORD_MENUS
    ) {
      toast.warning("최대 100개까지 기록할 수 있어요");
      return;
    }

    const nextMenu = buildScaledMenu({
      menu: servingSheetMenu,
      serving: servingInfo,
      resolved: resolvedServing,
      mode: servingInputMode,
      inputValue: normalizedInput,
    });

    setSelectedMenus((prev) => {
      const existingIndex = prev.findIndex((menu) => menu.id === nextMenu.id);

      if (existingIndex < 0) {
        return [...prev, nextMenu];
      }

      const next = [...prev];
      next[existingIndex] = nextMenu;
      return next;
    });

    resetServingSheetState();
  };

  const handleOpenMenuDetail = (menu: MealMenuItem) => {
    navigate(getMealRecordAddSearchDetailPath(dateKey, mealType), {
      state: {
        ...baseNutritionEntryContext,
        pendingMenus: selectedMenus,
        menu,
      } satisfies MealRecordSearchDetailNavigationState,
    });
  };

  const handleApplySelectedMenus = () => {
    if (selectedMenus.length === 0) return;

    navigate(getMealRecordPath(dateKey, mealType), {
      state: {
        pendingMenus: selectedMenus,
      } satisfies MealRecordLocationState,
    });
  };

  const handleClearKeyword = () => {
    setSearchKeyword("");
    searchInputRef.current?.focus();
  };

  const handleDirectNutritionEntry = () => {
    navigate(PATH.NUTRITION_ADD, {
      state: {
        ...baseNutritionEntryContext,
        pendingMenus: selectedMenus,
      } satisfies NutritionEntryContextState,
    });
  };

  const handleOpenBrandRequestSheet = () => {
    setBrandRequestKeyword(searchKeyword.trim());
    setIsBrandRequestSheetOpen(true);
  };

  const handleCloseBrandRequestSheet = () => {
    if (isBrandRequestSubmitting) return;

    setIsBrandRequestSheetOpen(false);
    setBrandRequestKeyword("");
  };

  const handleSubmitBrandRequest = async () => {
    const normalizedBrandKeyword = brandRequestKeyword.trim();
    if (!normalizedBrandKeyword) {
      toast.warning("브랜드명을 입력해주세요");
      return;
    }

    if (isBrandRequestSubmitting) return;

    try {
      setIsBrandRequestSubmitting(true);
      await postMealRecordBrandRequest(normalizedBrandKeyword);
      toast.success("브랜드 요청을 보냈어요");
      setIsBrandRequestSheetOpen(false);
      setBrandRequestKeyword("");
    } catch {
      toast.warning("브랜드 요청 전송에 실패했어요");
    } finally {
      setIsBrandRequestSubmitting(false);
    }
  };

  const isBrandRequestSubmitDisabled =
    isBrandRequestSubmitting || brandRequestKeyword.trim().length === 0;

  const selectedCount = selectedMenus.length;

  return (
    <section className={styles.page}>
      <SearchInputHeader
        value={searchKeyword}
        onValueChange={setSearchKeyword}
        onClear={handleClearKeyword}
        inputRef={searchInputRef}
        placeholder="메뉴를 검색해보세요"
        inputAriaLabel="메뉴 검색"
        onBack={() =>
          navigate(getMealRecordAddPath(dateKey, mealType), {
            state: baseNutritionEntryContext,
          })
        }
      />

      <main className={styles.main}>
        <section className={styles.searchSection}>
          {filteredMenus.length > 0 ? (
            <div className={styles.resultList}>
              {filteredMenus.map((menu) => {
                const isSelected = selectedMenuIdSet.has(menu.id);

                return (
                  <MealMenuCard
                    key={menu.id}
                    title={menu.title}
                    calories={menu.calories}
                    unitAmountText={menu.unitAmountText}
                    brandChipLabel={menu.brandChipLabel}
                    personalChipLabel={menu.personalChipLabel}
                    icon={isSelected ? "check" : "add"}
                    state={isSelected ? "select" : "default"}
                    onClick={() => handleOpenMenuDetail(menu)}
                    onIconClick={() => handleOpenServingSheet(menu)}
                  />
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyResult}>
              <p className="typo-label4">
                일치하는 메뉴나 브랜드가 없어요
                <br />
                비슷한 항목을 선택하거나 직접 등록할 수 있어요
              </p>
              <div className={styles.buttonContainer}>
                <Button
                  variant="text"
                  state="default"
                  size="small"
                  color="assistive"
                  onClick={handleDirectNutritionEntry}
                >
                  영양 성분 직접 등록
                </Button>
                <Button
                  variant="text"
                  state="default"
                  size="small"
                  color="assistive"
                  onClick={handleOpenBrandRequestSheet}
                >
                  브랜드 추가 요청
                </Button>
              </div>
            </div>
          )}

          {filteredMenus.length > 0 && (
            <Button
              variant="text"
              state="default"
              size="small"
              color="assistive"
              onClick={handleDirectNutritionEntry}
            >
              <p className={`${styles.directInputText} typo-label3`}>영양 성분 직접 입력</p>
            </Button>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <MealRecordFloatingCameraButton onClick={handleCameraClick} ariaLabel="사진으로 기록하기" />

        <Button
          onClick={handleApplySelectedMenus}
          variant="filled"
          state={selectedCount > 0 ? "default" : "disabled"}
          size="large"
          color="primary"
          fullWidth
          disabled={selectedCount === 0}
        >
          {selectedCount}개 담겼어요
        </Button>
      </footer>

      <BottomSheet isOpen={isServingSheetOpen} onClose={resetServingSheetState}>
        {servingSheetMenu && servingInfo && (
          <ServingAmountSheetContent
            menu={servingSheetMenu}
            serving={servingInfo}
            previewMenu={servingPreviewMenu ?? servingSheetMenu}
            inputMode={servingInputMode}
            inputValue={servingInputValue}
            onModeChange={handleServingModeChange}
            onInputChange={handleServingInputChange}
            onInputBlur={handleServingInputBlur}
            onDecrease={() => handleServingInputStep(-SERVING_INPUT_STEP)}
            onIncrease={() => handleServingInputStep(SERVING_INPUT_STEP)}
            onSubmit={handleSubmitServingSheet}
          />
        )}
      </BottomSheet>

      <BottomSheet isOpen={isBrandRequestSheetOpen} onClose={handleCloseBrandRequestSheet}>
        <BrandRequestSheetContent
          value={brandRequestKeyword}
          isSubmitting={isBrandRequestSubmitting}
          isSubmitDisabled={isBrandRequestSubmitDisabled}
          onValueChange={setBrandRequestKeyword}
          onSubmit={() => {
            void handleSubmitBrandRequest();
          }}
        />
      </BottomSheet>
    </section>
  );
}
