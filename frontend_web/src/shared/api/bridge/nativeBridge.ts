import type {
  AppTabName,
  ApiRequestPayload,
  AppToWebMessage,
  WebToAppMessage,
} from "./nativeBridge.types";

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  timeoutId: number;
};

const pendingRequests = new Map<string, PendingRequest>();

function generateRequestId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function isNativeApp() {
  return typeof window !== "undefined" && !!window.ReactNativeWebView;
}

function postMessageToApp(message: WebToAppMessage) {
  if (!isNativeApp()) {
    throw new Error("현재 앱 브리지를 사용할 수 없는 환경입니다.");
  }

  window.ReactNativeWebView!.postMessage(JSON.stringify(message));
}

export function initNativeBridgeListener() {
  const handleMessage: EventListener = (event) => {
    try {
      const rawData = (event as MessageEvent).data;
      if (typeof rawData !== "string") return;

      const parsed: AppToWebMessage = JSON.parse(rawData);
      if (typeof parsed.id !== "string") return;

      const pending = pendingRequests.get(parsed.id);

      if (!pending) return;

      if (parsed.type === "API_RESPONSE") {
        pending.resolve(parsed.payload);
      } else {
        pending.reject(parsed.payload);
      }

      clearTimeout(pending.timeoutId);
      pendingRequests.delete(parsed.id);
    } catch (error) {
      console.error("[Bridge] 메시지 파싱 실패", error);
    }
  };

  window.addEventListener("message", handleMessage);
  document.addEventListener("message", handleMessage);

  return () => {
    window.removeEventListener("message", handleMessage);
    document.removeEventListener("message", handleMessage);
  };
}

function sendRequestToApp<T>(messageFactory: (id: string) => WebToAppMessage) {
  return new Promise<T>((resolve, reject) => {
    const id = generateRequestId();

    const timeoutId = window.setTimeout(() => {
      pendingRequests.delete(id);
      reject({
        message: "앱 응답 시간이 초과되었습니다.",
        statusCode: 408,
        error: "BRIDGE_TIMEOUT",
      });
    }, 10000);

    pendingRequests.set(id, {
      resolve: resolve as (value: unknown) => void,
      reject,
      timeoutId,
    });

    const message = messageFactory(id);

    try {
      postMessageToApp(message);
    } catch (error) {
      clearTimeout(timeoutId);
      pendingRequests.delete(id);
      reject(error);
    }
  });
}

export function requestToApp<T>(payload: ApiRequestPayload) {
  return sendRequestToApp<T>((id) => ({
    id,
    type: "API_REQUEST",
    payload,
  }));
}

export function syncAppTab(tab: AppTabName) {
  if (!isNativeApp()) return;

  postMessageToApp({
    id: generateRequestId(),
    type: "TAB_SYNC",
    payload: {
      tab,
    },
  });
}
