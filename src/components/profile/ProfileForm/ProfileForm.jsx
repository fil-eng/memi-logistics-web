import { useEffect } from "react";
import useForm from "../../../hooks/useForm";
import styles from "./ProfileForm.module.css";

const isValidEmail = (value) =>
  /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/.test(value.trim());

const ProfileForm = ({
  initialValues,
  fields,
  onSubmit,
  isSaving,
  serverError,
  successMessage,
  submitLabel = "Save profile",
}) => {
  const fieldOrder = fields.map((field) => field.name);

  const validate = (values) => {
    const errors = {};

    fields.forEach((field) => {
      const value = values[field.name] || "";
      if (field.required && !value.trim()) {
        errors[field.name] = `${field.label} is required.`;
      }
      if (field.type === "email" && value.trim()) {
        if (!isValidEmail(value)) {
          errors[field.name] = "Enter a valid email address.";
        }
      }
    });

    return errors;
  };

  const {
    values,
    errors,
    touched,
    isSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
    setValues,
    setErrors,
  } = useForm({
    initialValues,
    validate,
    fieldOrder,
    onSubmit,
  });

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialValues)]);

  const shouldShowError = (fieldName) =>
    (touched[fieldName] || isSubmitted) && errors[fieldName];

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.grid}>
        {fields.map((field) => (
          <label key={field.name} className={styles.field}>
            <span>{field.label}</span>
            <input
              type={field.type || "text"}
              name={field.name}
              value={values[field.name] || ""}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={field.placeholder || ""}
            />
            {shouldShowError(field.name) && <small>{errors[field.name]}</small>}
          </label>
        ))}
      </div>

      {serverError && <div className={styles.formError}>{serverError}</div>}
      {successMessage && (
        <div className={styles.formSuccess}>{successMessage}</div>
      )}

      <button className={styles.submitButton} type="submit" disabled={isSaving}>
        {isSaving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
};

export default ProfileForm;
