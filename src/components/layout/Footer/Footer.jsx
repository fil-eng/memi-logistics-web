import { Link } from "react-router-dom";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandSection}>
          <h2 className={styles.brand}>MEMI Logistics Platform</h2>
          <p className={styles.description}>
            A digital logistics marketplace connecting shippers, carriers, and
            logistics partners through one trusted platform.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={styles.column}>
            <h3 className={styles.heading}>Quick Links</h3>
            <nav className={styles.links}>
              <Link className={styles.link} to="/">
                Home
              </Link>
              <Link className={styles.link} to="/login">
                Login
              </Link>
              <Link className={styles.link} to="/register">
                Register
              </Link>
            </nav>
          </div>

          <div className={styles.column}>
            <h3 className={styles.heading}>Platform</h3>
            <nav className={styles.links}>
              <span className={styles.text}>Shipper Dashboard</span>
              <span className={styles.text}>Carrier Dashboard</span>
              <span className={styles.text}>Shipment Tracking</span>
              <span className={styles.text}>Trusted Matching</span>
            </nav>
          </div>

          <div className={styles.column}>
            <h3 className={styles.heading}>Contact</h3>
            <div className={styles.links}>
              <span className={styles.text}>Email: support@memi.com</span>
              <span className={styles.text}>Phone: +251 993348795</span>
              <span className={styles.text}>Tigray, Ethiopia</span>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} MEMI Logistics Platform. All rights
            reserved.
          </p>
          <p className={styles.meta}>
            Built for reliable logistics coordination and  growth.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;