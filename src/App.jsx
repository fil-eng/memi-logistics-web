import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./state/auth/AuthProvider";
import ProtectedRoute from "./components/routing/ProtectedRoute";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ShipperRegister from "./pages/Register/ShipperRegister";
import CarrierRegister from "./pages/Register/CarrierRegister";
import ShipperDashboard from "./pages/ShipShipperDashboard/ShipShipperDashboard";
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

          <Route
            path="/shipper/dashboard"
            element={
              <ProtectedRoute roles={["SHIPPER"]}>
                <ShipperDashboard />
              </ProtectedRoute>
            }
          />

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
