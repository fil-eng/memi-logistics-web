import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ShipmentProvider } from "../../state/shipments/ShipmentProvider";
import { useAuth } from "../../state/auth/useAuth";
import styles from "./ShipperDashboard.module.css";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/shipper/dashboard", label: "dashboard" },
  { path: "/shipper/dashboard/create-shipment", label: "Create Shipment" },
  { path: "/shipper/dashboard/active-shipments", label: "Active Shipments" },
  { path: "/shipper/dashboard/pending-requests", label: "Pending Requests" },
  {
    path: "/shipper/dashboard/completed-deliveries",
    label: "Completed Deliveries",
  },
  { path: "/shipper/dashboard/notifications", label: "Notifications" },
];

const ShipperDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const userName = state?.user?.name || "Shipper";
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return;

    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [menuOpen]);

  const handleToggleMenu = () => {
    setMenuOpen((open) => !open);
  };

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  return (
    <ShipmentProvider>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link to="/shipper/profile" className={styles.brand}>
            <div className={styles.avatar}>{initials || "F"}</div>
            <div className={styles.brandTitle}>
              {/* <span>MEMI Shipper</span> */}
              <small>{userName}</small>
            </div>
          </Link>

          <button
            type="button"
            className={styles.menuToggle}
            onClick={handleToggleMenu}
            aria-expanded={menuOpen}
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            ref={menuButtonRef}
          >
            <span className={styles.hamburger} />
          </button>

          <nav className={styles.nav}>
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={`${item.path}`}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.navLink} ${styles.navLinkActive}`
                    : styles.navLink
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              className={styles.logoutButton}
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </nav>

          <div
            className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}
            ref={menuRef}
          >
            {navLinks.map((item) => (
              <NavLink
                key={item.path}
                to={`${item.path}`}
                className={({ isActive }) =>
                  isActive
                    ? `${styles.mobileNavLink} ${styles.navLinkActive}`
                    : styles.mobileNavLink
                }
                onClick={handleNavClick}
              >
                {item.label}
              </NavLink>
            ))}
            <button
              className={`${styles.mobileNavLink} ${styles.mobileLogoutButton}`}
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </ShipmentProvider>
  );
};

export default ShipperDashboard;
