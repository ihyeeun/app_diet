import { useNavigate } from "react-router-dom";

import styles from "@/features/camera/CameraPage.module.css";
// import { CameraLoading } from "@/features/camera/components/CameraLoading";
import { uploadCapturedImageToServer } from "@/features/nutrient-entry/api/uploadCapturedImage";
import { requestNativeCameraCapture } from "@/shared/api/bridge/nativeBridge";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { toast } from "@/shared/commons/toast/toast";

type BridgeCameraError = Error & {
  error?: string;
};

export default function MenuBoardCameraPage() {
  const navigate = useNavigate();

  // TODO 여기서 param으로 넘어온 dateKey, MealType, foodName, BrandName? 받아서 넘기기

  const handleCameraActions = async () => {
    try {
      const capturedImage = await requestNativeCameraCapture({
        quality: 0.8,
        mode: "MENU_BOARD",
      });
      const { uploadedImageUrl } = await uploadCapturedImageToServer(capturedImage);
      // navigate(PATH.NUTRIENT_ADD, {
      // });
      toast.success("촬영 후 서버 전송이 완료되었어요");
    } catch (error) {
      const bridgeError = error as BridgeCameraError;
      if (bridgeError.error === "CAMERA_CAPTURE_CANCELLED") return;

      toast.warning(bridgeError.message ?? "카메라를 실행하지 못했어요");
    }
  };

  // if (isPending) {
  //   return <CameraLoading description="영양성분을 확인하고 있어요" />;
  // }

  return (
    <section className={styles.page}>
      <PageHeader title="음식 촬영" onBack={() => navigate(-1)} />

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
