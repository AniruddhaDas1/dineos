import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { usePosAuthStore } from "@/stores/posAuth.store";
import { usePosStore } from "@/stores/pos.store";
import { Sidebar } from "./components/Sidebar";
import { PosLoginPage } from "./login/PosLoginPage";

export function PosLayout() {
  const staff = usePosAuthStore((s) => s.staff);
  const refresh = usePosStore((s) => s.refresh);

  useEffect(() => {
    if (staff) refresh();
  }, [staff, refresh]);

  if (!staff) return <PosLoginPage />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
