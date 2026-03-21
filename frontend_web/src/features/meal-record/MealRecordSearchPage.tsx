import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/shared/commons/button/Button";
import { MealMenuCard } from "@/shared/commons/card/MealMenuCard";
import { SearchInputHeader } from "@/shared/commons/header/SearchInputHeader";
import { MealRecordFloatingCameraButton } from "./components/MealRecordFloatingCameraButton";
import { SEARCH_MENU_ITEMS } from "./utils/mealRecord.mockData";
import { getMealRecordAddPath, getMealRecordPath } from "./utils/mealRecord.paths";
import { getMealType, getSafeDateKey } from "./utils/mealRecord.queryParams";
import type { MealMenuItem, MealRecordLocationState } from "./types/mealRecord.types";
import styles from "./styles/MealRecordSearchPage.module.css";

export default function MealRecordSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedMenus, setSelectedMenus] = useState<MealMenuItem[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));

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

  const handleToggleMenuSelection = (targetMenu: MealMenuItem) => {
    setSelectedMenus((prev) => {
      const isSelected = prev.some((menu) => menu.id === targetMenu.id);
      if (isSelected) {
        return prev.filter((menu) => menu.id !== targetMenu.id);
      }

      return [...prev, targetMenu];
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
        onBack={() => navigate(getMealRecordAddPath(dateKey, mealType))}
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
                    onClick={() => handleToggleMenuSelection(menu)}
                    onIconClick={() => handleToggleMenuSelection(menu)}
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
                <Button variant="text" state="default" size="small" color="assistive">
                  영양 성분 직접 등록
                </Button>
                <Button variant="text" state="default" size="small" color="assistive">
                  브랜드 추가 요청
                </Button>
              </div>
            </div>
          )}

          {/* 여기에 비슷한 메뉴 추천이 들어오게 되면 넣으면 될거같다 */}

          {filteredMenus.length > 0 && (
            <Button variant="text" state="default" size="small" color="assistive">
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
    </section>
  );
}
