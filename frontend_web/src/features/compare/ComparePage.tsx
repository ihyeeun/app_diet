import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PATH } from "@/router/path";
import { Button } from "@/shared/commons/button/Button";
import { FloatingCameraButton } from "@/shared/commons/button/FloatingCameraButton";
import { PageHeader } from "@/shared/commons/header/PageHeader";

import styles from "./styles/ComparePage.module.css";

export default function ComparePage() {
  const navigation = useNavigate();

  return (
    <section className={styles.page}>
      <PageHeader title="메뉴 비교" />

      <main className={styles.main}>
        <section className={styles.content}>
          <p className={`typo-title4 ${styles.title}`}>
            비교할 메뉴를 담아보세요
            <br />
            사진으로 여러 메뉴를 한 번에 담을 수도 있어요
          </p>

          <button
            className={styles.searchSection}
            onClick={() => navigation(PATH.COMPARE_MENU_SEARCH)}
          >
            <Search size={20} className={styles.icon} />
            <p className={`typo-label4 ${styles.searchText}`}>
              메뉴를 검색하거나 음식 사진을 찍어 기록해보세요
            </p>
          </button>

          <Button variant="text" state="default" size="small" color="assistive">
            <span className={styles.buttonText}>영양 성분 직접 입력</span>
          </Button>
        </section>
      </main>

      <footer className={styles.footer}>
        <FloatingCameraButton
          onClick={() => {}}
          ariaLabel="후보 메뉴 촬영화면으로 이동"
          tone="light"
          bottomOffset={24}
        />
      </footer>
    </section>
  );
}
