import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BridgeHandledError } from "@/src/shared/api/bridge/bridgeError";
import {
  getPendingCameraCapturePayload,
  hasPendingCameraCaptureSession,
  rejectCameraCaptureSession,
  resolveCameraCaptureSession,
} from "@/src/shared/api/bridge/cameraCaptureSession";
import type { BridgeCameraCaptureRequestPayload } from "@/src/shared/api/bridge/bridge.types";

type CameraCaptureMode = NonNullable<BridgeCameraCaptureRequestPayload["mode"]>;

const DEFAULT_CAPTURE_MODE: CameraCaptureMode = "NUTRITION_LABEL";

const CAMERA_MODE_CONFIG: Record<
  CameraCaptureMode,
  {
    guideText: string | null;
    showGalleryButton: boolean;
    frameAspectRatio: number | null;
  }
> = {
  NUTRITION_LABEL: {
    guideText: "영양성분표가 선명하게 보이도록 촬영해주세요",
    showGalleryButton: true,
    frameAspectRatio: 0.68,
  },
  MENU_BOARD: {
    guideText: "메뉴판을 화면에 맞춰주세요",
    showGalleryButton: false,
    frameAspectRatio: 0.68,
  },
  FOOD: {
    guideText: "음식이 프레임 안에 잘 보이도록 촬영해주세요",
    showGalleryButton: true,
    frameAspectRatio: 1,
  },
  GENERAL: {
    guideText: null,
    showGalleryButton: true,
    frameAspectRatio: null,
  },
};

function mapQualityPrioritization(quality?: number): "speed" | "balanced" | "quality" {
  if (quality === undefined) return "balanced";
  if (quality >= 0.9) return "quality";
  if (quality <= 0.4) return "speed";
  return "balanced";
}

function resolvePhotoUri(path: string) {
  return path.startsWith("file://") ? path : `file://${path}`;
}

function resolveFileNameFromUri(uri: string) {
  const sanitized = uri.split("?")[0];
  const segments = sanitized.split("/");
  const fileName = segments[segments.length - 1];
  if (!fileName) return null;
  return fileName;
}

function LoadingView() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#ff8a00" />
    </View>
  );
}

export default function CameraCaptureScreen() {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const cameraRef = useRef<Camera>(null);
  const [isPreparing, setIsPreparing] = useState(true);
  const [isDeviceDetectionFinished, setIsDeviceDetectionFinished] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const capturePayload = useMemo(() => getPendingCameraCapturePayload(), []);
  const captureMode = useMemo<CameraCaptureMode>(
    () => capturePayload?.mode ?? DEFAULT_CAPTURE_MODE,
    [capturePayload?.mode],
  );
  const cameraModeConfig = useMemo(() => CAMERA_MODE_CONFIG[captureMode], [captureMode]);
  const shouldShowOverlay = useMemo(
    () => cameraModeConfig.guideText !== null || cameraModeConfig.frameAspectRatio !== null,
    [cameraModeConfig.frameAspectRatio, cameraModeConfig.guideText],
  );
  const photoQualityBalance = useMemo(
    () => mapQualityPrioritization(capturePayload?.quality),
    [capturePayload?.quality],
  );
  const device = useCameraDevice("back");

  const closeWithCancellation = useCallback(() => {
    rejectCameraCaptureSession(
      new BridgeHandledError("촬영이 취소되었어요.", 499, "CAMERA_CAPTURE_CANCELLED"),
    );
    router.back();
  }, []);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        if (!hasPendingCameraCaptureSession()) {
          router.back();
          return;
        }

        const currentStatus = await Camera.getCameraPermissionStatus();
        const nextStatus =
          currentStatus === "granted" ? currentStatus : await Camera.requestCameraPermission();

        if (!isMounted) return;

        if (nextStatus !== "granted") {
          rejectCameraCaptureSession(
            new BridgeHandledError("카메라 권한이 필요해요.", 403, "CAMERA_PERMISSION_DENIED"),
          );
          router.back();
          return;
        }

        setIsPreparing(false);
      } catch {
        if (!isMounted) return;
        rejectCameraCaptureSession(
          new BridgeHandledError("카메라를 준비하지 못했어요.", 500, "CAMERA_PREPARE_FAILED"),
        );
        router.back();
      }
    })();

    return () => {
      isMounted = false;

      if (!hasPendingCameraCaptureSession()) return;

      rejectCameraCaptureSession(
        new BridgeHandledError("촬영이 취소되었어요.", 499, "CAMERA_CAPTURE_CANCELLED"),
      );
    };
  }, []);

  useEffect(() => {
    if (isPreparing) {
      setIsDeviceDetectionFinished(false);
      return;
    }

    if (device) {
      setIsDeviceDetectionFinished(true);
      return;
    }

    setIsDeviceDetectionFinished(false);
    const timeoutId = setTimeout(() => {
      setIsDeviceDetectionFinished(true);
    }, 400);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [device, isPreparing]);

  useEffect(() => {
    if (isPreparing || device || !isDeviceDetectionFinished) return;

    rejectCameraCaptureSession(
      new BridgeHandledError(
        "사용 가능한 카메라를 찾지 못했어요.",
        500,
        "CAMERA_DEVICE_UNAVAILABLE",
      ),
    );
    router.back();
  }, [device, isDeviceDetectionFinished, isPreparing]);

  const handleCapturePress = useCallback(async () => {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);

    try {
      const photo = await cameraRef.current.takePhoto({
        flash: "off",
      });
      const uri = resolvePhotoUri(photo.path);

      resolveCameraCaptureSession({
        uri,
        width: photo.width,
        height: photo.height,
        fileName: resolveFileNameFromUri(uri),
        fileSize: null,
        mimeType: "image/jpeg",
        base64: null,
      });

      router.back();
    } catch {
      rejectCameraCaptureSession(
        new BridgeHandledError("촬영 결과를 가져오지 못했어요.", 500, "CAMERA_CAPTURE_FAILED"),
      );
      router.back();
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const handleGalleryPress = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setIsProcessing(false);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        quality: capturePayload?.quality ?? 0.8,
        allowsEditing: false,
        allowsMultipleSelection: false,
        exif: false,
        base64: false,
        mediaTypes: "images",
      });

      if (result.canceled) {
        setIsProcessing(false);
        return;
      }

      if (result.assets.length !== 1) {
        rejectCameraCaptureSession(
          new BridgeHandledError("이미지는 1장만 첨부할 수 있어요.", 400, "IMAGE_COUNT_EXCEEDED"),
        );
        router.back();
        return;
      }

      const asset = result.assets[0];
      if (!asset) {
        rejectCameraCaptureSession(
          new BridgeHandledError("선택한 사진을 가져오지 못했어요.", 500, "GALLERY_PICK_FAILED"),
        );
        router.back();
        return;
      }

      resolveCameraCaptureSession({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
        mimeType: asset.mimeType,
        base64: asset.base64,
      });
      router.back();
    } finally {
      setIsProcessing(false);
    }
  }, [capturePayload?.quality, isProcessing]);

  if (isPreparing) {
    return <LoadingView />;
  }

  if (!device) {
    return <LoadingView />;
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && !isProcessing}
        photo={true}
        photoQualityBalance={photoQualityBalance}
      />

      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.spacer} />
        <Pressable
          style={styles.closeButton}
          onPress={closeWithCancellation}
          accessibilityRole="button"
          accessibilityLabel="카메라 닫기"
        >
          <Ionicons name="close" size={24} color="#ffffff" />
        </Pressable>
      </View>

      {shouldShowOverlay ? (
        <View style={styles.overlay}>
          {cameraModeConfig.guideText ? (
            <View style={styles.guideCard}>
              <Text style={styles.guideText}>{cameraModeConfig.guideText}</Text>
            </View>
          ) : null}
          {cameraModeConfig.frameAspectRatio ? (
            <View style={[styles.frameBox, { aspectRatio: cameraModeConfig.frameAspectRatio }]}>
              <View style={[styles.frameCorner, styles.cornerTopLeft]} />
              <View style={[styles.frameCorner, styles.cornerTopRight]} />
              <View style={[styles.frameCorner, styles.cornerBottomLeft]} />
              <View style={[styles.frameCorner, styles.cornerBottomRight]} />
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 14) }]}>
        {cameraModeConfig.showGalleryButton ? (
          <Pressable
            style={[styles.sideSlot, styles.galleryButton, isProcessing && styles.disabledButton]}
            onPress={handleGalleryPress}
            disabled={isProcessing}
            accessibilityRole="button"
            accessibilityLabel="갤러리에서 사진 선택"
          >
            <Ionicons name="images-outline" size={24} color="#ffffff" />
          </Pressable>
        ) : (
          <View style={styles.sideSlot} />
        )}
        <Pressable
          style={[styles.captureOuter, isProcessing && styles.disabledButton]}
          onPress={handleCapturePress}
          disabled={isProcessing}
          accessibilityRole="button"
          accessibilityLabel="사진 촬영"
        >
          <View style={styles.captureInner} />
        </Pressable>
        <View style={styles.sideSlot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
    backgroundColor: "black",
  },
  spacer: {
    width: 28,
    height: 58,
  },
  closeButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
    marginBottom: 30,
  },
  guideCard: {
    marginBottom: 20,
    backgroundColor: "#ffe9d5",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  guideText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#000",
  },
  frameBox: {
    width: "82%",
    position: "relative",
  },
  frameCorner: {
    position: "absolute",
    width: 58,
    height: 58,
    borderColor: "#ffffff",
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 20,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.86)",
    padding: 27,
  },
  sideSlot: {
    width: 44,
    height: 44,
  },
  galleryButton: {
    borderRadius: 100,
    backgroundColor: "rgba(255, 255, 255, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 9,
    borderColor: "#ff8a00",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 30,
    backgroundColor: "#ffffff",
  },
  disabledButton: {
    opacity: 0.6,
  },
});
