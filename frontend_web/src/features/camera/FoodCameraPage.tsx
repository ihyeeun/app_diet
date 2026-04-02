import { useNavigate } from "react-router-dom";

import styles from "@/features/camera/CameraPage.module.css";
import { PATH } from "@/router/path";
import {
  requestNativeCameraCapture,
  requestNativeGalleryPick,
} from "@/shared/api/bridge/nativeBridge";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";

type BridgeCameraError = Error & {
  error?: string;
};

export default function FoodCameraPage() {
  const navigate = useNavigate();

  const handleCameraActions = async () => {
    try {
      const capturedImage = await requestNativeCameraCapture({
        quality: 0.8,
        mode: "FOOD",
      });
      // const { uploadedImageUrl } = await uploadCapturedImageToServer(capturedImage);
      // navigate(PATH.NUTRIENT_ADD, {});
      toast.success("촬영 후 서버 전송이 완료되었어요");
    } catch (error) {
      const bridgeError = error as BridgeCameraError;
      if (bridgeError.error === "CAMERA_CAPTURE_CANCELLED") return;

      toast.warning(bridgeError.message ?? "카메라를 실행하지 못했어요");
    }
  };

  return (
    <section className={styles.page}>
      <PageHeader title="영양정보 촬영" onBack={() => navigate(-1)} />

      <main className={styles.main}>
        <div className={styles.content}>
          <img src="/icons/Camera.svg" alt="카메라 아이콘" className={styles.image} />
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
        </div>
      </main>
    </section>
  );
}
