import { useNavigate } from "react-router-dom";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import styles from "@/features/nutrition-entry/styles/NutritionCameraPage.module.css";

export default function MealCameraPage() {
  const navigate = useNavigate();

  const handleCameraActions = () => {};

  return (
    <section className={styles.page}>
      <PageHeader title="음식 촬영" onBack={() => navigate(-1)} />

      <main className={styles.main}>
        <div className={styles.cameraWrap}>
          <img src="/icons/Food.svg" alt="카메라 아이콘" className={styles.cameraIcon} />
          <p className="typo-title1">
            영양성분표 전체가 선명하게
            <br />
            보이도록 촬영해주세요
          </p>
        </div>
        <Button
          variant="filled"
          state="default"
          size="small"
          color="primary"
          onClick={handleCameraActions}
        >
          촬영하기
        </Button>
      </main>
    </section>
  );
}
