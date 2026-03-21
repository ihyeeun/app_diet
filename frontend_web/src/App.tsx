import { useEffect } from "react";
import "./App.css";
import AppRouter from "./router/AppRouter";
import { initNativeBridgeListener } from "@/shared/api/bridge/nativeBridge";
import { initInputCharacterRestriction } from "@/shared/utils/inputCharacterRestriction";

export default function App() {
  useEffect(() => {
    const cleanupNativeBridgeListener = initNativeBridgeListener();
    const cleanupInputCharacterRestriction = initInputCharacterRestriction();

    return () => {
      cleanupInputCharacterRestriction();
      cleanupNativeBridgeListener();
    };
  }, []);

  return (
    <div className="app-container">
      <AppRouter />
    </div>
  );
}
