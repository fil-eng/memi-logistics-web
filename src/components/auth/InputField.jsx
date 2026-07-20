import styles from "./InputField.module.css";

const InputField = ({
  label,
  id,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  required = true,
  helper,
  error,
}) => {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
      />
      {helper && <p className={styles.helper}>{helper}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
};

export default InputField;
