import { ConvexReactClient, ConvexProvider } from "convex/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

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
      <ConvexProvider client={convex}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConvexProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);
