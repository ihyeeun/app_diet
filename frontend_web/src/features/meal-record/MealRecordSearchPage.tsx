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
import type { MealMenuItem, MealRecordLocationState } from "./types/mealRecord.types";
import {
  getMealRecordAddPath,
  getMealRecordAddSearchDetailPath,
  getMealRecordPath,
} from "./utils/mealRecord.paths";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";
import { useServingAmountSheet } from "./hooks/useServingAmountSheet";
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

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const handleCameraClick = () => {};

  const servingSheet = useServingAmountSheet({
    onSubmitMenu: (nextMenu) => {
      const isAlreadySelected = selectedMenuIdSet.has(nextMenu.id);
      if (
        !isAlreadySelected &&
        (baseNutritionEntryContext.existingMenuCount ?? 0) + selectedMenus.length + 1 >
          MAX_MEAL_RECORD_MENUS
      ) {
        toast.warning("최대 100개까지 기록할 수 있어요");
        return false;
      }

      setSelectedMenus((prev) => {
        const existingIndex = prev.findIndex((menu) => menu.id === nextMenu.id);

        if (existingIndex < 0) {
          return [...prev, nextMenu];
        }

        const next = [...prev];
        next[existingIndex] = nextMenu;
        return next;
      });

      return true;
    },
  });

  const handleOpenServingSheet = (targetMenu: MealMenuItem) => {
    const selectedMenu = selectedMenuMap.get(targetMenu.id) ?? null;
    const baseMenu = SEARCH_MENU_ITEMS.find((menu) => menu.id === targetMenu.id) ?? targetMenu;

    servingSheet.open({
      menu: baseMenu,
      selectedMenu,
    });
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

      <BottomSheet isOpen={servingSheet.isOpen} onClose={servingSheet.close}>
        {servingSheet.menu && servingSheet.serving && (
          <ServingAmountSheetContent
            menu={servingSheet.menu}
            serving={servingSheet.serving}
            previewMenu={servingSheet.previewMenu ?? servingSheet.menu}
            inputMode={servingSheet.inputMode}
            inputValue={servingSheet.inputValue}
            onModeChange={servingSheet.onModeChange}
            onInputChange={servingSheet.onInputChange}
            onInputBlur={servingSheet.onInputBlur}
            onDecrease={servingSheet.onDecrease}
            onIncrease={servingSheet.onIncrease}
            onSubmit={servingSheet.onSubmit}
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
