import { ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import styles from "@/features/search/styles/BrandSearch.module.css";
import { PATH } from "@/router/path";
import type { NutrientAddLocationState } from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";
import { SearchInputHeader } from "@/shared/commons/header/SearchInputHeader";

export default function BrandSearch() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as NutrientAddLocationState;
  const [searchKeyword, setSearchKeyword] = useState((locationState.brandName ?? "").trim());
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const handleClearKeyword = () => {
    setSearchKeyword("");
    setSelectedBrandId("");
    searchInputRef.current?.focus();
  };

  const handleBack = () => {
    navigate(PATH.NUTRIENT_ADD, {
      replace: true,
      state: locationState,
    });
  };

  const handleDirectBrandRegister = () => {
    const brandName = searchKeyword.trim();
    if (!brandName) return;

    navigate(PATH.NUTRIENT_ADD, {
      replace: true,
      state: {
        ...locationState,
        brandName,
      } satisfies NutrientAddLocationState,
    });
  };

  const handleApplySelectedBrand = () => {
    // navigate(PATH.NUTRIENT_ADD, {
    //   replace: true,
    //   state: {
    //     ...locationState,
    //     brandName: selectedBrand.name,
    //   } satisfies NutrientAddLocationState,
    // });
  };
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
