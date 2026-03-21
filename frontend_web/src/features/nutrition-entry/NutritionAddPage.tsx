import { PageHeader } from "@/shared/commons/header/PageHeader";
import { useNavigate } from "react-router-dom";
import styles from "./styles/NutritionAddPage.module.css";
import { Button } from "@/shared/commons/button/Button";
import { useState, type ChangeEvent } from "react";

export default function NutritionAddPage() {
  const navigation = useNavigate();
  const [brandName, setBrandName] = useState("");
  const [foodName, setFoodName] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBrandName(event.target.value);
  };

  const handleFoodNameChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setFoodName(event.target.value);
  };

  return (
    <section className={styles.page}>
      <PageHeader
        title="영양 성분 등록"
        onBack={() => {
          navigation(-1);
        }}
      />

      <main className={styles.main}>
        <div className={styles.fieldWrap}>
          <label>
            <p className={`typo-title3 ${styles.labelText}`}>브랜드명</p>
          </label>
          <input
            className={`${styles.inputBrand} typo-body3`}
            type="text"
            value={brandName}
            onChange={handleChange}
            placeholder="등록하고 싶은 브랜드를 입력하세요"
            aria-label="등록하고 싶은 브랜드를 입력하세요"
          />
        </div>

        <div className={styles.fieldWrap}>
          <label>
            <p className={`typo-title3 ${styles.labelText}`}>음식명</p>
          </label>

          <textarea
            maxLength={300}
            className={`${styles.textArea} typo-body3`}
            value={foodName}
            onChange={handleFoodNameChange}
            placeholder="등록하고 싶은 음식명 입력하세요"
            aria-label="등록하고 싶은 음식명 입력하세요"
            required
          />

          <p className={`typo-label4 ${styles.limitText}`}>최대 300자 이내</p>
        </div>
      </main>

      <footer className={styles.footer}>
        <Button
          variant="filled"
          size="large"
          color="assistive"
          fullWidth
          state={!foodName.trim() ? "disabled" : "default"}
          disabled={!foodName.trim()}
        >
          다음
        </Button>
      </footer>
    </section>
  );
}
