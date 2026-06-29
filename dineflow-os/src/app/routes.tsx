import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/features/customer/components/AppLayout";
import { WelcomePage } from "@/features/customer/welcome/WelcomePage";
import { TableLandingPage } from "@/features/customer/table/TableLandingPage";
import { MenuPage } from "@/features/customer/menu/MenuPage";
import { ItemDetailPage } from "@/features/customer/item-detail/ItemDetailPage";
import { CartPage } from "@/features/customer/cart/CartPage";
import { OrderTrackingPage } from "@/features/customer/order-tracking/OrderTrackingPage";
import { BillPage } from "@/features/customer/bill/BillPage";
import { FeedbackPage } from "@/features/customer/feedback/FeedbackPage";
import { HistoryPage } from "@/features/customer/history/HistoryPage";

export const AppRoutes = (
  <Routes>
    <Route element={<AppLayout />}>
      <Route index element={<WelcomePage />} />
      <Route path="table/:tableId" element={<TableLandingPage />} />
      <Route path="table/:tableId/menu" element={<MenuPage />} />
      <Route path="table/:tableId/item/:itemId" element={<ItemDetailPage />} />
      <Route path="table/:tableId/cart" element={<CartPage />} />
      <Route path="table/:tableId/order/:orderId" element={<OrderTrackingPage />} />
      <Route path="table/:tableId/order/:orderId/bill" element={<BillPage />} />
      <Route path="table/:tableId/order/:orderId/feedback" element={<FeedbackPage />} />
      <Route path="table/:tableId/history" element={<HistoryPage />} />
    </Route>
  </Routes>
);
