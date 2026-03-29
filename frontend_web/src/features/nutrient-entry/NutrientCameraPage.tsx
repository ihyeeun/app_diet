import { useLocation, useNavigate } from "react-router-dom";

import { PATH } from "@/router/path";
import {
  requestNativeCameraCapture,
  requestNativeGalleryPick,
} from "@/shared/api/bridge/nativeBridge";
import type { NutrientAddLocationState } from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";

import { uploadCapturedImageToServer } from "./api/uploadCapturedImage";
import styles from "./styles/NutrientCameraPage.module.css";

type BridgeCameraError = Error & {
  error?: string;
};

export default function NutrientCameraPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state ?? {}) as NutrientAddLocationState;

  const handleCameraActions = async () => {
    try {
      const capturedImage = await requestNativeCameraCapture({ quality: 0.8 });
      const { uploadedImageUrl } = await uploadCapturedImageToServer(capturedImage);
      navigate(PATH.NUTRIENT_ADD, {
        state: {
          ...locationState,
          capturedImage,
          uploadedImageUrl: uploadedImageUrl ?? undefined,
        } satisfies NutrientAddLocationState,
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
      navigate(PATH.NUTRIENT_ADD, {
        state: {
          ...locationState,
          capturedImage,
          uploadedImageUrl: uploadedImageUrl ?? undefined,
        } satisfies NutrientAddLocationState,
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
      <PageHeader title="영양정보 촬영" onBack={() => navigate(-1)} />

      <main className={styles.main}>
        <div className={styles.cameraWrap}>
          <img src="/icons/Camera.svg" alt="카메라 아이콘" className={styles.cameraIcon} />
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
