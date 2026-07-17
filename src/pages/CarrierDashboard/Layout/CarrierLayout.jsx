import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../state/auth/useAuth";
import { useShipment } from "../../../state/shipments/useShipment";
import ProfileMenu from "../../../components/profile/ProfileMenu/ProfileMenu";
import styles from "./CarrierLayout.module.css";
import { useProfile } from "../../../state/profile/useProfile";
// import Profile from './../../ShipperDashboard/Profile/Profile';

const navLinks = [
  { path: "/carrier/home", label: "Home" },
  { path: "/carrier/available-shipments", label: "Available Shipments" },
  { path: "/carrier/my-offers", label: "Assigned Offers" },
  // { path: "/carrier/active-jobs", label: "Active Jobs" },
  { path: "/carrier/delivery-progress", label: "Delivery Progress" },
  { path: "/carrier/completed-jobs", label: "Completed Jobs" },
  { path: "/carrier/notifications", label: "Notifications" },
];

const CarrierLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);
  const { state: authState, logout } = useAuth();
  const { state: shipmentState } = useShipment();
  const { profile } = useProfile();
  // console.log("profile", profile);

  const navigate = useNavigate();

  const userName = profile?.companyName || "Carrier";
  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  const currentCarrierId =
    authState.user?.id || authState.user?.carrierId || null;
  const unreadCount = (shipmentState.notifications || []).filter(
    (note) =>
      (!note.userId || String(note.userId) === String(currentCarrierId)) &&
      !note.read,
  ).length;
  const notificationLabel = `Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`;

  const [profileOpen, setProfileOpen] = useState(false);
  const profileButtonRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setProfileOpen(false);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const openAccountPage = () => {
    setProfileOpen(false);
    navigate("/carrier/profile");
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
            <div className={styles.avatar}>{initials || "C"}</div>
            <div className={styles.brandTitle}>
              <small>{profile ? profile?.companyName : " Carrier"}</small>
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
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={
            menuOpen ? "Close navigation menu" : "Open navigation menu"
          }
          ref={menuButtonRef}
        >
          <span className={styles.hamburger} />
        </button>

        <nav className={styles.nav}>
          {navLinks.map((n) => (
            <NavLink
              key={n.path}
              to={n.path}
              className={({ isActive }) =>
                isActive
                  ? `${styles.navLink} ${styles.navLinkActive}`
                  : styles.navLink
              }
            >
              {n.path === "/carrier/notifications"
                ? notificationLabel
                : n.label}
            </NavLink>
          ))}
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </nav>

        <div
          className={`${styles.mobileMenu} ${menuOpen ? styles.open : ""}`}
          ref={menuRef}
        >
          {navLinks.map((n) => (
            <NavLink
              key={n.path}
              to={n.path}
              className={styles.mobileNavLink}
              onClick={() => setMenuOpen(false)}
            >
              {n.path === "/carrier/notifications"
                ? notificationLabel
                : n.label}
            </NavLink>
          ))}
          <button
            className={`${styles.mobileNavLink} ${styles.mobileLogoutButton}`}
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

export default CarrierLayout;
