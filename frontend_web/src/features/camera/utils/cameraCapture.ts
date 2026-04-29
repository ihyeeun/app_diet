export const DEFAULT_CAMERA_CAPTURE_QUALITY = 1;
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
type RecognitionDomain = "NUTRITION_LABEL" | "FOOD" | "MENU_BOARD";

type RecognitionErrorCopy = {
  title: string;
  fallbackMessage: string;
  retryGuide: string;
};

type CapturedImagePreviewSource = {
  uri: string;
  mimeType: string | null;
  base64: string | null;
};

const RECOGNITION_ERROR_COPY: Record<RecognitionDomain, RecognitionErrorCopy> = {
  NUTRITION_LABEL: {
    title: "영양성분 인식에 실패했어요",
    fallbackMessage: "영양성분 분석에 실패했어요.",
    retryGuide: "영양성분표 전체가 선명하게 보이도록 다시 촬영해주세요.",
  },
  FOOD: {
    title: "음식을 인식하기 어려웠어요",
    fallbackMessage: "음식 메뉴 분석에 실패했어요.",
    retryGuide: "음식이 잘 보이도록 다시 촬영해주세요.",
  },
  MENU_BOARD: {
    title: "메뉴판 인식에 실패했어요",
    fallbackMessage: "메뉴판 분석에 실패했어요.",
    retryGuide: "메뉴판 전체가 선명하게 보이도록 다시 촬영해주세요.",
  },
};

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
  domain: RecognitionDomain,
  error?: unknown,
): CameraCaptureErrorFeedback {
  // const statusCode = (error as BridgeCameraError)?.statusCode;
  // if (typeof statusCode === "number" && statusCode >= 500) {
  //   return {
  //     title: "서버 응답이 불안정해요",
  //     description: "잠시 후 다시 시도해주세요.",
  //   };
  // }

  const copy = RECOGNITION_ERROR_COPY[domain];

  return {
    title: copy.title,
    description: `${copy.retryGuide} ${getErrorMessage(error, copy.fallbackMessage)}`,
  };
}

export function getCapturedImagePreviewSrc(source: CapturedImagePreviewSource) {
  if (source.base64 && source.base64.trim().length > 0) {
    const mimeType = source.mimeType ?? "image/jpeg";
    return `data:${mimeType};base64,${source.base64}`;
  }

  return source.uri;
}
