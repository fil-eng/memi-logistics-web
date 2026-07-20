import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../state/auth/useAuth";
import { validateLoginForm } from "../../utils/authValidators";
import useForm from "../../hooks/useForm";
import Button from "../../components/auth/Button";
import FormMessage from "../../components/auth/FormMessage";
import InputField from "../../components/auth/InputField";
import PasswordField from "../../components/auth/PasswordField";
import styles from "./Login.module.css";

const Login = () => {
  const { login, state } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    email: "",
    password: "",
  };

  // Define field validation order for sequential validation
  const fieldOrder = ["email", "password"];

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
    validate: validateLoginForm,
    fieldOrder,
    onSubmit: async (formValues) => {
      setFormError(null);
      setIsSubmitting(true);

      try {
        const result = await login({
          email: formValues.email,
          password: formValues.password,
        });

        const normalizedRole = result?.role?.toString().toUpperCase();
        const destination =
          normalizedRole === "CARRIER"
            ? "/carrier/home"
            : normalizedRole === "SHIPPER"
              ? "/shipper/home"
              : normalizedRole === "ADMIN"
                ? "/admin/dashboard"
                : "/";
        navigate(destination, { replace: true });
      } catch (error) {
        const backendMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Something went wrong";

        // console.log(backendMessage); /*→ backend message */
        // console.log(error?.message); /*→ Axios/network message */
        setFormError(backendMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (state.isAuthenticated) {
      const normalizedRole = state.role?.toString().toUpperCase();
      const destination =
        normalizedRole === "CARRIER"
          ? "/carrier/home"
          : normalizedRole === "SHIPPER"
            ? "/shipper/home"
            : normalizedRole === "ADMIN"
              ? "/admin/dashboard"
              : "/";
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
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link to="/">
          <h1 className={styles.title}>Welcome back</h1>
        </Link>
        <p className={styles.subtitle}>Login to your MEMI logistics account.</p>

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
            placeholder="Enter your password"
            autoComplete="current-password"
            error={shouldShowError("password")}
          />

          {formError && <FormMessage message={formError} type="error" />}

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className={styles.login_btn}
          >
            Login
          </Button>
          <p className={styles.refersh_info}>
            Our project is hosted on a free platform, so the server may be
            asleep. Please refresh and try again.
          </p>
          <p className={styles.footer} style={{ marginTop: "12px" }}>
            <Link className={styles.link} to="/forgot-password">
              Forgot Password?
            </Link>
          </p>
        </form>

        <p className={styles.footer}>
          Don't have an account?{" "}
          <Link className={styles.link} to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
