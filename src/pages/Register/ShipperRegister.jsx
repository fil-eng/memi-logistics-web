import RegistrationForm from "../../components/auth/RegistrationForm";
import styles from "./ShipperRegister.module.css";

const ShipperRegister = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Register as Shipper</h1>
        <p className={styles.subtitle}>
          Set up your shipper account to create and manage shipment requests.
        </p>
        <p className={styles.description}>
          Perfect for businesses sending freight and managing pickup requests.
        </p>
        <RegistrationForm role="SHIPPER" />
      </div>
    </div>
  );
};

export default ShipperRegister;
