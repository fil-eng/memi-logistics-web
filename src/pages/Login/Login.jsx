import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../state/auth/useAuth";
import { validateLoginForm } from "../../utils/authValidators";
import Button from "../../components/auth/Button";
import FormMessage from "../../components/auth/FormMessage";
import InputField from "../../components/auth/InputField";
import PasswordField from "../../components/auth/PasswordField";
import styles from "./Login.module.css";

const Login = () => {
  const { login, state, dispatch } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (state.isAuthenticated) {
      const destination =
        state.role === "CARRIER"
          ? "/carrier/dashboard"
          : state.role === "SHIPPER"
            ? "/shipper/dashboard"
            : "/";
      navigate(destination, { replace: true });
    }
  }, [state.isAuthenticated, state.role, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    setErrors(validateLoginForm(updatedForm));
    if (state.errorMessage) {
      dispatch({ type: "CLEAR_FEEDBACK" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const result = await login({
        email: form.email,
        password: form.password,
      });

      const destination =
        result?.user?.role === "CARRIER"
          ? "/carrier/dashboard"
          : result?.user?.role === "SHIPPER"
            ? "/shipper/dashboard"
            : "/";
      navigate(destination, { replace: true });
    } catch (err) {
      // Error is handled by provider
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link to="/">
          {" "}
          <h1 className={styles.title}>Welcome back</h1>
        </Link>
        <p className={styles.subtitle}>Login to your MEMI logistics account.</p>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <InputField
            // label="Email"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            error={errors.email}
          />

          <PasswordField
            // label="Password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password}
          />

          {state.errorMessage && (
            <FormMessage message={state.errorMessage} type="error" />
          )}

          <Button
            type="submit"
            loading={state.isLoading}
            disabled={state.isLoading || Object.keys(errors).length > 0}
          >
            Login
          </Button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{" "}
          <Link className={styles.link} to="/register">
            Register
          </Link>{" "}
          {/* or{" "}
          <Link className={styles.link} to="/register/carrier">
            Register as Carrier
          </Link> */}
        </p>
      </div>
    </div>
  );
};

export default Login;
