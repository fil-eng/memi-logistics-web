import RegistrationForm from "../../components/auth/RegistrationForm";
import styles from "./CarrierRegister.module.css";

const CarrierRegister = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Register as Carrier</h1>
        <p className={styles.subtitle}>
          Create a carrier profile to find loads and handle deliveries.
        </p>
        <p className={styles.description}>
          Ideal for carriers that move goods and want reliable load
          opportunities.
        </p>
        <RegistrationForm role="CARRIER" />
      </div>
    </div>
  );
};

export default CarrierRegister;
