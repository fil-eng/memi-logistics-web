import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../state/auth/useAuth";
import { validateRegisterForm } from "../../../utils/authValidators";
import useForm from "../../../hooks/useForm";
import Button from "../../../components/auth/Button";
import FormMessage from "../../../components/auth/FormMessage";
import InputField from "../../../components/auth/InputField";
import PasswordField from "../../../components/auth/PasswordField";
import styles from "./RegistrationForm.module.css";

const RegistrationForm = ({ role }) => {
  const navigate = useNavigate();
  const { register, state } = useAuth();
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    email: "",
    password: "",
    confirmPassword: "",
  };

  // Define field validation order for sequential validation
  const fieldOrder = ["email", "password", "confirmPassword"];

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
    validate: validateRegisterForm,
    fieldOrder,
    onSubmit: async (formValues) => {
      setFormError(null);
      setIsSubmitting(true);

      try {
        await register({
          email: formValues.email,
          password: formValues.password,
          role,
        });

        navigate("/login", { replace: true });
      } catch (err) {
        setFormError(err.message || "Registration failed");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (state.isAuthenticated) {
      const destination =
        state.role === "CARRIER" ? "/carrier/home" : "/shipper/home";
      navigate(destination, { replace: true });
    }
  }, [state.isAuthenticated, state.role, navigate]);

  const shouldShowError = (fieldName) =>
    (touched[fieldName] || isSubmitted) && errors[fieldName];

  const handleFieldChange = (event) => {
    if (formError) {
      setFormError(null);
    }
    handleChange(event);
  };

  return (
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

      <PasswordField
        id="password"
        name="password"
        value={values.password}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        placeholder="Create a password"
        autoComplete="new-password"
        error={shouldShowError("password")}
      />

      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={handleFieldChange}
        onBlur={handleBlur}
        placeholder="Confirm your password"
        autoComplete="new-password"
        error={shouldShowError("confirmPassword")}
      />

      {formError && <FormMessage message={formError} type="error" />}

      <Button type="submit" loading={isSubmitting}>
        Register
      </Button>
      <p className={styles.footer}>
        Already have an account?{" "}
        <Link className={styles.link} to="/login">
          Login
        </Link>
      </p>
    </form>
  );
};

export default RegistrationForm;
