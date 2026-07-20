import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ShipmentProvider } from "./state/shipments/ShipmentProvider.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./state/auth/AuthProvider.jsx";
import { ProfileProvider } from "./state/profile/ProfileProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <ShipmentProvider>
            <App />
          </ShipmentProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
