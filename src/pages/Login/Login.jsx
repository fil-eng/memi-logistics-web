import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../state/auth/useAuth";
import styles from "./Login.module.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [localError, setLocalError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getDashboardRoute = (role) => {
    if (role === "CARRIER") return "/carrier/dashboard";
    return "/shipper/dashboard";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    setLoading(true);
    console.log(form);
    try {
      const result = await login({
        email: form.email,
        password: form.password,
      });

      const role = result?.user?.role;
      navigate(getDashboardRoute(role), { replace: true });
    } catch (err) {
      setLocalError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Login to MEMI Logistics Platform</p>

        <form className={styles.form} onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {localError && <p className={styles.error}>{localError}</p>}

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className={styles.footer}>
          No account yet?{" "}
          <Link className={styles.link} to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
