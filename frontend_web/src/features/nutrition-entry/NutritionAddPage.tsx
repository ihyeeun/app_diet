import { PageHeader } from "@/shared/commons/header/PageHeader";
import { useNavigate } from "react-router-dom";
import styles from "./styles/NutritionAddPage.module.css";
import { Button } from "@/shared/commons/button/Button";
import { useState, type ChangeEvent } from "react";
import { PATH } from "@/router/path";

export default function NutritionAddPage() {
  const navigation = useNavigate();
  const [brandName, setBrandName] = useState("");
  const [foodName, setFoodName] = useState("");

  const handleBrandNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setBrandName(event.target.value);
  };

  const handleFoodNameChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setFoodName(event.target.value);
  };

  const isNextDisabled = !foodName.trim();

  const handleNext = () => {
    if (isNextDisabled) return;

    navigation(PATH.NUTRITION_ADD_DETAIL, {
      state: {
        brandName: brandName.trim(),
        foodName: foodName.trim(),
      },
    });
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
        {/* TODO 인풋이 아니라 검색창으로 넘어가는 버튼으로 만들어야할듯 */}
        <div className={styles.fieldWrap}>
          <label>
            <p className={`typo-title3 ${styles.labelText}`}>브랜드명</p>
          </label>
          <input
            className={`${styles.inputBrand} typo-body3`}
            type="text"
            value={brandName}
            onChange={handleBrandNameChange}
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
          onClick={handleNext}
          state={isNextDisabled ? "disabled" : "default"}
          disabled={isNextDisabled}
        >
          다음
        </Button>
      </footer>
    </section>
  );
}
