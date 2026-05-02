import { Link, useNavigate } from "react-router-dom";
import styles from "./Register.module.css";

const Register = () => {
  const navigate = useNavigate();

  const handleShipperClick = () => {
    navigate("/register/shipper");
  };

  const handleCarrierClick = () => {
    navigate("/register/carrier");
  };

  return (
    <div className={styles.container}>
      <Link to="/">
        <h1 className={styles.title}>Join MEMI Logistics</h1>
      </Link>
      <p className={styles.explanation}>
        Choose your account type to get started with shipping and logistics.
      </p>
      <div className={styles.choices}>
        <div className={styles.choiceCard} onClick={handleShipperClick}>
          <h2>Register as Shipper</h2>
          <p>
            Set up your shipper account to create and manage shipment requests.
          </p>
        </div>
        <div className={styles.choiceCard} onClick={handleCarrierClick}>
          <h2>Register as Carrier</h2>
          <p>Create a carrier profile to find loads and handle deliveries.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
