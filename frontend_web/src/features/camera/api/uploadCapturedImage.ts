import { requestNativeImageUpload } from "@/shared/api/bridge/nativeBridge";
import type { CapturedImage } from "@/shared/api/types/api.dto";

const END_POINT = {
  IMAGE_UPLOAD: "/home/uploadMealImage",
  FOOD_ANALYSIS: "/home/recognizeFoodImage",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function resolveUploadedImageUrl(response: unknown) {
  if (!isRecord(response)) return null;

  const directCandidates = [response.image, response.imageUrl, response.url, response.fileUrl];
  for (const candidate of directCandidates) {
    const found = readString(candidate);
    if (found) return found;
  }

  if (!isRecord(response.data)) return null;

  const dataCandidates = [
    response.data.image,
    response.data.imageUrl,
    response.data.url,
    response.data.fileUrl,
  ];
  for (const candidate of dataCandidates) {
    const found = readString(candidate);
    if (found) return found;
  }

  return null;
}

// 서버로 이미지를 전송하는 로직
export async function uploadCapturedImageToServer(capturedImage: CapturedImage) {
  const response = await requestNativeImageUpload<string[]>({
    endpoint: END_POINT.FOOD_ANALYSIS,
    fileUri: capturedImage.uri,
    fileName: capturedImage.fileName,
    mimeType: capturedImage.mimeType,
    fieldName: "image",
    method: "POST",
  });

  return response;
}
