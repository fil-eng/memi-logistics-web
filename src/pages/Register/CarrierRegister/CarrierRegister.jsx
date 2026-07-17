import { Link } from "react-router-dom";
import RegistrationForm from "../RegistrationForm/RegistrationForm";
import styles from "./CarrierRegister.module.css";

const CarrierRegister = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link to="/">
          <h1 className={styles.title}>Register as Carrier</h1>
        </Link>
        <p className={styles.subtitle}>
          Create your carrier account to find loads and handle deliveries.
        </p>
        <RegistrationForm role="carrier" />
      </div>
    </div>
  );
};

export default CarrierRegister;
