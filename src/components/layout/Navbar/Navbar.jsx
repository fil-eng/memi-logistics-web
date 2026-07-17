import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../state/auth/useAuth";
import styles from "./Navbar.module.css";
import logo from "../../../assets/logo.jpg";
const Navbar = ({ buttons }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getDashboardRoute = () => {
    if (user?.role === "CARRIER") return "/carrier/home";
    return "/shipper/home";
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <img src={logo} alt="MEMI logo" />
        </Link>
        {buttons ? (
          <nav className={styles.nav}>
            {/* <Link to="/" className={styles.link}>
                Home
              </Link> */}
            <Link to="/login" className={styles.link}>
              Login
            </Link>
            <Link to="/register" className={styles.primaryBtn}>
              Register
            </Link>
          </nav>
        ) : (
          <p className={styles.breadcrumb}>Admin Dashboard</p>
        )}
      </div>
    </header>
  );
};

export default Navbar;
