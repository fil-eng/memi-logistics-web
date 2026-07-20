import { useEffect, useState } from "react";
import { useAuth } from "../../../state/auth/useAuth";
import { useProfile } from "../../../state/profile/useProfile";
import { useLocation } from "react-router-dom";
import AccountShell from "../../../components/profile/AccountShell/AccountShell";
import ProfileForm from "../../../components/profile/ProfileForm/ProfileForm";
import styles from "./Profile.module.css";

const Profile = () => {
  const { role, logout } = useAuth();
  const {
    profile,
    isLoading,
    isSaving,
    error,
    notFound,
    loadProfile,
    saveProfile,
    isProfileComplete,
  } = useProfile();
  const [activeSection, setActiveSection] = useState("settings");
  const [statusMessage, setStatusMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const location = useLocation();

  useEffect(() => {
    if (!formError && !successMessage && !statusMessage) return undefined;
    const timer = window.setTimeout(() => {
      setFormError("");
      setSuccessMessage("");
      setStatusMessage("");
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [formError, successMessage, statusMessage]);

  useEffect(() => {
    if (location.state?.message) {
      setStatusMessage(location.state.message);
    }
  }, [location.state]);

  useEffect(() => {
    if (!statusMessage && notFound && !isLoading) {
      setStatusMessage("Please complete your profile first.");
    }
  }, [notFound, isLoading, statusMessage]);

  useEffect(() => {
    if (!role) return;
    loadProfile("CARRIER");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const initialValues = {
    companyName: profile?.companyName || "",
    companyEmail: profile?.companyEmail || "",
    street: profile?.street || "",
    city: profile?.city || "",
    state: profile?.state || "",
    zip: profile?.zip || "",
    country: profile?.country || "",
    phoneNumber: profile?.phoneNumber || "",
  };

  const fields = [
    { name: "companyName", label: "Company Name", required: true },
    {
      name: "companyEmail",
      label: "Company Email",
      type: "email",
      required: true,
    },
    { name: "street", label: "Street", required: true },
    { name: "city", label: "City", required: true },
    { name: "state", label: "State", required: true },
    { name: "zip", label: "Zip", required: true },
    { name: "country", label: "Country", required: true },
    { name: "phoneNumber", label: "Phone Number", required: true },
  ];

  const handleSave = async (values) => {
    setFormError("");
    setSuccessMessage("");
    try {
      const result = await saveProfile(values);
      if (result?.noChanges) {
        setStatusMessage("No changes to update.");
        return;
      }
      setSuccessMessage("Profile saved successfully.");
      setStatusMessage("Your carrier profile is up to date.");
    } catch (err) {
      setFormError(err?.message || "Unable to save profile. Please try again.");
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { path: "/carrier/home", label: "Dashboard" },
    { path: "/carrier/available-shipments", label: "Available Shipments" },
    { path: "/carrier/notifications", label: "Notifications" },
    { key: "settings", label: "Account Settings" },
    { key: "logout", label: "Logout", onClick: handleLogout },
  ];

  return (
    <div className={styles.page}>
      <AccountShell
        title="My Account"
        subtitle="Manage your carrier profile and account settings."
        navigationItems={navItems}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        statusMessage={statusMessage}
      >
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <div>
              <h2>Account Settings</h2>
              <p>
                {isProfileComplete
                  ? "Update your carrier profile information."
                  : "Complete your carrier profile to submit offers."}
              </p>
            </div>
          </div>

          <ProfileForm
            initialValues={initialValues}
            fields={fields}
            onSubmit={handleSave}
            isSaving={isSaving}
            serverError={formError || error}
            successMessage={successMessage}
            submitLabel={profile ? "Update profile" : "Create profile"}
          />
        </div>
      </AccountShell>
    </div>
  );
};

export default Profile;
