import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import {
  requestNativeCameraCapture,
  requestNativeGalleryPick,
} from "@/shared/api/bridge/nativeBridge";
import { toast } from "@/shared/commons/toast/toast";
import styles from "@/features/nutrition-entry/styles/NutritionCameraPage.module.css";
import { PATH } from "@/router/path";
import type { NutritionAddLocationState } from "@/shared/api/types/nutrition.dto";
import { uploadCapturedImageToServer } from "@/features/nutrition-entry/api/uploadCapturedImage";

type BridgeCameraError = Error & {
  error?: string;
};

export default function MealCameraPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as NutritionAddLocationState;

  const handleCameraActions = async () => {
    try {
      const capturedImage = await requestNativeCameraCapture({ quality: 0.8 });
      const { uploadedImageUrl } = await uploadCapturedImageToServer(capturedImage);
      navigate(PATH.NUTRITION_ADD, {
        state: {
          ...locationState,
          capturedImage,
          uploadedImageUrl: uploadedImageUrl ?? undefined,
        } satisfies NutritionAddLocationState,
      });
      toast.success("촬영 후 서버 전송이 완료되었어요");
    } catch (error) {
      const bridgeError = error as BridgeCameraError;
      if (bridgeError.error === "CAMERA_CAPTURE_CANCELLED") return;

      toast.warning(bridgeError.message ?? "카메라를 실행하지 못했어요");
    }
  };

  const handleGalleryActions = async () => {
    try {
      const capturedImage = await requestNativeGalleryPick({ quality: 0.8 });
      const { uploadedImageUrl } = await uploadCapturedImageToServer(capturedImage);
      navigate(PATH.NUTRITION_ADD, {
        state: {
          ...locationState,
          capturedImage,
          uploadedImageUrl: uploadedImageUrl ?? undefined,
        } satisfies NutritionAddLocationState,
      });
      toast.success("선택한 사진이 서버에 전송되었어요");
    } catch (error) {
      const bridgeError = error as BridgeCameraError;
      if (bridgeError.error === "GALLERY_PICK_CANCELLED") return;

      toast.warning(bridgeError.message ?? "갤러리를 열지 못했어요");
    }
  };

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
        <div className={styles.actionButtons}>
          <Button
            variant="filled"
            state="default"
            size="small"
            color="primary"
            onClick={handleCameraActions}
          >
            촬영하기
          </Button>
          <Button
            variant="outlined"
            state="default"
            size="small"
            color="assistive"
            onClick={handleGalleryActions}
          >
            갤러리에서 선택
          </Button>
        </div>
      </main>
    </section>
  );
}
