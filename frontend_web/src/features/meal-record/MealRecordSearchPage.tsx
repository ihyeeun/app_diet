import { Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PATH } from "@/router/path";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import styles from "./styles/MealRecordSearchPage.module.css";

export default function MealRecordSearchPage() {
  const navigate = useNavigate();

  const handleCameraClick = () => {};

  return (
    <section className={styles.page}>
      <PageHeader onBack={() => navigate(PATH.MEAL_RECORD)} />

      <main className={styles.main}>
        <section className={styles.entrySection}>
          <button className={styles.entryButton} onClick={() => {}}>
            <p className="typo-label4">메뉴를 검색하거나 음식 사진을 찍어 기록해보세요</p>
          </button>
          <Button variant="text" state="default" size="small" color="assistive">
            <p className={`${styles.buttonTextColor} typo-label3`}>영양 성분 직접 입력</p>
          </Button>
        </section>
      </main>

      <footer className={styles.footer}>
        <button
          type="button"
          className={styles.cameraButton}
          onClick={handleCameraClick}
          aria-label="사진으로 기록하기"
        >
          <Camera size={24} />
        </button>

        <Button
          onClick={() => {}}
          variant="filled"
          state="disabled"
          size="large"
          color="assistive"
          fullWidth
        >
          {}개 담겼어요
        </Button>
      </footer>
    </section>
  );
}
