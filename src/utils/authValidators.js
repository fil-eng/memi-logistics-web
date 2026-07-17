export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return errors;
};

export const validateRegisterForm = ({ email, password, confirmPassword }) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8 || password.length > 20) {
    errors.password = "Password must be 8-20 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm password is required.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords must match.";
  }

  return errors;
};

export const validateForgotPasswordForm = ({ email }) => {
  const errors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
};

export const validateResetPasswordForm = ({ newPassword, confirmPassword }) => {
  const errors = {};

  if (!newPassword) {
    errors.newPassword = "Password is required.";
  } else if (newPassword.length < 8 || newPassword.length > 20) {
    errors.newPassword = "Password must be 8-20 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm password is required.";
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = "Passwords must match.";
  }

  return errors;
};
