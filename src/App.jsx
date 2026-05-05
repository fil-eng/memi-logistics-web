import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./state/auth/AuthProvider";
import ProtectedRoute from "./components/routing/ProtectedRoute";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ShipperRegister from "./pages/Register/ShipperRegister/ShipperRegister";
import CarrierRegister from "./pages/Register/CarrierRegister/CarrierRegister";
import ShipperDashboard from "./pages/ShipperDashboard/ShipperDashboard";
import ShipperHome from "./pages/ShipperDashboard/Home/ShipperHome";
import CreateShipment from "./pages/ShipperDashboard/CreateShipment/CreateShipment";
import ActiveShipmentsPage from "./pages/ShipperDashboard/ActiveShipments/ActiveShipmentsPage";
import PendingRequests from "./pages/ShipperDashboard/PendingRequests/PendingRequests";
import CompletedDeliveries from "./pages/ShipperDashboard/CompletedDeliveries/CompletedDeliveries";
import Notifications from "./pages/ShipperDashboard/Notifications/Notifications";
import Profile from "./pages/ShipperDashboard/Profile/Profile";
import CarrierDashboard from "./pages/CarrierDashboard/CarrierDashboard";
import Home from "./pages/Home/Home";

const Unauthorized = () => <div>Unauthorized</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/shipper" element={<ShipperRegister />} />
          <Route path="/register/carrier" element={<CarrierRegister />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* <Route path="/shipper" element={<ShipperDashboard />} /> */}
          <Route
            path="/shipper"
            element={
              <ProtectedRoute roles={["SHIPPER"]}>
                <ShipperDashboard />
              </ProtectedRoute>
            }
          >
          {/* <Route path="/shipper/*" element={<ShipperDashboard />}> */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ShipperHome />} />
            <Route
              path="dashboard/create-shipment"
              element={<CreateShipment />}
            />
            <Route
              path="dashboard/active-shipments"
              element={<ActiveShipmentsPage />}
            />
            <Route
              path="dashboard/pending-requests"
              element={<PendingRequests />}
            />
            <Route
              path="dashboard/completed-deliveries"
              element={<CompletedDeliveries />}
            />
            <Route path="dashboard/notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route
            path="/carrier/dashboard"
            element={
              <ProtectedRoute roles={["CARRIER"]}>
                <CarrierDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
