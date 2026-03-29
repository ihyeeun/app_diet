import { PageHeader } from "@/shared/commons/header/PageHeader";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./styles/NutrientAddPage.module.css";
import { Button } from "@/shared/commons/button/Button";
import { useState, type ChangeEvent } from "react";
import { PATH } from "@/router/path";
import type { NutrientAddLocationState } from "@/shared/api/types/api.dto";

function formatBytesToMb(fileSize: number) {
  return `${(fileSize / (1024 * 1024)).toFixed(2)}MB`;
}

export default function NutrientAddPage() {
  const navigation = useNavigate();
  const location = useLocation();
  const contextState = (location.state ?? {}) as NutrientAddLocationState;
  const brandName = (contextState.brandName ?? "").trim();
  const capturedImage = contextState.capturedImage;
  const uploadedImageUrl = contextState.uploadedImageUrl;
  const [foodName, setFoodName] = useState((contextState.foodName ?? "").trim());

  const handleFoodNameChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setFoodName(event.target.value);
  };

  const handleOpenBrandSearch = () => {
    navigation(PATH.BRAND_SEARCH, {
      replace: true,
      state: {
        ...contextState,
        brandName,
        foodName,
      } satisfies NutrientAddLocationState,
    });
  };

  const isNextDisabled = !foodName.trim();

  const handleNext = () => {
    if (isNextDisabled) return;

    navigation(PATH.NUTRIENT_ADD_DETAIL, {
      state: {
        ...contextState,
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
        {capturedImage ? (
          <section className={styles.imageInfoSection} aria-label="선택된 이미지 정보">
            <p className={`typo-label3 ${styles.imageInfoTitle}`}>선택된 이미지</p>
            <p className={`typo-label4 ${styles.imageInfoText}`}>
              {capturedImage.fileName ?? "이름 없는 이미지"}
            </p>
            <p className={`typo-label4 ${styles.imageInfoSubText}`}>
              {capturedImage.mimeType ?? "image/jpeg"} ·{" "}
              {capturedImage.fileSize !== null
                ? formatBytesToMb(capturedImage.fileSize)
                : "용량 미확인"}
            </p>
            <p className={`typo-label4 ${styles.imageInfoSubText}`}>
              {uploadedImageUrl ? "서버 전송 완료" : "서버 전송 URL 미확인"}
            </p>
          </section>
        ) : null}

        <div className={styles.fieldWrap}>
          <label>
            <p className={`typo-title3 ${styles.labelText}`}>브랜드명</p>
          </label>
          <button
            type="button"
            className={styles.inputBrandButton}
            onClick={handleOpenBrandSearch}
            aria-label="브랜드 검색 화면 열기"
          >
            <span
              className={`typo-body3 ${brandName ? styles.inputBrandValue : styles.inputBrandPlaceholder}`}
            >
              {brandName || "등록하고 싶은 브랜드를 검색하세요"}
            </span>
          </button>
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
