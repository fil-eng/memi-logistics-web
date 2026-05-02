import { useState, useEffect } from "react";
import { useNavigate, Link, Links } from "react-router-dom";
import { useAuth } from "../../state/auth/useAuth";
import { validateLoginForm } from "../../utils/authValidators";
import Button from "../../components/auth/Button";
import FormMessage from "../../components/auth/FormMessage";
import InputField from "../../components/auth/InputField";
import styles from "./Login.module.css";

const Login = () => {
  const { login, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const destination =
        role === "CARRIER"
          ? "/carrier/dashboard"
          : role === "SHIPPER"
            ? "/shipper/dashboard"
            : "/";
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    setErrors(validateLoginForm(updatedForm));
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateLoginForm(form);
    setErrors(validationErrors);
    setSubmitError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

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
      setSubmitError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
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
            label="Email"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            error={errors.email}
          />

          <InputField
            label="Password"
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password}
          />

          {submitError && <FormMessage message={submitError} type="error" />}

          <Button
            type="submit"
            loading={loading}
            disabled={loading || Object.keys(errors).length > 0}
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
