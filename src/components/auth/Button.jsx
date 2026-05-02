import styles from "./Button.module.css";

const Button = ({
  children,
  type = "button",
  disabled = false,
  loading = false,
}) => {
  return (
    <button
      className={styles.button}
      type={type}
      disabled={disabled || loading}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
};

export default Button;
