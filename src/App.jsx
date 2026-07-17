import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/routing/ProtectedRoute";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ShipperRegister from "./pages/Register/ShipperRegister/ShipperRegister";
import CarrierRegister from "./pages/Register/CarrierRegister/CarrierRegister";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import ShipperDashboard from "./pages/ShipperDashboard/ShipperDashboard";
import ShipperHome from "./pages/ShipperDashboard/Home/ShipperHome";
import CreateShipment from "./pages/ShipperDashboard/CreateShipment/CreateShipment";
import PendingRequests from "./pages/ShipperDashboard/PendingRequests/PendingRequests";
import CompletedDeliveries from "./pages/ShipperDashboard/CompletedDeliveries/CompletedDeliveries";
import Notifications from "./pages/ShipperDashboard/Notifications/Notifications";
import Profile from "./pages/ShipperDashboard/Profile/Profile";
import CarrierDashboard from "./pages/CarrierDashboard/CarrierDashboard";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import CarrierHome from "./pages/CarrierDashboard/Home/CarrierHome";
import CarrierNotifications from "./pages/CarrierDashboard/Notifications/CarrierNotifications";
import AvailableShipments from "./pages/CarrierDashboard/AvailableShipments/AvailableShipments";
import MyOffers from "./pages/CarrierDashboard/MyOffers/MyOffers";
import ActiveJobs from "./pages/CarrierDashboard/ActiveJobs/ActiveJobs";
import DeliveryProgress from "./pages/CarrierDashboard/DeliveryProgress/DeliveryProgress";
import CompletedJobs from "./pages/CarrierDashboard/CompletedJobs/CompletedJobs";
import Home from "./pages/Home/Home";
import Shipments from "./pages/Shipments/Shipments";
import ShipmentDetail from "./pages/Shipments/ShipmentDetail";
import ReviewShipment from "./pages/ShipperDashboard/ReviewShipment/ReviewShipment";
import PublicCarrierProfile from "./pages/PublicCarrierProfile/PublicCarrierProfile";
import CarrierProfile from "./pages/CarrierDashboard/Profile/Profile";
import PublicShipperProfile from "./pages/PublicShipperProfile/PublicShipperProfile";
import { useShipment } from "./state/shipments/useShipment";
import MyShipmentsPage from "./pages/ShipperDashboard/ActiveShipments/MyShipmentsPage";

const Unauthorized = () => <div>Unauthorized</div>;

function App() {
  const { state, addShipment } = useShipment();
  // console.log(state?.shipments);
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
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
        <Route index element={<Navigate to="/shipper/home" replace />} />
        <Route path="home" element={<ShipperHome />} />
        <Route path="create-shipment" element={<CreateShipment />} />
        <Route path="active-shipments" element={<MyShipmentsPage />} />
        <Route path="pending-requests" element={<PendingRequests />} />
        <Route path="completed-deliveries" element={<CompletedDeliveries />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="review-shipment" element={<ReviewShipment />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/shipper/home" replace />} />
      </Route>

      <Route path="/carriers/:id" element={<PublicCarrierProfile />} />

      <Route
        path="/carrier/*"
        element={
          <ProtectedRoute roles={["CARRIER"]}>
            <CarrierDashboard />
          </ProtectedRoute>
          // <CarrierDashboard />
        }
      >
        <Route path="profile" element={<CarrierProfile />} />
        <Route index element={<Navigate to="/carrier/home" replace />} />
        <Route path="home" element={<CarrierHome />} />
        <Route path="available-shipments" element={<AvailableShipments />} />
        <Route path="my-offers" element={<MyOffers />} />
        <Route path="active-jobs" element={<ActiveJobs />} />
        <Route path="delivery-progress" element={<DeliveryProgress />} />
        <Route path="completed-jobs" element={<CompletedJobs />} />
        <Route path="notifications" element={<CarrierNotifications />} />
      </Route>
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />
      <Route path="/shipments" element={<Shipments />} />
      <Route path="/shipments/:id" element={<ShipmentDetail />} />
      <Route path="/shippers/:id" element={<PublicShipperProfile />} />
    </Routes>
  );
}

export default App;
