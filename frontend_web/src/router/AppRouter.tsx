import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PATH } from "./path";
import OnboardingPage from "../features/onboarding/OnboardingPage";
import HomePage from "@/features/home/HomePage";
import RecommendPage from "@/features/recommend/RecommendPage";
import ComparePage from "@/features/compare/ComparePage";
import TermsPage from "@/features/terms/TermsPage";
import MealDetailPage from "@/features/meal-detail/MealDetailPage";
import MealRecordPage from "@/features/meal-record/MealRecordPage";
import MealRecordAddPage from "@/features/meal-record/MealRecordAddPage";
import MealSearchPage from "@/features/search/menu-record/MealSearchPage";
import NutritionAddPage from "@/features/nutrition-entry/NutritionAddPage";
import NutritionCameraPage from "@/features/nutrition-entry/NutritionCameraPage";
import NutritionAddDetailPage from "@/features/nutrition-entry/NutritionAddDetailPage";
import BrandSearch from "@/features/nutrition-entry/BrandSearch";
import MealCameraPage from "@/features/meal-record/MealCameraPage";
import BrandMenuSearch from "@/features/search/brand/BrandMenuSearch";
import MenuComPareSearchPage from "@/features/search/menu-compare/MenuCompareSearchPage";
import SelectedMenuListPage from "@/features/compare/SelectedMenuListPage";
import MealRecordSearchDetailPage from "@/features/meal-record/MealRecordSearchDetailPage";

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
        <Route path={PATH.MEAL_DETAIL} element={<MealDetailPage />} />
        <Route path={PATH.MEAL_RECORD} element={<MealRecordPage />} />
        <Route path={PATH.MEAL_RECORD_ADD} element={<MealRecordAddPage />} />
        <Route path={PATH.MEAL_RECORD_ADD_SEARCH} element={<MealSearchPage />} />
        <Route path={PATH.MEAL_RECORD_ADD_SEARCH_DETAIL} element={<MealRecordSearchDetailPage />} />
        <Route path={PATH.MEAL_CAMERA} element={<MealCameraPage />} />
        <Route path={PATH.NUTRITION_ADD} element={<NutritionAddPage />} />
        <Route path={PATH.NUTRITION_CAMERA} element={<NutritionCameraPage />} />
        <Route path={PATH.NUTRITION_ADD_DETAIL} element={<NutritionAddDetailPage />} />
        <Route path={PATH.BRAND_SEARCH} element={<BrandSearch />} />
        <Route path={PATH.BRAND_MENU_SEARCH} element={<BrandMenuSearch />} />
        <Route path={PATH.COMPARE_MENU_SEARCH} element={<MenuComPareSearchPage />} />
        <Route path={PATH.COMPARE_SELECT_MENU} element={<SelectedMenuListPage />} />
      </Routes>
    </BrowserRouter>
  );
}
