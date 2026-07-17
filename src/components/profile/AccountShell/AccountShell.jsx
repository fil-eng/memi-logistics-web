import { Link } from "react-router-dom";
import styles from "./AccountShell.module.css";

const AccountShell = ({
  title,
  subtitle,
  navigationItems,
  activeSection,
  onSelectSection,
  statusMessage,
  children,
}) => {
  return (
    <div className={styles.accountPage}>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.breadcrumb}>My Account</h1>
          {/* <h1>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p> */}
        </div>
        {statusMessage && (
          <div className={styles.statusMessage}>{statusMessage}</div>
        )}
      </div>

      <div className={styles.panelGrid}>
        <aside className={styles.sidebar}>
          <nav className={styles.navList}>
            {navigationItems.map((item) => (
              <div key={item.key || item.path} className={styles.navItem}>
                {item.path ? (
                  <Link
                    to={item.path}
                    className={
                      item.key === "logout"
                        ? `${styles.navLink} ${styles.logoutLink}`
                        : styles.navLink
                    }
                    onClick={item.onClick}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={
                      item.key === "logout"
                        ? `${styles.navLink} ${styles.logoutLink}`
                        : item.key === activeSection
                          ? `${styles.navLink} ${styles.navLinkActive}`
                          : styles.navLink
                    }
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      else onSelectSection(item.key);
                    }}
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <section className={styles.mainContent}>{children}</section>
      </div>
    </div>
  );
};

export default AccountShell;
