import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

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
const BrandMenuSearch = lazy(() => import("@/features/search/brand/BrandMenuSearch"));
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

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path={PATH.ROOT} element={<HomePage />} />
          <Route path={PATH.HOME} element={<HomePage />} />

          <Route path={PATH.ONBOARDING} element={<OnboardingPage />} />

          <Route path={PATH.RECOMMEND} element={<RecommendPage />} />

          <Route path={PATH.SETTINGS} element={<SettingsPage />} />
          <Route path={PATH.SETTINGS_FEEDBACK} element={<SettingsFeedbackPage />} />
          <Route path={PATH.SETTINGS_SUB_CODE} element={<SettingsSubCodePage />} />
          <Route path={PATH.TERMS} element={<TermsPage />} />

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
          <Route path={PATH.BRAND_MENU_SEARCH} element={<BrandMenuSearch />} />

          <Route path={PATH.CHAT} element={<ChatPage />} />

          <Route path={PATH.DIARY} element={<DiaryPage />} />

          <Route path={PATH.PROFILE} element={<ProfilePage />} />
          <Route path={PATH.GOAL_EDIT} element={<GoalEditPage />} />

          <Route path="*" element={<Navigate replace to={PATH.HOME} />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
