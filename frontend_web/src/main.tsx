import { Toast } from "@base-ui/react/toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./shared/styles/tokens.css";
import "./index.css";
import App from "./App.tsx";
import { queryClient } from "@/shared/api/queryClient";
import { AppToastViewport } from "@/shared/commons/toast/AppToastViewport";
import { appToastManager } from "@/shared/commons/toast/toastManager";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <Toast.Provider toastManager={appToastManager} timeout={2600} limit={2}>
      <App />
      <AppToastViewport />
    </Toast.Provider>
  </QueryClientProvider>,
);
