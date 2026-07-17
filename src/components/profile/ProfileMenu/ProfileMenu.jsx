import { useEffect, useRef } from "react";
import styles from "./ProfileMenu.module.css";

const ProfileMenu = ({ user, isOpen, onClose, onAccount, onLogout }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName =
    user?.businessName ||
    user?.companyName ||
    user?.companyEmail ||
    "My Account";
  const userMeta =
    user?.companyEmail || user?.phoneNumber || user?.role || "MEMI user";

  return (
    <div className={styles.menu} ref={menuRef}>
      <div className={styles.userBlock}>
        <div className={styles.userName}>{displayName}</div>
        <div className={styles.userMeta}>{userMeta}</div>
      </div>
      <button className={styles.item} type="button" onClick={onAccount}>
        My Account
      </button>
      <button
        className={`${styles.item} ${styles.logoutItem}`}
        type="button"
        onClick={onLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default ProfileMenu;
