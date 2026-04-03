import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { queryKeys } from "@/features/home/hooks/queries/queryKey";
import { MAX_MEAL_RECORD_MENUS } from "@/features/meal-record/constants/menu.constants";
import {
  formatMenuDraftKey,
  type MenuDraftType,
  useMenuDraftInit,
  useMenuDraftMenus,
  useMenuDraftRemove,
  useMenuDraftSelectedCount,
  useMenuDraftUpsert,
} from "@/features/meal-record/stores/menuDraft.store";
import { getMealType, getSafeDateKey } from "@/features/meal-record/utils/mealRecord.queryParams";
import RegisterBottomSheet from "@/features/search/components/RegisterBottomSheet";
import { useTodayMealRecordRegisterMutation } from "@/features/search/menu-record/hooks/mutations/useTodayMealRecordMutation";
import { useMealSearchMutation } from "@/features/search/menu-record/hooks/useMealSearchMutation";
import { PATH } from "@/router/path";
import { getMealDetailPath, getMealRecordPath } from "@/router/pathHelpers";
import { getPathWithMeal } from "@/router/pathHelpers";
import { MEAL_TIME, type MealType, type RegisterMealRequestDto } from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";
import { FloatingCameraButton } from "@/shared/commons/button/FloatingCameraButton";
import { MealMenuCard } from "@/shared/commons/card/MealMenuCard";
import { SearchInputHeader } from "@/shared/commons/header/SearchInputHeader";
import { toast } from "@/shared/commons/toast/toast";

import styles from "../styles/MealSearch.module.css";

const MEAL_TYPE_TO_TIME: Record<MealType, RegisterMealRequestDto["time"]> = {
  "0": MEAL_TIME.BREAKFAST,
  "1": MEAL_TIME.LUNCH,
  "2": MEAL_TIME.DINNER,
  "3": MEAL_TIME.SNACK,
  "4": MEAL_TIME.LATE_NIGHT_SNACK,
};

type MealSearchLocationState = {
  seedMenus?: MenuDraftType[];
  selectedMenuCount?: number;
};

export default function MealSearchPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const locationState = (location.state ?? {}) as MealSearchLocationState;

  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
  const draftKey = formatMenuDraftKey(dateKey, mealType);

  const initDraft = useMenuDraftInit();
  const upsertMenu = useMenuDraftUpsert();
  const removeMenu = useMenuDraftRemove();
  const selectedMenus = useMenuDraftMenus(dateKey, mealType);
  const selectedCount = useMenuDraftSelectedCount(dateKey, mealType);
  const seedMenus = useMemo(
    () => (Array.isArray(locationState.seedMenus) ? locationState.seedMenus : []),
    [locationState.seedMenus],
  );

  const selectedMenuIdSet = useMemo(
    () => new Set(selectedMenus.map((menu) => menu.id)),
    [selectedMenus],
  );
  const existingMenuCount = locationState.selectedMenuCount ?? seedMenus.length;

  const { mutate: mealSearchMutation, data: searchResults } = useMealSearchMutation();
  const { mutate: mealRegister } = useTodayMealRecordRegisterMutation();

  useEffect(() => {
    initDraft({
      key: draftKey,
      existingMenuCount,
      seedMenus,
    });
  }, [draftKey, existingMenuCount, initDraft, seedMenus]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  const handleToggleMenuSelection = (menuId: number) => {
    if (selectedMenuIdSet.has(menuId)) {
      removeMenu({ key: draftKey, id: menuId });
      return;
    }

    if (selectedCount + 1 > MAX_MEAL_RECORD_MENUS) {
      toast.warning("최대 100개까지 기록할 수 있어요");
      return;
    }

    upsertMenu({
      key: draftKey,
      id: menuId,
      quantity: 1,
    });
  };

  const handleMenuDetailPageOpen = (menuId: number) => {
    navigate(getMealDetailPath(dateKey, mealType, menuId, "MEAL_SEARCH"));
  };

  const handleApplySelectedMenus = () => {
    if (selectedMenus.length === 0) return;

    const requestBody: RegisterMealRequestDto = {
      date: dateKey,
      time: MEAL_TYPE_TO_TIME[mealType],
      menu_ids: selectedMenus.map((menu) => menu.id),
      menu_quantities: selectedMenus.map((menu) => menu.quantity),
    };

    mealRegister(requestBody, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.dayMeals(dateKey) });
        navigate(getMealRecordPath(dateKey, mealType));
      },
      onError: () => {
        toast.warning("메뉴 등록 실패");
      },
    });
  };

  const handleClearKeyword = () => {
    setSubmittedKeyword("");
    searchInputRef.current?.focus();
  };

  const [isDirectInputSheetOpen, setIsDirectInputSheetOpen] = useState(false);
  const handleCloseDirectInputSheet = () => {
    setIsDirectInputSheetOpen(false);
  };
  const handleNavigateNutrientAdd = () => {
    setIsDirectInputSheetOpen(false);
    navigate(getPathWithMeal(PATH.NUTRIENT_ADD_REGISTER, dateKey, mealType));
  };

  const handleNavigateNutrientCamera = () => {
    setIsDirectInputSheetOpen(false);

    navigate(getPathWithMeal(PATH.NUTRIENT_ADD, dateKey, mealType));
  };

  const handleCameraClick = () => {
    navigate(getPathWithMeal(PATH.FOOD_CAMERA, dateKey, mealType));
  };

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
        onBack={() => navigate(getMealRecordPath(dateKey, mealType))}
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
                        onIconClick={() => handleToggleMenuSelection(menu.id)}
                      />
                    );
                  })}

                  {searchResults.brand_list.map((brand) => (
                    <button key={brand} type="button" className={styles.brandItem}>
                      <span className={`typo-title2 ${styles.brandName}`}>{brand}</span>
                      <ChevronRight size={24} className={styles.brandItemChevron} />
                    </button>
                  ))}

                  <div className={styles.bottomTextContainer}>
                    <Button
                      variant="text"
                      state="default"
                      size="small"
                      color="assistive"
                      onClick={() => {
                        setIsDirectInputSheetOpen(true);
                      }}
                    >
                      <span className={styles.bottomText}>찾으시는 메뉴가 없나요?</span>
                      직접 등록하기
                    </Button>
                  </div>
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
                      <Button
                        variant="text"
                        state="default"
                        size="small"
                        color="assistive"
                        onClick={() => {
                          setIsDirectInputSheetOpen(true);
                        }}
                      >
                        영양 성분 직접 등록
                      </Button>
                    </div>
                  </section>

                  {(searchResults.menu_list.length > 0 || searchResults.brand_list.length > 0) && (
                    <section className={styles.similarSection}>
                      <p className={`${styles.similarSectionTitle} typo-title3`}>
                        비슷한 메뉴는 어때요?
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
                              onIconClick={() => handleToggleMenuSelection(menu.id)}
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
              <p className={`typo-title4 ${styles.placeholderText}`}>
                메뉴를 검색하거나
                <br />
                음식 사진을 찍어 기록해보세요
              </p>

              <Button
                variant="text"
                state="default"
                size="small"
                color="assistive"
                onClick={() => {
                  setIsDirectInputSheetOpen(true);
                }}
              >
                영양 성분 직접 등록
              </Button>
            </div>
          )}
        </section>
      </main>

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

      <RegisterBottomSheet
        isOpen={isDirectInputSheetOpen}
        onClose={handleCloseDirectInputSheet}
        onSelectNumberInput={handleNavigateNutrientAdd}
        onSelectCameraInput={handleNavigateNutrientCamera}
      />
    </section>
  );
}
