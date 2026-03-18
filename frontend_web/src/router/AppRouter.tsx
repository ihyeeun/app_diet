import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PATH } from "./path";
import OnboardingPage from "../features/onboarding/OnboardingPage";
import HomePage from "@/features/home/HomePage";
import RecommendPage from "@/features/recommend/RecommendPage";
import ComparePage from "@/features/compare/ComparePage";
import TermsPage from "@/features/terms/TermsPage";
import MealDetailPage from "@/features/meal-detail/MealDetailPage";
import MealRecordPage from "@/features/meal-record/MealRecordPage";

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
      </Routes>
    </BrowserRouter>
  );
}
