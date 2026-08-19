import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { OrderApp } from "./routes";
import { WebsiteLayout } from "@/features/website/WebsiteLayout";

const PosLayout = lazy(() => import("@/features/pos/PosLayout").then(m => ({ default: m.PosLayout })));
const DashboardPage = lazy(() => import("@/features/pos/dashboard/DashboardPage").then(m => ({ default: m.DashboardPage })));
const TablesPage = lazy(() => import("@/features/pos/tables/TablesPage").then(m => ({ default: m.TablesPage })));
const OrdersPage = lazy(() => import("@/features/pos/orders/OrdersPage").then(m => ({ default: m.OrdersPage })));
const OrderDetailPage = lazy(() => import("@/features/pos/orders/OrderDetailPage").then(m => ({ default: m.OrderDetailPage })));
const CrmPage = lazy(() => import("@/features/pos/crm/CrmPage").then(m => ({ default: m.CrmPage })));
const CrmDetailPage = lazy(() => import("@/features/pos/crm/CrmDetailPage").then(m => ({ default: m.CrmDetailPage })));
const FeedbackPanel = lazy(() => import("@/features/pos/crm/FeedbackPanel").then(m => ({ default: m.FeedbackPanel })));
const InventoryPage = lazy(() => import("@/features/pos/inventory/InventoryPage").then(m => ({ default: m.InventoryPage })));
const StaffPage = lazy(() => import("@/features/pos/staff/StaffPage").then(m => ({ default: m.StaffPage })));
const SettingsPage = lazy(() => import("@/features/pos/settings/SettingsPage").then(m => ({ default: m.SettingsPage })));
const WebsiteBuilderPage = lazy(() => import("@/features/pos/website/WebsiteBuilderPage").then(m => ({ default: m.WebsiteBuilderPage })));
const InstantPosPage = lazy(() => import("@/features/pos/instant-pos/InstantPosPage").then(m => ({ default: m.InstantPosPage })));
const OnlineOrdersPage = lazy(() => import("@/features/pos/online-orders/OnlineOrdersPage").then(m => ({ default: m.OnlineOrdersPage })));
const MenuBuilderPage = lazy(() => import("@/features/pos/menu/MenuBuilderPage").then(m => ({ default: m.MenuBuilderPage })));
const ReservationsPage = lazy(() => import("@/features/pos/reservations/ReservationsPage").then(m => ({ default: m.ReservationsPage })));
const MarketingPage = lazy(() => import("@/features/pos/marketing/MarketingPage").then(m => ({ default: m.MarketingPage })));
const KdsLayout = lazy(() => import("@/features/kds/KdsLayout").then(m => ({ default: m.KdsLayout })));

import { PermissionGate } from "@/components/auth/PermissionGate";

const posChildren = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <PermissionGate permission="dashboard:view"><DashboardPage /></PermissionGate> },
  { path: "tables", element: <PermissionGate permission="tables:view"><TablesPage /></PermissionGate> },
  { path: "orders", element: <PermissionGate permission="orders:view"><OrdersPage /></PermissionGate> },
  { path: "orders/:orderId", element: <PermissionGate permission="orders:view"><OrderDetailPage /></PermissionGate> },
  { path: "crm", element: <PermissionGate permission="crm:view"><CrmPage /></PermissionGate> },
  { path: "crm/:mobile", element: <PermissionGate permission="crm:view"><CrmDetailPage /></PermissionGate> },
  { path: "feedback", element: <PermissionGate permission="feedback:view"><FeedbackPanel /></PermissionGate> },
  { path: "inventory", element: <PermissionGate permission="inventory:view"><InventoryPage /></PermissionGate> },
  { path: "staff", element: <PermissionGate permission="staff:view"><StaffPage /></PermissionGate> },
  { path: "website-builder", element: <PermissionGate permission="website:build"><WebsiteBuilderPage /></PermissionGate> },
  { path: "instant-pos", element: <PermissionGate permission="pos:instant"><InstantPosPage /></PermissionGate> },
  { path: "online-orders", element: <PermissionGate permission="orders:view"><OnlineOrdersPage /></PermissionGate> },
  { path: "menu", element: <PermissionGate permission="menu:manage"><MenuBuilderPage /></PermissionGate> },
  { path: "reservations", element: <PermissionGate permission="reservations:view"><ReservationsPage /></PermissionGate> },
  { path: "marketing", element: <PermissionGate permission="marketing:view"><MarketingPage /></PermissionGate> },
  { path: "settings", element: <PermissionGate permission="settings:view"><SettingsPage /></PermissionGate> },
];

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <WebsiteLayout />,
    },
    {
      path: "order",
      element: <OrderApp />,
    },
    {
      path: "order/*",
      element: <OrderApp />,
    },
    {
      path: "pos",
      element: (
        <Suspense>
          <PosLayout />
        </Suspense>
      ),
      children: posChildren,
    },
    {
      path: "kds",
      element: (
        <Suspense>
          <KdsLayout />
        </Suspense>
      ),
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
);
