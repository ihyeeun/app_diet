import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ServingAmountSheetContent } from "@/features/meal-record/components/ServingAmountSheetContent";
import { MAX_MEAL_RECORD_MENUS } from "@/features/meal-record/constants/menu.constants";
import { useServingAmountSheet } from "@/features/meal-record/hooks/useServingAmountSheet";
import {
  buildMealRecordDraftKey,
  useMealRecordDraftStore,
} from "@/features/meal-record/stores/mealRecordDraft.store";
import {
  getMealRecordAddSearchDetailPath,
  getMealRecordPath,
} from "@/features/meal-record/utils/mealRecord.paths";
import { getMealType, getSafeDateKey } from "@/features/meal-record/utils/mealRecord.queryParams";
import {
  type BrandSearchResult,
  fetchBrandSearchResults,
} from "@/features/nutrient-entry/api/brandSearch";
import { PATH } from "@/router/path";
import type { MealMenuItem, NutrientEntryContextState } from "@/shared/api/types/api.dto";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { Button } from "@/shared/commons/button/Button";
import { FloatingCameraButton } from "@/shared/commons/button/FloatingCameraButton";
import { MealMenuCard } from "@/shared/commons/card/MealMenuCard";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { SearchInputHeader } from "@/shared/commons/header/SearchInputHeader";
import { toast } from "@/shared/commons/toast/toast";

import styles from "../styles/MealSearch.module.css";
import {
  BRAND_MENU_CATEGORY_OPTIONS,
  type BrandMenuCategory,
  fetchBrandMenuSearchResults,
  fetchSimilarMenuSuggestions,
} from "./api/brandMenuSearch";

const SEARCH_DEBOUNCE_MS = 250;

type BrandMenuSearchLocationState = NutrientEntryContextState & {
  brandName?: string;
  returnPath?: string;
};

type MealRecordSearchDetailNavigationState = NutrientEntryContextState & {
  menu: MealMenuItem;
  searchReturnPath?: string;
  searchReturnState?: BrandMenuSearchLocationState;
};

function useDebouncedKeyword(keyword: string) {
  const [debouncedKeyword, setDebouncedKeyword] = useState(keyword);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [keyword]);

  return debouncedKeyword;
}

export default function BrandMenuSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as BrandMenuSearchLocationState;
  const defaultBrandName = (locationState.brandName ?? "").trim();
  const returnPath = (locationState.returnPath ?? "").trim();

  const dateKey = getSafeDateKey(locationState.dateKey ?? null);
  const mealType = getMealType(locationState.mealType ?? null);
  const draftKey = buildMealRecordDraftKey(dateKey, mealType);

  const ensureDraft = useMealRecordDraftStore((state) => state.ensureDraft);
  const upsertMenuSelection = useMealRecordDraftStore((state) => state.upsertMenuSelection);
  const removeMenuSelection = useMealRecordDraftStore((state) => state.removeMenuSelection);
  const draft = useMealRecordDraftStore((state) => state.drafts[draftKey]);
  const menuSnapshotById = useMealRecordDraftStore((state) => state.menuSnapshotById);
  const selectedMenus = useMemo(
    () =>
      (draft?.selections ?? []).reduce<MealMenuItem[]>((menus, selection) => {
        const snapshot = menuSnapshotById[selection.menuId];
        if (!snapshot) {
          return menus;
        }

        menus.push({
          ...snapshot,
          serving_input_value: selection.quantity,
        });

        return menus;
      }, []),
    [draft?.selections, menuSnapshotById],
  );
  const existingMenuCount = draft?.existingMenuCount ?? 0;

  const seedMenus = useMemo(
    () => (Array.isArray(locationState.pendingMenus) ? locationState.pendingMenus : []),
    [locationState.pendingMenus],
  );

  useEffect(() => {
    ensureDraft({
      key: draftKey,
      existingMenuCount: locationState.existingMenuCount ?? 0,
      seedMenus,
    });
  }, [draftKey, ensureDraft, locationState.existingMenuCount, seedMenus]);

  const baseNutrientEntryContext: NutrientEntryContextState = {
    source: "meal-record",
    dateKey,
    mealType,
    existingMenuCount,
  };

  const [selectedBrand, setSelectedBrand] = useState<BrandSearchResult | null>(
    defaultBrandName
      ? {
          id: defaultBrandName,
          name: defaultBrandName,
        }
      : null,
  );
  const [brandKeyword, setBrandKeyword] = useState(defaultBrandName);
  const [menuKeyword, setMenuKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<BrandMenuCategory>("all");

  const brandInputRef = useRef<HTMLInputElement>(null);
  const menuInputRef = useRef<HTMLInputElement>(null);

  const selectedMenuMap = useMemo(
    () => new Map(selectedMenus.map((menu) => [menu.id, menu])),
    [selectedMenus],
  );
  const selectedMenuIdSet = useMemo(
    () => new Set(selectedMenus.map((menu) => menu.id)),
    [selectedMenus],
  );

  const debouncedBrandKeyword = useDebouncedKeyword(brandKeyword);
  const debouncedMenuKeyword = useDebouncedKeyword(menuKeyword);

  const normalizedBrandKeyword = debouncedBrandKeyword.trim();
  const normalizedMenuKeyword = debouncedMenuKeyword.trim();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      if (selectedBrand) {
        menuInputRef.current?.focus();
        return;
      }

      brandInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [selectedBrand]);

  const { data: brandResults = [], isFetching: isBrandFetching } = useQuery({
    queryKey: ["brand-search-page", "brand", normalizedBrandKeyword],
    queryFn: () => fetchBrandSearchResults(normalizedBrandKeyword),
    enabled: !selectedBrand && normalizedBrandKeyword.length > 0,
  });

  const { data: brandMenuResults = [], isFetching: isBrandMenuFetching } = useQuery({
    queryKey: [
      "brand-search-page",
      "brand-menu",
      selectedBrand?.id ?? "",
      selectedCategory,
      normalizedMenuKeyword,
    ],
    queryFn: async () => {
      if (!selectedBrand) {
        return [];
      }

      return fetchBrandMenuSearchResults({
        brandName: selectedBrand.name,
        keyword: normalizedMenuKeyword,
        category: selectedCategory,
      });
    },
    enabled: selectedBrand !== null,
  });

  const shouldFetchSimilarMenus =
    selectedBrand !== null &&
    normalizedMenuKeyword.length > 0 &&
    !isBrandMenuFetching &&
    brandMenuResults.length === 0;

  const { data: similarMenuResults = [] } = useQuery({
    queryKey: [
      "brand-search-page",
      "similar-menus",
      selectedBrand?.id ?? "",
      normalizedMenuKeyword,
    ],
    queryFn: async () => {
      if (!selectedBrand) {
        return [];
      }

      return fetchSimilarMenuSuggestions({
        brandName: selectedBrand.name,
        keyword: normalizedMenuKeyword,
      });
    },
    enabled: shouldFetchSimilarMenus,
  });

  const activeMenuResults = useMemo(() => {
    if (brandMenuResults.length > 0) {
      return brandMenuResults;
    }

    return similarMenuResults;
  }, [brandMenuResults, similarMenuResults]);

  const servingSheet = useServingAmountSheet({
    onSubmitMenu: (nextMenu) => {
      const isAlreadySelected = selectedMenuIdSet.has(nextMenu.id);
      if (
        !isAlreadySelected &&
        existingMenuCount + selectedMenus.length + 1 > MAX_MEAL_RECORD_MENUS
      ) {
        toast.warning("최대 100개까지 기록할 수 있어요");
        return false;
      }

      upsertMenuSelection({
        key: draftKey,
        menu: nextMenu,
      });

      return true;
    },
  });

  const selectedCount = selectedMenus.length;
  const hasBrandKeyword = normalizedBrandKeyword.length > 0;
  const hasBrandResults = brandResults.length > 0;
  const isBrandInitialSearching = isBrandFetching && hasBrandKeyword && !hasBrandResults;

  const hasMenuResults = brandMenuResults.length > 0;
  const hasSimilarMenus = similarMenuResults.length > 0;

  const handleOpenServingSheet = (targetMenu: MealMenuItem) => {
    const selectedMenu = selectedMenuMap.get(targetMenu.id) ?? null;
    const baseMenu = activeMenuResults.find((menu) => menu.id === targetMenu.id) ?? targetMenu;

    servingSheet.open({
      menu: baseMenu,
      selectedMenu,
    });
  };

  const handleToggleMenuSelection = (targetMenu: MealMenuItem) => {
    if (selectedMenuIdSet.has(targetMenu.id)) {
      removeMenuSelection(draftKey, targetMenu.id);
      return;
    }

    handleOpenServingSheet(targetMenu);
  };

  const handleOpenMenuDetail = (menu: MealMenuItem) => {
    if (!selectedBrand) {
      return;
    }

    navigate(getMealRecordAddSearchDetailPath(dateKey, mealType, menu.id), {
      state: {
        ...baseNutrientEntryContext,
        menu,
        searchReturnPath: PATH.BRAND_MENU_SEARCH,
        searchReturnState: {
          ...locationState,
          ...baseNutrientEntryContext,
          brandName: selectedBrand.name,
          returnPath,
        } satisfies BrandMenuSearchLocationState,
      } satisfies MealRecordSearchDetailNavigationState,
    });
  };

  const handleBack = () => {
    if (selectedBrand && defaultBrandName.length === 0) {
      setSelectedBrand(null);
      setMenuKeyword("");
      setSelectedCategory("all");
      return;
    }

    if (returnPath) {
      navigate(returnPath, {
        replace: true,
        state: {
          ...locationState,
          ...baseNutrientEntryContext,
        } satisfies BrandMenuSearchLocationState,
      });
      return;
    }

    navigate(-1);
  };

  const handleClearBrandKeyword = () => {
    setBrandKeyword("");
    brandInputRef.current?.focus();
  };

  const handleSelectBrand = (brand: BrandSearchResult) => {
    setSelectedBrand(brand);
    setMenuKeyword("");
    setSelectedCategory("all");
  };

  const handleClearMenuKeyword = () => {
    setMenuKeyword("");
    menuInputRef.current?.focus();
  };

  const handleDirectBrandRegister = () => {
    const normalizedKeyword = brandKeyword.trim();
    if (!normalizedKeyword) return;

    navigate(PATH.NUTRIENT_ADD, {
      state: {
        ...locationState,
        ...baseNutrientEntryContext,
        brandName: normalizedKeyword,
      } satisfies BrandMenuSearchLocationState,
    });
  };

  const handleDirectNutrientEntry = () => {
    navigate(PATH.NUTRIENT_ADD, {
      state: {
        ...locationState,
        ...baseNutrientEntryContext,
        pendingMenus: selectedMenus,
        brandName: selectedBrand?.name,
      } satisfies BrandMenuSearchLocationState,
    });
  };

  const handleApplySelectedMenus = () => {
    if (selectedCount === 0) return;

    navigate(getMealRecordPath(dateKey, mealType));
  };

  const handleCameraClick = () => {};

  return (
    <section className={styles.page}>
      {selectedBrand ? (
        <>
          <PageHeader title={selectedBrand.name} onBack={handleBack} />

          <main className={styles.main}>
            <div className={styles.content}>
              <section className={styles.topContainer}>
                <div className={styles.searchFieldWrap}>
                  <input
                    ref={menuInputRef}
                    className={`${styles.searchInput} typo-body3`}
                    type="text"
                    value={menuKeyword}
                    onChange={(event) => setMenuKeyword(event.target.value)}
                    placeholder="브랜드 내 메뉴 검색"
                    aria-label="브랜드 내 메뉴 검색"
                    maxLength={300}
                  />

                  {menuKeyword && (
                    <button
                      type="button"
                      className={styles.clearButton}
                      onClick={handleClearMenuKeyword}
                      aria-label="검색어 지우기"
                    >
                      <img src="/icons/CircleClose.svg" alt="검색어 지우기" />
                    </button>
                  )}
                </div>

                <div className={styles.categoryList}>
                  {BRAND_MENU_CATEGORY_OPTIONS.map((option) => {
                    const isSelected = selectedCategory === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        className={`${styles.categoryChip} ${isSelected ? styles.categoryChipSelected : ""}`}
                        onClick={() => setSelectedCategory(option.value)}
                        aria-pressed={isSelected}
                      >
                        <span className="typo-label3">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className={styles.bottomContainer}>
                {hasMenuResults ? (
                  <div className={styles.resultList}>
                    {brandMenuResults.map((menu) => {
                      const isSelected = selectedMenuIdSet.has(menu.id);

                      return (
                        <MealMenuCard
                          key={menu.id}
                          name={menu.name}
                          calories={menu.calories}
                          unit_quantity={menu.unit_quantity}
                          brand={menu.brand}
                          data_source={menu.data_source}
                          icon={isSelected ? "check" : "add"}
                          state={isSelected ? "select" : "default"}
                          onClick={() => handleOpenMenuDetail(menu)}
                          onIconClick={() => handleToggleMenuSelection(menu)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className={styles.emptyResult}>
                    {isBrandMenuFetching ? (
                      <p className="typo-label4">메뉴를 찾고 있어요</p>
                    ) : (
                      <>
                        <p className={`typo-label4 ${styles.emptyResultText}`}>
                          일치하는 메뉴가 없어요
                          <br />
                          영양 성분은 직접 등록할 수 있어요
                        </p>
                        <Button
                          variant="text"
                          state="default"
                          size="small"
                          color="assistive"
                          onClick={handleDirectNutrientEntry}
                        >
                          영양 성분 직접 등록
                        </Button>
                      </>
                    )}
                  </div>
                )}

                {!isBrandMenuFetching && !hasMenuResults && hasSimilarMenus && (
                  <section className={styles.similarSection}>
                    <h2 className={`${styles.similarSectionTitle} typo-title3`}>
                      비슷한 메뉴 / 브랜드는 어때요?
                    </h2>
                    <div className={styles.resultList}>
                      {similarMenuResults.map((menu) => {
                        const isSelected = selectedMenuIdSet.has(menu.id);

                        return (
                          <MealMenuCard
                            key={menu.id}
                            name={menu.name}
                            calories={menu.calories}
                            unit_quantity={menu.unit_quantity}
                            brand={menu.brand}
                            data_source={menu.data_source}
                            icon={isSelected ? "check" : "add"}
                            state={isSelected ? "select" : "default"}
                            onClick={() => handleOpenMenuDetail(menu)}
                            onIconClick={() => handleToggleMenuSelection(menu)}
                          />
                        );
                      })}
                    </div>
                  </section>
                )}

                {hasMenuResults && (
                  <Button
                    variant="text"
                    state="default"
                    size="small"
                    color="assistive"
                    onClick={handleDirectNutrientEntry}
                  >
                    영양 성분 직접 등록
                  </Button>
                )}
              </section>
            </div>
          </main>
        </>
      ) : (
        <>
          <SearchInputHeader
            value={brandKeyword}
            onValueChange={setBrandKeyword}
            onClear={handleClearBrandKeyword}
            inputRef={brandInputRef}
            placeholder="브랜드명 입력"
            inputAriaLabel="브랜드명 입력"
            onBack={handleBack}
          />

          <main className={styles.main}>
            <section className={styles.searchSection}>
              {hasBrandKeyword ? (
                hasBrandResults ? (
                  <ul className={styles.brandList}>
                    {brandResults.map((brand) => (
                      <li key={brand.id}>
                        <button
                          type="button"
                          className={styles.brandItem}
                          onClick={() => handleSelectBrand(brand)}
                        >
                          <span className={`typo-title2 ${styles.brandName}`}>{brand.name}</span>
                          <ChevronRight size={24} className={styles.brandItemChevron} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={styles.emptyResult}>
                    {isBrandInitialSearching ? (
                      <p className="typo-label4">브랜드를 찾고 있어요</p>
                    ) : (
                      <>
                        <p className={`typo-label4 ${styles.emptyResultText}`}>
                          일치하는 브랜드가 없어요
                          <br />
                          브랜드를 직접 등록할 수 있어요
                        </p>
                        <Button
                          variant="text"
                          state="default"
                          size="small"
                          color="assistive"
                          onClick={handleDirectBrandRegister}
                        >
                          브랜드 직접 등록
                        </Button>
                      </>
                    )}
                  </div>
                )
              ) : (
                <div className={styles.placeholder}>
                  <p className={`typo-label4 ${styles.placeholderText}`}>
                    브랜드명을 검색하면 결과를 바로 확인할 수 있어요
                  </p>
                </div>
              )}

              {hasBrandKeyword && hasBrandResults && (
                <Button
                  variant="text"
                  state="default"
                  size="small"
                  color="assistive"
                  onClick={handleDirectBrandRegister}
                >
                  브랜드 직접 등록
                </Button>
              )}
            </section>
          </main>
        </>
      )}

      <footer className={styles.footer}>
        <FloatingCameraButton onClick={handleCameraClick} ariaLabel="사진으로 기록하기" />

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
    </section>
  );
}
