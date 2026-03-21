import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { Button } from "@/shared/commons/button/Button";
import { PATH } from "@/router/path";
import { SearchInputHeader } from "@/shared/commons/header/SearchInputHeader";
import { fetchBrandSearchResults, type BrandSearchResult } from "./api/brandSearch";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { NutritionAddLocationState } from "./nutritionEntry.types";
import styles from "./styles/BrandSearch.module.css";

const SEARCH_DEBOUNCE_MS = 250;

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

export default function BrandSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as NutritionAddLocationState;
  const [searchKeyword, setSearchKeyword] = useState((locationState.brandName ?? "").trim());
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedKeyword = useDebouncedKeyword(searchKeyword);
  const normalizedKeyword = debouncedKeyword.trim();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const { data: brandResults = [], isFetching } = useQuery({
    queryKey: ["brand-search", normalizedKeyword],
    queryFn: () => fetchBrandSearchResults(normalizedKeyword),
    enabled: normalizedKeyword.length > 0,
  });

  const handleClearKeyword = () => {
    setSearchKeyword("");
    setSelectedBrandId("");
    searchInputRef.current?.focus();
  };

  const handleBack = () => {
    navigate(PATH.NUTRITION_ADD, {
      replace: true,
      state: locationState,
    });
  };

  const handleToggleBrandSelection = (brand: BrandSearchResult) => {
    setSelectedBrandId((prev) => {
      if (prev === brand.id) {
        return "";
      }

      return brand.id;
    });
  };

  const handleDirectBrandRegister = () => {
    const brandName = searchKeyword.trim();
    if (!brandName) return;

    navigate(PATH.NUTRITION_ADD, {
      replace: true,
      state: {
        ...locationState,
        brandName,
      } satisfies NutritionAddLocationState,
    });
  };

  const handleApplySelectedBrand = () => {
    const selectedBrand = brandResults.find((brand) => brand.id === selectedBrandId);
    if (!selectedBrand) return;

    navigate(PATH.NUTRITION_ADD, {
      replace: true,
      state: {
        ...locationState,
        brandName: selectedBrand.name,
      } satisfies NutritionAddLocationState,
    });
  };

  const hasKeyword = normalizedKeyword.length > 0;
  const hasResults = brandResults.length > 0;
  const isInitialSearching = isFetching && hasKeyword && !hasResults;
  const isSelectDisabled =
    selectedBrandId.length === 0 || !brandResults.some((brand) => brand.id === selectedBrandId);
  const isDirectRegisterDisabled = searchKeyword.trim().length === 0;

  return (
    <section className={styles.page}>
      <SearchInputHeader
        value={searchKeyword}
        onValueChange={setSearchKeyword}
        onClear={handleClearKeyword}
        inputRef={searchInputRef}
        placeholder="브랜드명 입력"
        inputAriaLabel="브랜드명 입력"
        onBack={handleBack}
      />

      <main className={styles.main}>
        <section className={styles.searchSection}>
          {hasKeyword ? (
            hasResults ? (
              <ul className={styles.resultList}>
                {brandResults.map((brand) => {
                  const isSelected = selectedBrandId === brand.id;

                  return (
                    <li key={brand.id}>
                      <button
                        type="button"
                        className={`${styles.brandItem} ${isSelected ? styles.brandItemSelected : ""}`}
                        onClick={() => handleToggleBrandSelection(brand)}
                        aria-pressed={isSelected}
                      >
                        <span className={`typo-title2 ${styles.brandName}`}>{brand.name}</span>
                        <ChevronRight size={24} className={styles.brandItemChevron} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className={styles.emptyResult}>
                {isInitialSearching && <p className={`typo-label4`}>브랜드를 찾고 있어요</p>}
                {!isInitialSearching && (
                  <>
                    <p className={`typo-label4 ${styles.emptyResultSubText}`}>
                      일치하는 브랜드가 없어요
                      <br />
                      브랜드를 직접 등록할 수 있어요
                    </p>
                    <Button
                      variant="text"
                      state={isDirectRegisterDisabled ? "disabled" : "default"}
                      size="small"
                      color="assistive"
                      onClick={handleDirectBrandRegister}
                      disabled={isDirectRegisterDisabled}
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

          {hasKeyword && hasResults && (
            <Button
              variant="text"
              state={isDirectRegisterDisabled ? "disabled" : "default"}
              size="small"
              color="assistive"
              onClick={handleDirectBrandRegister}
              disabled={isDirectRegisterDisabled}
            >
              브랜드 직접 등록
            </Button>
          )}
        </section>
      </main>

      {hasResults && (
        <footer className={styles.footer}>
          <Button
            variant="filled"
            state={isSelectDisabled ? "disabled" : "default"}
            size="large"
            color="primary"
            fullWidth
            onClick={handleApplySelectedBrand}
            disabled={isSelectDisabled}
          >
            선택하기
          </Button>
        </footer>
      )}
    </section>
  );
}
