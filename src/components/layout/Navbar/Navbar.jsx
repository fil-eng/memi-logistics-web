import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../state/auth/useAuth";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getDashboardRoute = () => {
    if (user?.role === "CARRIER") return "/carrier/dashboard";
    return "/shipper/dashboard";
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          MEMI
        </Link>

        <nav className={styles.nav}>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className={styles.link}>
                Login
              </Link>
              <Link to="/register" className={styles.primaryBtn}>
                Register
              </Link>
            </>
          ) : (
            <>
              <Link to={getDashboardRoute()} className={styles.link}>
                Dashboard
              </Link>

              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;