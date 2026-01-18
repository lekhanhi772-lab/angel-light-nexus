import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { registerSW } from "virtual:pwa-register";

// Register Service Worker for PWA
const updateSW = registerSW({
  onNeedRefresh() {
    // New version available
    if (confirm("Phiên bản mới của Angel AI đã sẵn sàng. Cập nhật ngay?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("Angel AI sẵn sàng hoạt động offline ✨");
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
