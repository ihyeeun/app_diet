import "./App.css";

import { useEffect } from "react";

import { initNativeBridgeListener } from "@/shared/api/bridge/nativeBridge";
import { StackflowRuntime } from "@/shared/navigation/StackflowRuntime";
import { initInputCharacterRestriction } from "@/shared/utils/inputCharacterRestriction";

import AppRouter from "./router/AppRouter";

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
      <StackflowRuntime />
      <AppRouter />
    </div>
  );
}
