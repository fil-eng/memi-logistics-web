import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../state/auth/useAuth";
import { validateRegisterForm } from "../../../utils/authValidators";
import Button from "../../../components/auth/Button";
import FormMessage from "../../../components/auth/FormMessage";
import InputField from "../../../components/auth/InputField";
import PasswordField from "../../../components/auth/PasswordField";
import styles from "./RegistrationForm.module.css";

const RegistrationForm = ({ role }) => {
  const navigate = useNavigate();
  const { register, state, dispatch } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (state.isAuthenticated) {
      const destination =
        state.role === "CARRIER" ? "/carrier/dashboard" : "/shipper/dashboard";
      navigate(destination, { replace: true });
    }
  }, [state.isAuthenticated, state.role, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };
    setForm(updatedForm);
    setErrors(validateRegisterForm({ ...updatedForm, role }));
    if (state.errorMessage) {
      dispatch({ type: "CLEAR_FEEDBACK" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm({ ...form, role });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const result = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role,
      });

      const destination =
        result?.user?.role === "CARRIER"
          ? "/carrier/dashboard"
          : "/shipper/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      // Error handled by provider
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <InputField
        // label="Full Name"
        id="name"
        name="name"
        type="text"
        value={form.name}
        onChange={handleChange}
        placeholder="Enter your full name"
        autoComplete="name"
        error={errors.name}
      />

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
        placeholder="Create a password"
        autoComplete="new-password"
        error={errors.password}
      />

      <PasswordField
        // label="Confirm Password"
        id="confirmPassword"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm your password"
        autoComplete="new-password"
        error={errors.confirmPassword}
      />

      {state.errorMessage && (
        <FormMessage message={state.errorMessage} type="error" />
      )}

      <Button
        type="submit"
        loading={state.isLoading}
        disabled={state.isLoading || Object.keys(errors).length > 0}
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
