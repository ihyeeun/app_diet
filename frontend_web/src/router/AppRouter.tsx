import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PATH } from "./path";
import OnboardingPage from "../features/onboarding/OnboardingPage";
import HomePage from "@/features/home/HomePage";
import RecommendPage from "@/features/recommend/RecommendPage";
import ComparePage from "@/features/compare/ComparePage";
import TermsPage from "@/features/terms/TermsPage";
import MealRecordPage from "@/features/meal-record/MealRecordPage";
import MealRecordAddPage from "@/features/meal-record/MealRecordAddPage";
import MealSearchPage from "@/features/search/menu-record/MealSearchPage";
import NutrientAddPage from "@/features/nutrient-entry/NutrientAddPage";
import NutrientCameraPage from "@/features/nutrient-entry/NutrientCameraPage";
import NutrientAddDetailPage from "@/features/nutrient-entry/NutrientAddDetailPage";
import MealCameraPage from "@/features/meal-record/MealCameraPage";
import BrandMenuSearch from "@/features/search/brand/BrandMenuSearch";
import MenuComPareSearchPage from "@/features/search/menu-compare/MenuCompareSearchPage";
import SelectedMenuListPage from "@/features/compare/SelectedMenuListPage";
import MealDetailPage from "@/features/meal-record/MealDetailPage";
import TodayMealScorePage from "@/features/home/TodayMealScorePage";
import BrandSearch from "@/features/search/brand/BrandSearch";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={PATH.ROOT} element={<HomePage />} />
        <Route path={PATH.HOME} element={<HomePage />} />
        <Route path={PATH.ONBOARDING} element={<OnboardingPage />} />
        <Route path={PATH.RECOMMEND} element={<RecommendPage />} />
        <Route path={PATH.COMPARE} element={<ComparePage />} />
        <Route path={PATH.PROFILE} element={<div>Profile</div>} />
        <Route path={PATH.TERMS} element={<TermsPage />} />
        <Route path={PATH.TODAY_MEAL_SCORE} element={<TodayMealScorePage />} />
        <Route path={PATH.MEAL_RECORD} element={<MealRecordPage />} />
        <Route path={PATH.MEAL_RECORD_ADD} element={<MealRecordAddPage />} />
        <Route path={PATH.MEAL_RECORD_ADD_SEARCH} element={<MealSearchPage />} />
        <Route path={PATH.MEAL_RECORD_ADD_SEARCH_DETAIL} element={<MealDetailPage />} />
        <Route path={PATH.MEAL_CAMERA} element={<MealCameraPage />} />
        <Route path={PATH.NUTRIENT_ADD} element={<NutrientAddPage />} />
        <Route path={PATH.NUTRIENT_CAMERA} element={<NutrientCameraPage />} />
        <Route path={PATH.NUTRIENT_ADD_DETAIL} element={<NutrientAddDetailPage />} />
        <Route path={PATH.BRAND_SEARCH} element={<BrandSearch />} />
        <Route path={PATH.BRAND_MENU_SEARCH} element={<BrandMenuSearch />} />
        <Route path={PATH.COMPARE_MENU_SEARCH} element={<MenuComPareSearchPage />} />
        <Route path={PATH.COMPARE_SELECT_MENU} element={<SelectedMenuListPage />} />
      </Routes>
    </BrowserRouter>
  );
}
