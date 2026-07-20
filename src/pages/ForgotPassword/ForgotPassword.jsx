import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../state/auth/useAuth";
import { validateForgotPasswordForm } from "../../utils/authValidators";
import useForm from "../../hooks/useForm";
import Button from "../../components/auth/Button";
import FormMessage from "../../components/auth/FormMessage";
import InputField from "../../components/auth/InputField";
import styles from "./ForgotPassword.module.css";

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    email: "",
  };

  const fieldOrder = ["email"];

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
    validate: validateForgotPasswordForm,
    fieldOrder,
    onSubmit: async (formValues) => {
      setFormError(null);
      setFormSuccess(null);
      setIsSubmitting(true);

      try {
        await forgotPassword(formValues.email);
        setFormSuccess("we will send you a reset link to your email");
      } catch (err) {
        setFormError(err.message || "Failed to send reset link");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleFieldChange = (event) => {
    if (formError) {
      setFormError(null);
    }
    handleChange(event);
  };

  const shouldShowError = (fieldName) =>
    (touched[fieldName] || isSubmitted) && errors[fieldName];

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link to="/">
          <h1 className={styles.title}>Forgot Password</h1>
        </Link>
        <p className={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <InputField
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            placeholder="Enter your email"
            autoComplete="email"
            error={shouldShowError("email")}
          />

          {formSuccess && <FormMessage message={formSuccess} type="success" />}
          {formError && <FormMessage message={formError} type="error" />}

          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            Send Reset Link
          </Button>
        </form>

        <p className={styles.footer}>
          Remember your password?{" "}
          <Link className={styles.link} to="/login">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
