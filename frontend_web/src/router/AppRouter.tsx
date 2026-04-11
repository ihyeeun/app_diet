import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";

import { useGetProfileQuery } from "@/features/profile/hooks/queries/useProfileQuery";
import { isNativeApp } from "@/shared/api/bridge/nativeBridge";
import {
  useSetTargets,
  useTargetsLoadedState,
  useTargetsState,
} from "@/shared/stores/targetNutrient.store";

import { PATH } from "./path";

const HomePage = lazy(() => import("@/features/home/HomePage"));
const TodayMealScorePage = lazy(() => import("@/features/home/TodayMealScorePage"));
const MealDetailPage = lazy(() => import("@/features/meal-record/MealDetailPage"));
const MealRecordPage = lazy(() => import("@/features/meal-record/MealRecordPage"));
const NutrientAddPage = lazy(() => import("@/features/nutrient-entry/NutrientAddPage"));
const NutrientModifyPage = lazy(() => import("@/features/nutrient-entry/NutrientModifyPage"));
const NutrientRegisterPage = lazy(() => import("@/features/nutrient-entry/NutrientRegisterPage"));
const OnboardingPage = lazy(() => import("@/features/onboarding/OnboardingPage"));
const RecommendPage = lazy(() => import("@/features/recommend/RecommendPage"));
const BrandSearch = lazy(() => import("@/features/search/brand/BrandSearch"));
const MealSearchPage = lazy(() => import("@/features/search/menu-record/MealSearchPage"));
const SettingsFeedbackPage = lazy(() => import("@/features/settings/SettingsFeedbackPage"));
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage"));
const SettingsSubCodePage = lazy(() => import("@/features/settings/SettingsSubCodePage"));
const TermsPage = lazy(() => import("@/features/terms/TermsPage"));
const MenuBoardCameraPage = lazy(() => import("@/features/camera/MenuBoardCameraPage"));
const NutrientCameraPage = lazy(() => import("@/features/camera/NutrientCameraPage"));
const FoodCameraPage = lazy(() => import("@/features/camera/FoodCameraPage"));
const ProfilePage = lazy(() => import("@/features/profile/ProfilePage"));
const GoalEditPage = lazy(() => import("@/features/profile/GoalEditPage"));
const ChatPage = lazy(() => import("@/features/chat/ChatPage"));
const DiaryPage = lazy(() => import("@/features/diary/DiaryPage"));

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

function PrivateRouteLayout() {
  useSyncTargetsFromProfile();
  return <Outlet />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path={PATH.TERMS} element={<TermsPage />} />

          <Route element={<PrivateRouteLayout />}>
            <Route path={PATH.ROOT} element={<HomePage />} />
            <Route path={PATH.HOME} element={<HomePage />} />

            <Route path={PATH.ONBOARDING} element={<OnboardingPage />} />

            <Route path={PATH.RECOMMEND} element={<RecommendPage />} />

            <Route path={PATH.SETTINGS} element={<SettingsPage />} />
            <Route path={PATH.SETTINGS_FEEDBACK} element={<SettingsFeedbackPage />} />
            <Route path={PATH.SETTINGS_SUB_CODE} element={<SettingsSubCodePage />} />

            <Route path={PATH.TODAY_MEAL_SCORE} element={<TodayMealScorePage />} />

            <Route path={PATH.MEAL_RECORD} element={<MealRecordPage />} />
            <Route path={PATH.MEAL_RECORD_ADD_SEARCH} element={<MealSearchPage />} />
            <Route path={PATH.MEAL_DETAIL} element={<MealDetailPage />} />
            <Route path={PATH.MENU_BOARD_CAMERA} element={<MenuBoardCameraPage />} />
            <Route path={PATH.FOOD_CAMERA} element={<FoodCameraPage />} />

            <Route path={PATH.NUTRIENT_ADD} element={<NutrientAddPage />} />
            <Route path={PATH.NUTRIENT_CAMERA} element={<NutrientCameraPage />} />
            <Route path={PATH.NUTRIENT_ADD_MODIFY} element={<NutrientModifyPage />} />
            <Route path={PATH.NUTRIENT_ADD_REGISTER} element={<NutrientRegisterPage />} />

            <Route path={PATH.BRAND_SEARCH} element={<BrandSearch />} />

            <Route path={PATH.CHAT} element={<ChatPage />} />

            <Route path={PATH.DIARY} element={<DiaryPage />} />

            <Route path={PATH.PROFILE} element={<ProfilePage />} />
            <Route path={PATH.GOAL_EDIT} element={<GoalEditPage />} />

            <Route path="*" element={<Navigate replace to={PATH.HOME} />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
