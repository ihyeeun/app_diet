export const DEFAULT_CAMERA_CAPTURE_QUALITY = 0.8;
const CAMERA_CAPTURE_CANCELLED_CODE = "CAMERA_CAPTURE_CANCELLED";

type BridgeCameraError = Error & {
  error?: string;
};

export function isCameraCaptureCancelled(error: unknown) {
  return (error as BridgeCameraError)?.error === CAMERA_CAPTURE_CANCELLED_CODE;
}

export function getCameraCaptureErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "카메라를 실행하지 못했어요";
}
