import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PATH } from "./path";
import OnboardingPage from "../features/onboarding/OnboardingPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={PATH.ROOT} element={<div>Root</div>} />
        <Route path={PATH.HOME} element={<div>Home</div>} />
        <Route path={PATH.ONBOARDING} element={<OnboardingPage />} />
        <Route path={PATH.RECOMMEND} element={<div>Recommend</div>} />
        <Route path={PATH.COMPARE} element={<div>Compare</div>} />
        <Route path={PATH.PROFILE} element={<div>Profile</div>} />
      </Routes>
    </BrowserRouter>
  );
}
