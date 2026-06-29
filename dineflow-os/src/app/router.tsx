import { createBrowserRouter } from "react-router-dom";
import { AppRoutes } from "./routes";

export const router = createBrowserRouter([{ path: "*", element: AppRoutes }]);
