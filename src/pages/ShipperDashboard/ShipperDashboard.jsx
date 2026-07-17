import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth/useAuth";
import { useShipment } from "../../state/shipments/useShipment";
import ProfileMenu from "../../components/profile/ProfileMenu/ProfileMenu";
import styles from "./ShipperDashboard.module.css";
import Profile from "./Profile/Profile";
import { useProfile } from "../../state/profile/useProfile";

const navLinks = [
  { path: "/shipper/home", label: "Home" },
  { path: "/shipper/create-shipment", label: "Create Shipment" },
  { path: "/shipper/active-shipments", label: "My Shipments" },
  // { path: "/shipper/pending-requests", label: "Pending Requests" },
  {
    path: "/shipper/completed-deliveries",
    label: "Completed Deliveries",
  },
  { path: "/shipper/notifications", label: "Notifications" },
  { path: "/shipper/review-shipment", label: "ReviewShipment" },
];

const ShipperDashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const { state: authState, logout } = useAuth();
  const { state: shipmentState } = useShipment();
  // console.log(authState)
  const { profile } = useProfile();
  // console.log("fila", profile.businessName);

  // console.log(state);
  const navigate = useNavigate();
  const userName = profile?.businessName || "Shipper";
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment[0])
    .join("")
    .toUpperCase();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileButtonRef = useRef(null);

  const currentUserId = authState.user?.id || authState.user?.shipperId || null;
  const unreadCount = (shipmentState.notifications || []).filter(
    (note) =>
      (!note.userId || String(note.userId) === String(currentUserId)) &&
      !note.read,
  ).length;

  const notificationLabel = `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`;

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setProfileOpen(false);
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

  const openAccountPage = () => {
    setProfileOpen(false);
    navigate("/shipper/profile");
  };

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <button
            type="button"
            className={styles.profileButton}
            onClick={() => setProfileOpen((open) => !open)}
            ref={profileButtonRef}
          >
            <div className={styles.avatar}>{initials || "F"}</div>
            <div className={styles.brandTitle}>
              <small>{profile ? profile?.businessName : "Shipper"}</small>
            </div>
          </button>
          <ProfileMenu
            user={profile}
            isOpen={profileOpen}
            onClose={() => setProfileOpen(false)}
            onAccount={openAccountPage}
            onLogout={handleLogout}
          />
        </div>

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
              {item.path === "/shipper/notifications"
                ? notificationLabel
                : item.label}
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
              {item.path === "/shipper/notifications"
                ? notificationLabel
                : item.label}
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
  );
};

export default ShipperDashboard;
