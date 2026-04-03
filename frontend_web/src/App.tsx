import "./App.css";

import { useEffect } from "react";

import { useGetProfileQuery } from "@/features/profile/hooks/queries/useProfileQuery";
import { initNativeBridgeListener, isNativeApp } from "@/shared/api/bridge/nativeBridge";
import {
  useSetTargets,
  useTargetsLoadedState,
  useTargetsState,
} from "@/shared/stores/targetNutrient.store";
import { initInputCharacterRestriction } from "@/shared/utils/inputCharacterRestriction";

import AppRouter from "./router/AppRouter";

export default function App() {
  useSyncTargetsFromProfile();

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

function useSyncTargetsFromProfile() {
  const hasTargetsLoaded = useTargetsLoadedState();
  const targets = useTargetsState();
  const setTargets = useSetTargets();

  const shouldFetchProfile = hasTargetsLoaded && !targets && isNativeApp();
  const { data: profile } = useGetProfileQuery({ enabled: shouldFetchProfile });

  useEffect(() => {
    if (!profile || targets) {
      return;
    }

    setTargets({
      target_calories: profile.target_calories,
      target_ratio: profile.target_ratio,
    });
  }, [profile, setTargets, targets]);
}
