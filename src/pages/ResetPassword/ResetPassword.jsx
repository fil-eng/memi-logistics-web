import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../../state/auth/useAuth";
import { validateResetPasswordForm } from "../../utils/authValidators";
import useForm from "../../hooks/useForm";
import Button from "../../components/auth/Button";
import FormMessage from "../../components/auth/FormMessage";
import PasswordField from "../../components/auth/PasswordField";
import styles from "./ResetPassword.module.css";

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = searchParams.get("token");

  const initialValues = {
    newPassword: "",
    confirmPassword: "",
  };

  const fieldOrder = ["newPassword", "confirmPassword"];

  const {
    values,
    errors,
    touched,
    isSubmitted,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm({
    initialValues,
    validate: validateResetPasswordForm,
    fieldOrder,
    onSubmit: async (formValues) => {
      if (!token) {
        return;
      }

      setFormError(null);
      setFormSuccess(null);
      setIsSubmitting(true);

      try {
        await resetPassword(token, formValues.newPassword);
        setFormSuccess("Password reset successfully");
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      } catch (err) {
        setFormError(err.message || "Failed to reset password");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const shouldShowError = (fieldName) =>
    (touched[fieldName] || isSubmitted) && errors[fieldName];

  const handleFieldChange = (event) => {
    if (formError) {
      setFormError(null);
    }
    handleChange(event);
  };

  if (!token) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>Invalid Reset Link</h1>
          <p className={styles.error}>
            The password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <div style={{ marginTop: "24px", textAlign: "center" }}>
            <Link className={styles.link} to="/forgot-password">
              Request a New Reset Link
            </Link>
          </div>
          <p className={styles.footer}>
            <Link className={styles.link} to="/login">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link to="/">
          <h1 className={styles.title}>Reset Password</h1>
        </Link>
        <p className={styles.subtitle}>Enter your new password below.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <PasswordField
            id="newPassword"
            name="newPassword"
            value={values.newPassword}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            placeholder="Enter new password"
            autoComplete="new-password"
            error={shouldShowError("newPassword")}
          />

          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            value={values.confirmPassword}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            placeholder="Confirm new password"
            autoComplete="new-password"
            error={shouldShowError("confirmPassword")}
          />

          {formSuccess && <FormMessage message={formSuccess} type="success" />}
          {formError && <FormMessage message={formError} type="error" />}

          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            Reset Password
          </Button>
        </form>

        <p className={styles.footer}>
          <Link className={styles.link} to="/login">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
