import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/commons/button/Button";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { MealMenuCard } from "@/shared/commons/card/MealMenuCard";
import { SearchInputHeader } from "@/shared/commons/header/SearchInputHeader";
import { toast } from "@/shared/commons/toast/toast";
import { ServingAmountSheetContent } from "@/features/meal-record/components/ServingAmountSheetContent";
import { BrandRequestSheetContent } from "@/features/meal-record/components/BrandRequestSheetContent";
import { postMealRecordBrandRequest } from "@/features/meal-record/api/brandRequest";
import type { MealMenuItem, NutritionEntryContextState } from "@/shared/api/types/nutrition.dto";
import {
  getMealRecordAddSearchDetailPath,
  getMealRecordAddPath,
  getMealRecordPath,
} from "@/features/meal-record/utils/mealRecord.paths";
import { getMealType, getSafeDateKey } from "@/features/meal-record/utils/mealRecord.queryParams";
import { useServingAmountSheet } from "@/features/meal-record/hooks/useServingAmountSheet";
import styles from "../styles/MealSearch.module.css";
import { FloatingCameraButton } from "@/shared/commons/button/FloatingCameraButton";
import { MAX_MEAL_RECORD_MENUS } from "@/features/meal-record/constants/menu.constants";
import { useMealSearchMutation } from "@/features/search/menu-record/hooks/useMealSearchMutation";
import {
  buildMealRecordDraftKey,
  useMealRecordDraftStore,
} from "@/features/meal-record/stores/mealRecordDraft.store";
import { buildRegisterMealRequest } from "@/features/meal-record/utils/mealRecord.payload";
import { useTodayMealRecordRegisterMutation } from "@/features/search/menu-record/hooks/mutations/useTodayMealRecordMutation";

export default function MealSearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const locationState = (location.state ?? {}) as NutritionEntryContextState;

  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [isBrandRequestSheetOpen, setIsBrandRequestSheetOpen] = useState(false);
  const [brandRequestKeyword, setBrandRequestKeyword] = useState("");
  const [isBrandRequestSubmitting, setIsBrandRequestSubmitting] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
  const draftKey = buildMealRecordDraftKey(dateKey, mealType);

  const { mutate: mealRegister } = useTodayMealRecordRegisterMutation({
    onSuccess: () => {
      navigate(getMealRecordPath(dateKey, mealType));
    },

    onError: () => {
      toast.warning("메뉴 등록 실패");
      return;
    },
  });

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

  const selectedMenuMap = useMemo(
    () => new Map(selectedMenus.map((menu) => [menu.id, menu])),
    [selectedMenus],
  );
  const selectedMenuIdSet = useMemo(
    () => new Set(selectedMenus.map((menu) => menu.id)),
    [selectedMenus],
  );

  const { mutate: mealSearchMutation, data: searchResults } = useMealSearchMutation();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

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

  const handleOpenServingSheet = (targetMenu: MealMenuItem) => {
    const selectedMenu = selectedMenuMap.get(targetMenu.id) ?? null;
    const baseMenu =
      searchResults?.menu_list.find((menu) => menu.id === targetMenu.id) ?? targetMenu;

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

  const handleMenuDetailPageOpen = (menuId: number) => {
    navigate(getMealRecordAddSearchDetailPath(dateKey, mealType, menuId));
  };

  const handleApplySelectedMenus = () => {
    if (!draft || draft.selections.length === 0) return;

    const requestBody = buildRegisterMealRequest({
      dateKey,
      mealType,
      // image: "imageUrl",
      menus: selectedMenus,
    });

    mealRegister(requestBody);
  };

  const handleClearKeyword = () => {
    setSubmittedKeyword("");
    searchInputRef.current?.focus();
  };

  const handleOpenBrandRequestSheet = () => {
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

  const selectedCount = selectedMenus.length;
  const isBrandRequestSubmitDisabled =
    isBrandRequestSubmitting || brandRequestKeyword.trim().length === 0;

  return (
    <section className={styles.page}>
      <SearchInputHeader
        value={submittedKeyword}
        onValueChange={setSubmittedKeyword}
        onClear={handleClearKeyword}
        onEnter={mealSearchMutation}
        inputRef={searchInputRef}
        placeholder="메뉴를 검색해보세요"
        inputAriaLabel="메뉴 검색"
        onBack={() => navigate(getMealRecordAddPath(dateKey, mealType))}
      />

      <main className={styles.main}>
        <section className={styles.content}>
          {searchResults ? (
            <>
              {searchResults.has_result ? (
                <div className={styles.resultList}>
                  {searchResults.menu_list.map((menu) => {
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
                        onClick={() => handleMenuDetailPageOpen(menu.id)}
                        onIconClick={() => handleToggleMenuSelection(menu)}
                      />
                    );
                  })}

                  {searchResults.brand_list.map((brand) => (
                    <button key={brand} type="button" className={styles.brandItem}>
                      <span className={`typo-title2 ${styles.brandName}`}>{brand}</span>
                      <ChevronRight size={24} className={styles.brandItemChevron} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyResultContainer}>
                  <section className={styles.emptyResult}>
                    <p className="typo-label4">
                      일치하는 메뉴나 브랜드가 없어요
                      <br />
                      비슷한 항목을 선택하거나 직접 등록할 수 있어요
                    </p>
                    <div className={styles.buttonContainer}>
                      <Button variant="text" state="default" size="small" color="assistive">
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
                  </section>

                  {(searchResults.menu_list.length > 0 || searchResults.brand_list.length > 0) && (
                    <section className={styles.similarSection}>
                      <p className={`${styles.similarSectionTitle} typo-title3`}>
                        비슷한 메뉴 / 브랜드는 어때요?
                      </p>

                      <div className={styles.resultList}>
                        {searchResults.menu_list.map((menu) => {
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
                              onClick={() => handleMenuDetailPageOpen(menu.id)}
                              onIconClick={() => handleToggleMenuSelection(menu)}
                            />
                          );
                        })}

                        {searchResults.brand_list.map((brand) => (
                          <button key={brand} type="button" className={styles.brandItem}>
                            <span className={`typo-title2 ${styles.brandName}`}>{brand}</span>
                            <ChevronRight size={24} className={styles.brandItemChevron} />
                          </button>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <p className={`typo-label4 ${styles.placeholderText}`}>
                메뉴를 검색하거나 음식 사진을 찍어 기록해보세요
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <FloatingCameraButton onClick={() => {}} ariaLabel="사진으로 기록하기" />

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
