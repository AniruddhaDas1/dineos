import { Routes, Route } from "react-router-dom";
import { SplashPage } from "@/features/customer/welcome/SplashPage";

// Temporary minimal routes — full AppLayout + all pages are built in Task 9+.
export const AppRoutes = (
  <Routes>
    <Route path="*" element={<SplashPage />} />
  </Routes>
);
