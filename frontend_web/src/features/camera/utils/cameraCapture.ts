export const DEFAULT_CAMERA_CAPTURE_QUALITY = 0.8;
const CAMERA_CAPTURE_CANCELLED_CODE = "CAMERA_CAPTURE_CANCELLED";
const CAMERA_PERMISSION_DENIED_CODES = new Set(["CAMERA_PERMISSION_DENIED"]);

type BridgeCameraError = Error & {
  error?: string;
  statusCode?: number;
};

export type CameraCaptureErrorFeedback = {
  title: string;
  description: string;
};
type RecognitionDomain = "NUTRITION_LABEL" | "FOOD";

export function isCameraCaptureCancelled(error: unknown) {
  return (error as BridgeCameraError)?.error === CAMERA_CAPTURE_CANCELLED_CODE;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
}

function isCameraPermissionDenied(error: unknown) {
  return CAMERA_PERMISSION_DENIED_CODES.has((error as BridgeCameraError)?.error ?? "");
}

export function getCameraCaptureErrorMessage(error: unknown) {
  return getErrorMessage(error, "카메라를 실행하지 못했어요");
}

export function getCameraCaptureErrorFeedback(error: unknown): CameraCaptureErrorFeedback {
  if (isCameraPermissionDenied(error)) {
    return {
      title: "카메라 권한이 필요해요",
      description: "설정에서 카메라 권한을 허용한 뒤 다시 촬영해주세요.",
    };
  }

  const message = getCameraCaptureErrorMessage(error);

  return {
    title: "촬영에 실패했어요",
    description: `${message}`,
  };
}

export function getRecognitionErrorFeedback(
  error: unknown,
  domain: RecognitionDomain,
): CameraCaptureErrorFeedback {
  // const statusCode = (error as BridgeCameraError)?.statusCode;
  // if (typeof statusCode === "number" && statusCode >= 500) {
  //   return {
  //     title: "서버 응답이 불안정해요",
  //     description: "잠시 후 다시 시도해주세요.",
  //   };
  // }

  const message = getErrorMessage(
    error,
    domain === "NUTRITION_LABEL" ? "영양성분 분석에 실패했어요." : "음식 메뉴 분석에 실패했어요.",
  );
  const retryGuide =
    domain === "NUTRITION_LABEL"
      ? "영양성분표 전체가 선명하게 보이도록 다시 촬영해주세요."
      : "음식이 잘 보이도록 다시 촬영해주세요.";

  return {
    title: domain === "NUTRITION_LABEL" ? "영양성분 인식에 실패했어요" : "음식 인식에 실패했어요",
    description: `${message} ${retryGuide}`,
  };
}
