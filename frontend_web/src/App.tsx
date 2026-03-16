import { useEffect } from "react";
import "./App.css";
import AppRouter from "./router/AppRouter";
import { initNativeBridgeListener } from "@/shared/api/bridge/nativeBridge";

export default function App() {
  useEffect(() => {
    const cleanup = initNativeBridgeListener();
    return cleanup;
  }, []);

  return (
    <div className="app-container">
      <AppRouter />
    </div>
  );
}
