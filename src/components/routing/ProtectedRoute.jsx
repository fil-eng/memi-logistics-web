import { Navigate } from "react-router-dom";
import { useAuth } from "../../state/auth/useAuth";

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, isInitialized } = useAuth();

  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    if (!user || !roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
