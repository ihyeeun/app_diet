import { router } from "expo-router";
import { BridgeHandledError } from "./bridgeError";
import type { BridgeCameraCaptureRequestPayload } from "./bridge.types";

export type CameraCaptureSessionResult = {
  uri: string;
  width: number;
  height: number;
  fileName?: string | null;
  mimeType?: string | null;
  fileSize?: number | null;
  base64?: string | null;
};

type PendingCameraCaptureSession = {
  payload?: BridgeCameraCaptureRequestPayload;
  resolve: (value: CameraCaptureSessionResult) => void;
  reject: (reason?: unknown) => void;
};

let pendingCameraCaptureSession: PendingCameraCaptureSession | null = null;

function takePendingCameraCaptureSession() {
  const session = pendingCameraCaptureSession;
  pendingCameraCaptureSession = null;
  return session;
}

export function hasPendingCameraCaptureSession() {
  return pendingCameraCaptureSession !== null;
}

export function getPendingCameraCapturePayload() {
  return pendingCameraCaptureSession?.payload;
}

export function beginCameraCaptureSession(payload?: BridgeCameraCaptureRequestPayload) {
  if (pendingCameraCaptureSession) {
    throw new BridgeHandledError(
      "이전 카메라 요청이 아직 처리 중이에요.",
      409,
      "CAMERA_CAPTURE_IN_PROGRESS",
    );
  }

  return new Promise<CameraCaptureSessionResult>((resolve, reject) => {
    pendingCameraCaptureSession = {
      payload,
      resolve,
      reject,
    };

    router.push("/camera-capture");
  });
}

export function resolveCameraCaptureSession(result: CameraCaptureSessionResult) {
  const session = takePendingCameraCaptureSession();
  if (!session) return;

  session.resolve(result);
}

export function rejectCameraCaptureSession(reason: unknown) {
  const session = takePendingCameraCaptureSession();
  if (!session) return;

  session.reject(reason);
}
