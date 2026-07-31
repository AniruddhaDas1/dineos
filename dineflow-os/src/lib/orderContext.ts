import { useMemo } from "react";
import { useLocation } from "react-router-dom";

/**
 * Determines the ordering context (dine-in vs online) and returns
 * a base path prefix for navigation within that context.
 *
 * - /order/table/:tableId/... → base = `/order/table/${tableId}`
 * - /order/online/...        → base = `/order/online`
 */
export function useOrderContext() {
  const { pathname } = useLocation();

  return useMemo(() => {
    if (pathname.startsWith("/order/online")) {
      return { isOnline: true, base: "/order/online" as const };
    }
    const match = pathname.match(/^\/order\/table\/([^/]+)/);
    if (match) {
      return { isOnline: false, base: `/order/table/${match[1]}` as const };
    }
    return { isOnline: false, base: "/order" as const };
  }, [pathname]);
}
