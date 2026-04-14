import { requestNativeImageUpload } from "@/shared/api/bridge/nativeBridge";
import type { CapturedImage, FoodImageRecognitionResponseDto } from "@/shared/api/types/api.dto";
import { type ApiResponse, isApiSuccess } from "@/shared/api/types/apiResponse.types";

const END_POINT = {
  IMAGE_UPLOAD: "/home/uploadMealImage",
  FOOD_ANALYSIS: "/home/recognizeFoodImage",
};

// 서버로 이미지를 전송하는 로직
export async function uploadCapturedImageToServer(capturedImage: CapturedImage) {
  const response = await requestNativeImageUpload<ApiResponse<FoodImageRecognitionResponseDto>>({
    endpoint: END_POINT.FOOD_ANALYSIS,
    fileUri: capturedImage.uri,
    fileName: capturedImage.fileName,
    mimeType: capturedImage.mimeType,
    fieldName: "image",
    method: "POST",
  });

  if (!isApiSuccess(response)) {
    const error = new Error(response.message ?? "음식 이미지 분석 실패");
    Object.assign(error, response);
    throw error;
  }

  return response.data;
}
