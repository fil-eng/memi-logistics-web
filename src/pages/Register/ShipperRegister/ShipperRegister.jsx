import { Link } from "react-router-dom";
import RegistrationForm from "../RegistrationForm/RegistrationForm";
import styles from "./ShipperRegister.module.css";

const ShipperRegister = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link to="/">
          <h1 className={styles.title}>Register as Shipper</h1>
        </Link>
        <p className={styles.subtitle}>
          Create your shipper account to manage shipment requests and connect
          with carriers.
        </p>
        <RegistrationForm role="shipper" />
      </div>
    </div>
  );
};

export default ShipperRegister;
