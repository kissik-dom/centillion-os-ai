import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import { StrictMode, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Use env var or a placeholder so the provider always mounts
const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://placeholder.convex.cloud";
const convex = new ConvexReactClient(convexUrl);

// Stub auth — always returns "not authenticated"
function useStubAuth() {
  const fetchAccessToken = useCallback(async () => null, []);
  return useMemo(
    () => ({
      isLoading: false,
      isAuthenticated: false,
      fetchAccessToken,
    }),
    [fetchAccessToken]
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProviderWithAuth client={convex} useAuth={useStubAuth}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConvexProviderWithAuth>
  </StrictMode>
);
