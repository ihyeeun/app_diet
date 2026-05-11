import { useEffect } from "react";

import { useGetProfileQuery } from "@/features/profile/hooks/queries/useProfileQuery";
import { isNativeApp } from "@/shared/api/bridge/nativeBridge";
import {
  useSetTargets,
  useTargetsLoadedState,
  useTargetsState,
} from "@/shared/stores/targetNutrient.store";

import { getStackflowStackComponent } from "./stackflowRouter";

const StackComponent = getStackflowStackComponent();

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

export function StackflowRuntime() {
  useSyncTargetsFromProfile();

  return <StackComponent />;
}
