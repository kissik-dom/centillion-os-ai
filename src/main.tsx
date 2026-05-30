import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithAuth } from "convex/react";
import { StrictMode, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

// Stub auth adapter — always returns "not authenticated"
// so the app renders its public routes without crashing
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

function Root() {
  if (!convexUrl) {
    return (
      <StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StrictMode>
    );
  }

  const convex = new ConvexReactClient(convexUrl);
  return (
    <StrictMode>
      <ConvexProviderWithAuth client={convex} useAuth={useStubAuth}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConvexProviderWithAuth>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
