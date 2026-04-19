import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import styles from "@/features/camera/CameraPage.module.css";
import { CameraLoading } from "@/features/camera/components/CameraLoading";
import { useFoodImageMutation } from "@/features/camera/hooks/mutations/useImageRecognitionMutation";
import {
  type CameraCaptureErrorFeedback,
  DEFAULT_CAMERA_CAPTURE_QUALITY,
  getCameraCaptureErrorFeedback,
  getRecognitionErrorFeedback,
  isCameraCaptureCancelled,
} from "@/features/camera/utils/cameraCapture";
import { useTodayMealRecordRegisterMutation } from "@/features/meal-record/hooks/mutations/useTodayMealRecordMutation";
import {
  formatMenuDraftKey,
  useMenuDraftStore,
  useMenuDraftUpsert,
} from "@/features/meal-record/stores/menuDraft.store";
import { getMealType, getSafeDateKey } from "@/features/meal-record/utils/mealRecord.queryParams";
import { getMealRecordPath } from "@/router/pathHelpers";
import { requestNativeCameraCapture } from "@/shared/api/bridge/nativeBridge";
import type { MealTime } from "@/shared/api/types/api.dto";
import { Button } from "@/shared/commons/button/Button";
import { PageHeader } from "@/shared/commons/header/PageHeader";
import { CheckButtonModal } from "@/shared/commons/modals/CheckButtonModal";
import { toast } from "@/shared/commons/toast/toast";

export default function FoodCameraPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isUploading, setIsUploading] = useState(false);
  const [captureErrorFeedback, setCaptureErrorFeedback] = useState<CameraCaptureErrorFeedback | null>(
    null,
  );

  const { mutateAsync: uploadImage } = useFoodImageMutation();
  const { mutateAsync: mealRegisterAsync } = useTodayMealRecordRegisterMutation();

  const dateKey = getSafeDateKey(searchParams.get("date"));
  const mealType = getMealType(searchParams.get("mealType"));
  const draftKey = formatMenuDraftKey(dateKey, mealType);

  const upsertMenu = useMenuDraftUpsert();

  const handleCameraActions = async () => {
    if (isUploading) return;

    let capturedImage: Awaited<ReturnType<typeof requestNativeCameraCapture>>;
    try {
      capturedImage = await requestNativeCameraCapture({
        quality: DEFAULT_CAMERA_CAPTURE_QUALITY,
        mode: "FOOD",
      });
    } catch (error) {
      if (isCameraCaptureCancelled(error)) return;
      setCaptureErrorFeedback(getCameraCaptureErrorFeedback(error));
      return;
    }

    try {
      setIsUploading(true);
      const imageData = await uploadImage(capturedImage);

      if (!imageData?.menu_ids?.length) {
        setCaptureErrorFeedback(
          getRecognitionErrorFeedback(new Error("메뉴를 인식하지 못했어요."), "FOOD"),
        );
        return;
      }

      imageData.menu_ids.forEach((id, idx) => {
        upsertMenu({
          key: draftKey,
          id,
          quantity: imageData.menu_quantities[idx] ?? 1,
        });
      });

      const latestMenus = useMenuDraftStore.getState().drafts[draftKey]?.existingMenus ?? [];

      await mealRegisterAsync({
        date: dateKey,
        time: Number(mealType) as MealTime,
        menu_ids: latestMenus.map((m) => m.id),
        menu_quantities: latestMenus.map((m) => m.quantity),
        image: imageData.image_url,
      });

      toast.success("촬영한 사진의 메뉴가 기록되었어요.");
      navigate(getMealRecordPath(dateKey, mealType), { replace: true });
    } catch (error) {
      setCaptureErrorFeedback(getRecognitionErrorFeedback(error, "FOOD"));
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

      <CheckButtonModal
        open={captureErrorFeedback !== null}
        onOpenChange={(open) => {
          if (!open) setCaptureErrorFeedback(null);
        }}
        title={captureErrorFeedback?.title ?? ""}
        description={captureErrorFeedback?.description}
      />
    </section>
  );
}
