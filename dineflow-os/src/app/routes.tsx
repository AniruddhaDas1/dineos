import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AppLayout } from "@/features/customer/components/AppLayout";

const WelcomePage = lazy(() => import("@/features/customer/welcome/WelcomePage").then(m => ({ default: m.WelcomePage })));
const TableLandingPage = lazy(() => import("@/features/customer/table/TableLandingPage").then(m => ({ default: m.TableLandingPage })));
const MenuPage = lazy(() => import("@/features/customer/menu/MenuPage").then(m => ({ default: m.MenuPage })));
const ItemDetailPage = lazy(() => import("@/features/customer/item-detail/ItemDetailPage").then(m => ({ default: m.ItemDetailPage })));
const CartPage = lazy(() => import("@/features/customer/cart/CartPage").then(m => ({ default: m.CartPage })));
const OrderTrackingPage = lazy(() => import("@/features/customer/order-tracking/OrderTrackingPage").then(m => ({ default: m.OrderTrackingPage })));
const BillPage = lazy(() => import("@/features/customer/bill/BillPage").then(m => ({ default: m.BillPage })));
const FeedbackPage = lazy(() => import("@/features/customer/feedback/FeedbackPage").then(m => ({ default: m.FeedbackPage })));
const HistoryPage = lazy(() => import("@/features/customer/history/HistoryPage").then(m => ({ default: m.HistoryPage })));
const OnlineLandingPage = lazy(() => import("@/features/online/OnlineLandingPage").then(m => ({ default: m.OnlineLandingPage })));
const OnlineCartPage = lazy(() => import("@/features/online/OnlineCartPage").then(m => ({ default: m.OnlineCartPage })));
const OnlineOrderTrackingPage = lazy(() => import("@/features/online/OnlineOrderTrackingPage").then(m => ({ default: m.OnlineOrderTrackingPage })));

export function OrderApp() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Suspense><WelcomePage /></Suspense>} />
        {/* Dine-in */}
        <Route path="table/:tableId" element={<Suspense><TableLandingPage /></Suspense>} />
        <Route path="table/:tableId/menu" element={<Suspense><MenuPage /></Suspense>} />
        <Route path="table/:tableId/item/:itemId" element={<Suspense><ItemDetailPage /></Suspense>} />
        <Route path="table/:tableId/cart" element={<Suspense><CartPage /></Suspense>} />
        <Route path="table/:tableId/order/:orderId" element={<Suspense><OrderTrackingPage /></Suspense>} />
        <Route path="table/:tableId/order/:orderId/bill" element={<Suspense><BillPage /></Suspense>} />
        <Route path="table/:tableId/order/:orderId/feedback" element={<Suspense><FeedbackPage /></Suspense>} />
        <Route path="table/:tableId/history" element={<Suspense><HistoryPage /></Suspense>} />
        {/* Online ordering */}
        <Route path="online" element={<Suspense><OnlineLandingPage /></Suspense>} />
        <Route path="online/menu" element={<Suspense><MenuPage /></Suspense>} />
        <Route path="online/item/:itemId" element={<Suspense><ItemDetailPage /></Suspense>} />
        <Route path="online/cart" element={<Suspense><OnlineCartPage /></Suspense>} />
        <Route path="online/tracking/:orderId" element={<Suspense><OnlineOrderTrackingPage /></Suspense>} />
      </Route>
    </Routes>
  );
}
