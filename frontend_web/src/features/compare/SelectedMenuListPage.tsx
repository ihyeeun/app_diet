import { PageHeader } from "@/shared/commons/header/PageHeader";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/shared/commons/button/Button";
import { MealMenuCard } from "@/shared/commons/card/MealMenuCard";
import { PATH } from "@/router/path";
import type { MealMenuItem } from "@/features/meal-record/types/mealRecord.types";
import { toast } from "@/shared/commons/toast/toast";
import styles from "./styles/SelectedMenuListPage.module.css";

type SelectedMenuListLocationState = {
  selectedMenus?: MealMenuItem[];
};

function dedupeMenusById(menus: MealMenuItem[]) {
  const uniqueMenus = new Map(menus.map((menu) => [menu.id, menu]));
  return Array.from(uniqueMenus.values());
}

export default function SelectedMenuListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as SelectedMenuListLocationState;
  const [selectedMenus, setSelectedMenus] = useState<MealMenuItem[]>(() => {
    const menus = Array.isArray(locationState.selectedMenus) ? locationState.selectedMenus : [];
    return dedupeMenusById(menus);
  });

  const brandMenus = 1;
  const singleMenus = selectedMenus.length;
  const setMenus = 1;

  const totalMenus = brandMenus + singleMenus + setMenus;

  const handleBack = () => {
    navigate(PATH.COMPARE_MENU_SEARCH, {
      replace: true,
      state: {
        selectedMenus,
      } satisfies SelectedMenuListLocationState,
    });
  };

  const handleRemoveMenu = (menuId: string) => {
    setSelectedMenus((prev) => prev.filter((menu) => menu.id !== menuId));
  };

  const handleCompare = () => {
    if (singleMenus === 0) return;
    toast.warning("비교 기능은 준비 중이에요");
  };

  const sections = [
    brandMenus > 0 && (
      <section key="brand" className={styles.menuListSection}>
        <p className="typo-title3">브랜드</p>
        <div className={styles.menuList}>
          <MealMenuCard title="브랜드명" description={`개 메뉴 포함`} />
        </div>
      </section>
    ),

    singleMenus > 0 && (
      <section key="single" className={styles.menuListSection}>
        <p className="typo-title3">단일 메뉴</p>
        <div className={styles.menuList}>
          {selectedMenus.map((menu) => (
            <MealMenuCard
              key={menu.id}
              title={menu.title}
              calories={menu.calories}
              unitAmountText={menu.unitAmountText}
              brand={menu.brand}
              personalChipLabel={menu.personalChipLabel}
              icon="delete"
              onIconClick={() => handleRemoveMenu(menu.id)}
            />
          ))}
        </div>
      </section>
    ),

    setMenus > 0 && (
      <section key="set" className={styles.menuListSection}>
        <p className="typo-title3">세트</p>
      </section>
    ),
  ].filter(Boolean);

  return (
    <section className={styles.page}>
      <PageHeader title="비교 후보 목록" onBack={handleBack} />

      <main className={styles.main}>
        {totalMenus > 0 ? (
          <section className={styles.content}>
            {sections.map((section, index) => (
              <div key={index}>
                {section}
                {index < sections.length - 1 && <div className="divider dividerMargin20" />}
              </div>
            ))}
          </section>
        ) : (
          <div className={styles.emptyState}>
            <p className={`typo-label4 ${styles.emptyText}`}>담긴 메뉴가 없어요</p>
            <Button
              variant="text"
              state="default"
              size="small"
              color="primary"
              onClick={handleBack}
            >
              메뉴 검색으로 돌아가기
            </Button>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerActions}>
          <Button variant="outlined" state="default" size="medium" color="primary" disabled>
            세트 편집
          </Button>
          <Button
            onClick={handleCompare}
            variant="filled"
            state={totalMenus > 0 ? "default" : "disabled"}
            size="medium"
            color="primary"
            fullWidth
            disabled={totalMenus === 0}
          >
            비교하기
          </Button>
        </div>
      </footer>
    </section>
  );
}
