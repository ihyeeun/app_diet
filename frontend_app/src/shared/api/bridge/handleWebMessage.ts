import type { RefObject } from "react";
import type { WebView, WebViewMessageEvent } from "react-native-webview";
import axios from "axios";
import { router } from "expo-router";
import type { WebToAppMessage } from "./bridge.types";
import { sendToWeb } from "./sendToWeb";
import { requestFromWeb } from "./requestFromWeb";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isWebToAppMessage(value: unknown): value is WebToAppMessage {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;

  if (value.type === "API_REQUEST") {
    if (!isRecord(value.payload)) return false;
    if (typeof value.payload.endpoint !== "string") return false;
    if (typeof value.payload.method !== "string") return false;
    return true;
  }

  if (value.type === "TAB_SYNC") {
    if (!isRecord(value.payload)) return false;

    return (
      value.payload.tab === "home" ||
      value.payload.tab === "recommend" ||
      value.payload.tab === "compare" ||
      value.payload.tab === "profile"
    );
  }

  return false;
}

export async function handleWebMessage(
  event: WebViewMessageEvent,
  webViewRef: RefObject<WebView | null>,
) {
  let requestId = "unknown";

  try {
    const rawMessage: unknown = JSON.parse(event.nativeEvent.data);
    if (!isWebToAppMessage(rawMessage)) return;
    const message = rawMessage;
    requestId = message.id;

    if (message.type === "TAB_SYNC") {
      router.replace(`/(tabs)/${message.payload.tab}`);
      return;
    }

    const result = await requestFromWeb(message.payload);

    sendToWeb(webViewRef, {
      id: requestId,
      type: "API_RESPONSE",
      payload: result,
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverData = error.response?.data;

      sendToWeb(webViewRef, {
        id: requestId,
        type: "API_ERROR",
        payload: {
          message: serverData?.message ?? "요청 처리 중 오류가 발생했습니다.",
          statusCode: serverData?.statusCode ?? error.response?.status ?? 500,
          error: serverData?.error ?? "API_REQUEST_FAILED",
        },
      });
      return;
    }

    sendToWeb(webViewRef, {
      id: requestId,
      type: "API_ERROR",
      payload: {
        message: "앱 내부 처리 중 오류가 발생했습니다.",
        statusCode: 500,
        error: "APP_INTERNAL_ERROR",
      },
    });
  }
}
