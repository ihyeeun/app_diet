import { SearchInputHeader } from "@/shared/commons/header/SearchInputHeader";
import styles from "../styles/MealSearch.module.css";
import { useLocation, useNavigate } from "react-router-dom";
import { FloatingCameraButton } from "@/shared/commons/button/FloatingCameraButton";
import { Button } from "@/shared/commons/button/Button";
import { useMemo, useState } from "react";
import type { MealMenuItem } from "@/features/meal-record/types/mealRecord.types";
import { useDebouncedKeyword } from "@/features/search/utils/useDebounedKeyword";
import { MealMenuCard } from "@/shared/commons/card/MealMenuCard";
import { ChevronRight } from "lucide-react";
import { PATH } from "@/router/path";
import BottomSheet from "@/shared/commons/bottomSheet/BottomSheet";
import { BrandRequestSheetContent } from "@/features/meal-record/components/BrandRequestSheetContent";
import { toast } from "@/shared/commons/toast/toast";
import { fetchMealMenuSearchResults } from "@/features/meal-record/api/menuSearch";
import { useQuery } from "@tanstack/react-query";
import type { NutritionEntryContextState } from "@/features/nutrition-entry/nutritionEntry.types";

export default function MenuComPareSearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const contextFromState = (location.state ?? {}) as NutritionEntryContextState;
  const [selectedMenus, setSelectedMenus] = useState<MealMenuItem[]>(() => {
    const pendingMenus = Array.isArray(contextFromState.pendingMenus)
      ? contextFromState.pendingMenus
      : [];
    const uniqueMenus = new Map(pendingMenus.map((menu) => [menu.id, menu]));
    return Array.from(uniqueMenus.values());
  });

  const selectedMenuMap = useMemo(
    () => new Map(selectedMenus.map((menu) => [menu.id, menu])),
    [selectedMenus],
  );

  const selectedCount = selectedMenus.length;

  const [searchKeyword, setSearchKeyword] = useState("");
  const debouncedKeyword = useDebouncedKeyword(searchKeyword);

  const hasKeyword = debouncedKeyword.trim().length > 0;

  const [isBrandRequestSheetOpen, setIsBrandRequestSheetOpen] = useState(false);
  const [brandRequestKeyword, setBrandRequestKeyword] = useState("");
  const [isBrandRequestSubmitting, setIsBrandRequestSubmitting] = useState(false);
  const isBrandRequestSubmitDisabled =
    isBrandRequestSubmitting || brandRequestKeyword.trim().length === 0;

  const handleDirectNutritionEntry = () => {
    navigate(PATH.NUTRITION_ADD);
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
      // await postMealRecordBrandRequest(normalizedBrandKeyword);
      toast.success("브랜드 요청을 보냈어요");
      setIsBrandRequestSheetOpen(false);
      setBrandRequestKeyword("");
    } catch {
      toast.warning("브랜드 요청 전송에 실패했어요");
    } finally {
      setIsBrandRequestSubmitting(false);
    }
  };

  // TODO 임시 목 데이터 / 추후 삭제
  const { data: menuSearchResults = [], isFetching } = useQuery({
    queryKey: ["meal-menu-search", debouncedKeyword.trim()],
    queryFn: () => fetchMealMenuSearchResults(debouncedKeyword.trim()),
    enabled: debouncedKeyword.trim().length > 0,
  });

  const hasResults = menuSearchResults.length > 0;
  const isInitialSearching = isFetching && hasKeyword && !hasResults;
  const selectedMenuIdSet = useMemo(
    () => new Set(selectedMenus.map((menu) => menu.id)),
    [selectedMenus],
  );

  return (
    <section className={styles.page}>
      <SearchInputHeader
        value={searchKeyword}
        onValueChange={setSearchKeyword}
        onClear={() => setSearchKeyword("")}
        onBack={() => {
          navigate(-1);
        }}
        placeholder="메뉴를 검색해보세요"
      />

      <main className={styles.main}>
        <section className={styles.content}>
          {hasKeyword ? (
            hasResults ? (
              <div className={styles.resultList}>
                {menuSearchResults.map((menu) => {
                  const isSelected = selectedMenuIdSet.has(menu.id);

                  return (
                    <MealMenuCard
                      key={menu.id}
                      title={menu.title}
                      calories={menu.calories}
                      unitAmountText={menu.unitAmountText}
                      brand={menu.brand}
                      personalChipLabel={menu.personalChipLabel}
                      icon={isSelected ? "check" : "add"}
                      state={isSelected ? "select" : "default"}
                      // onClick={() => handleOpenMenuDetail(menu)}
                      // onIconClick={() => handleToggleMenuSelection(menu)}
                    />
                  );
                })}

                {/* {menuResultBrands.map((brand) => (
                  <button
                    key={brand.id}
                    type="button"
                    className={styles.brandItem}
                    onClick={() => handleNavigateBrandMenuSearch(brand.name)}
                  >
                    <span className={`typo-title2 ${styles.brandName}`}>{brand.name}</span>
                    <ChevronRight size={24} className={styles.brandItemChevron} />
                  </button>
                ))} */}
              </div>
            ) : (
              <div className={styles.emptyResult}>
                {isInitialSearching ? (
                  <p className="typo-label4">메뉴를 찾고 있어요</p>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            )
          ) : (
            <div className={styles.placeholder}>
              <p className={`typo-label4 ${styles.placeholderText}`}>비교할 메뉴를 찾아보세요</p>
            </div>
          )}

          {hasKeyword && hasResults && (
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
        <FloatingCameraButton onClick={() => {}} ariaLabel="사진으로 기록하기" />

        <div className={styles.menuCompareFooterContainer}>
          <Button
            onClick={() => {}}
            variant="outlined"
            state="default"
            size="medium"
            color="primary"
          >
            세트 편집
          </Button>
          <Button
            onClick={() => {}}
            variant="filled"
            state={selectedCount > 0 ? "default" : "disabled"}
            size="medium"
            color="primary"
            fullWidth
            disabled={selectedCount === 0}
          >
            {selectedCount}개 담겼어요
          </Button>
        </div>
      </footer>

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
