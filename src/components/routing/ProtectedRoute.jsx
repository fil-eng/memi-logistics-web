import { Navigate } from "react-router-dom";
import { useAuth } from "../../state/auth/useAuth";

/**
 * ProtectedRoute Component
 *
 * A reusable route guard component that protects private routes from unauthorized access.
 * It handles three key scenarios:
 * 1. Unauthenticated users → redirects to login page
 * 2. Authenticated users with role restrictions → checks if user role is allowed
 * 3. Authenticated users without permission → redirects to unauthorized page
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The component/page to render if access is allowed
 * @param {string[]} [props.roles] - Array of allowed user roles (e.g., ['shipper', 'carrier', 'admin'])
 *                                    If not provided, route is accessible to all authenticated users
 * @param {string} [props.loginPath='/login'] - Path to redirect unauthenticated users
 * @param {string} [props.unauthorizedPath='/unauthorized'] - Path to redirect unauthorized users
 *
 * @returns {React.ReactElement} Protected route component or redirect
 *
 * @example
 * // Basic protection - any authenticated user can access
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * @example
 * // Role-based protection - only shippers can access
 * <ProtectedRoute roles={['shipper']}>
 *   <ShipperDashboard />
 * </ProtectedRoute>
 *
 * @example
 * // Multiple roles allowed
 * <ProtectedRoute roles={['shipper', 'admin']}>
 *   <ManagementPanel />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({
  children,
  roles = [],
  loginPath = "/login",
  unauthorizedPath = "/unauthorized",
}) => {
  const { isAuthenticated, user, role, isInitialized } = useAuth();
  const userRole = role || user?.role;

  // Loading state: show spinner while auth is initializing
  if (!isInitialized) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
        aria-label="Loading authentication"
      >
        <div>Loading...</div>
      </div>
    );
  }

  // Step 1: Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace />;
  }

  // Step 2: Check role-based access (if roles are specified)
  if (roles.length > 0) {
    if (!userRole || !roles.includes(userRole)) {
      return <Navigate to={unauthorizedPath} replace />;
    }
  }

  // Step 3: All checks passed, render the protected component
  return children;
};

export default ProtectedRoute;
