import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { uploadCapturedImageToServer } from "@/features/camera/api/uploadCapturedImage";
import styles from "@/features/camera/CameraPage.module.css";
import { CameraLoading } from "@/features/camera/components/CameraLoading";
import {
  DEFAULT_CAMERA_CAPTURE_QUALITY,
  getCameraCaptureErrorMessage,
  isCameraCaptureCancelled,
} from "@/features/camera/utils/cameraCapture";
import { requestNativeCameraCapture } from "@/shared/api/bridge/nativeBridge";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";

export default function FoodCameraPage() {
  const navigate = useNavigate();
  const [img, setImage] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const handleCameraActions = async () => {
    if (isUploading) return;

    try {
      const Image = await requestNativeCameraCapture({
        quality: DEFAULT_CAMERA_CAPTURE_QUALITY,
        mode: "FOOD",
      });

      setImage(Image.uri);
      setIsUploading(true);
      await uploadCapturedImageToServer(Image);
      toast.success("촬영 후 서버 전송이 완료되었어요");
    } catch (error) {
      if (isCameraCaptureCancelled(error)) return;

      toast.warning(getCameraCaptureErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className={styles.page}>
      <PageHeader title="음식촬영" onBack={() => navigate(-1)} />

      {isUploading ? (
        <CameraLoading description="촬영한 사진을 분석 중이에요." />
      ) : (
        <main className={styles.main}>
          <div className={styles.content}>
            {img !== "" ? <img src={img} alt="촬영한 음식 이미지" /> : ""}
            <img src="/icons/food-icon.svg" alt="카메라 아이콘" className={styles.image} />
            <p className="typo-title1">
              음식이 잘 보이도록
              <br />
              촬영해주세요
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
      )}
    </section>
  );
}
