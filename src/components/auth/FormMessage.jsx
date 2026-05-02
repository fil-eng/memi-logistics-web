import styles from "./FormMessage.module.css";

const FormMessage = ({ message, type = "error" }) => {
  if (!message) return null;

  return <p className={`${styles.message} ${styles[type]}`}>{message}</p>;
};

export default FormMessage;
