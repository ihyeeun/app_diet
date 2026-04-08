import { useNavigate } from "react-router-dom";

import styles from "@/features/camera/CameraPage.module.css";
import {
  DEFAULT_CAMERA_CAPTURE_QUALITY,
  getCameraCaptureErrorMessage,
  isCameraCaptureCancelled,
} from "@/features/camera/utils/cameraCapture";
import { uploadCapturedImageToServer } from "@/features/nutrient-entry/api/uploadCapturedImage";
import { requestNativeCameraCapture } from "@/shared/api/bridge/nativeBridge";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";

export default function MenuBoardCameraPage() {
  const navigate = useNavigate();

  const handleCameraActions = async () => {
    try {
      const capturedImage = await requestNativeCameraCapture({
        quality: DEFAULT_CAMERA_CAPTURE_QUALITY,
        mode: "MENU_BOARD",
      });
      await uploadCapturedImageToServer(capturedImage);
      toast.success("촬영 후 서버 전송이 완료되었어요");
    } catch (error) {
      if (isCameraCaptureCancelled(error)) return;

      toast.warning(getCameraCaptureErrorMessage(error));
    }
  };

  return (
    <section className={styles.page}>
      <PageHeader title="메뉴판 촬영" onBack={() => navigate(-1)} />

      <main className={styles.main}>
        <div className={styles.content}>
          <img src="/icons/Camera.svg" alt="카메라 아이콘" className={styles.image} />
          <p className="typo-title1">
            메뉴판 전체가 선명하게
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
