import type { RefObject } from "react";
import type { WebView } from "react-native-webview";
import type { AppToWebMessage } from "./bridge.types";

export function sendToWeb(webViewRef: RefObject<WebView | null>, message: AppToWebMessage) {
  const json = JSON.stringify(message)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/`/g, "\\`");

  const script = `
    (function() {
      const data = '${json}';
      window.dispatchEvent(new MessageEvent("message", { data }));
      document.dispatchEvent(new MessageEvent("message", { data }));
    })();
    true;
  `;

  webViewRef.current?.injectJavaScript(script);
}
