import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CartBar } from "./CartBar";
import { AssistanceSheet } from "../assistance/AssistanceSheet";

export function AppLayout() {
  const location = useLocation();
  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-background md:max-w-5xl">
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="flex-1 pb-28"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <CartBar />
      <AssistanceSheet />
    </div>
  );
}
