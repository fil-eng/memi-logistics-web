import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/auth/useAuth";
import { validateRegisterForm } from "../../utils/authValidators";
import Button from "./Button";
import FormMessage from "./FormMessage";
import styles from "./RegistrationForm.module.css";

const RegistrationForm = ({ role }) => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: role,
  });

  const [errors, setErrors] = useState({});
  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    setErrors(validateRegisterForm(updatedForm));
    setLocalError("");
  };

  const getDashboardRoute = (role) => {
    if (role === "CARRIER") return "/carrier/dashboard";
    return "/shipper/dashboard";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);
    setLocalError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      const userRole = result?.user?.role;
      navigate(getDashboardRoute(userRole), { replace: true });
    } catch (err) {
      setLocalError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="name">
          Full Name
        </label>
        <input
          className={styles.input}
          id="name"
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          autoComplete="name"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email">
          Email
        </label>
        <input
          className={styles.input}
          id="email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
          autoComplete="email"
          required
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="password">
          Password
        </label>
        <input
          className={styles.input}
          id="password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Create a password"
          autoComplete="new-password"
          required
        />
        {errors.password && <p className={styles.error}>{errors.password}</p>}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="confirmPassword">
          Confirm Password
        </label>
        <input
          className={styles.input}
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
          autoComplete="new-password"
          required
        />
        {errors.confirmPassword && (
          <p className={styles.error}>{errors.confirmPassword}</p>
        )}
      </div>

      {localError && <FormMessage message={localError} type="error" />}

      <Button
        type="submit"
        loading={loading}
        disabled={loading || Object.keys(errors).length > 0}
      >
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
