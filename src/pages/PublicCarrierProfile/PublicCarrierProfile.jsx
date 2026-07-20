import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPublicCarrierProfile } from "../../services/profile.service";
import styles from "./PublicCarrierProfile.module.css";

const PublicCarrierProfile = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    const loadProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await getPublicCarrierProfile(id);
        setProfile(result);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load carrier profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  return (
    <div className={styles.page}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        Back
      </button>

      {loading ? (
        <div className={styles.message}>Loading carrier profile…</div>
      ) : error ? (
        <div className={styles.message}>{error}</div>
      ) : !profile ? (
        <div className={styles.message}>Carrier profile not found.</div>
      ) : (
        <div className={styles.card}>
          <h1 className={styles.title}>Carrier Profile</h1>
          <div className={styles.row}>
            <span className={styles.label}>Carrier ID</span>
            <span>{id}</span>
          </div>
          {profile.companyName && (
            <div className={styles.row}>
              <span className={styles.label}>Company Name</span>
              <span>{profile.companyName}</span>
            </div>
          )}
          {profile.companyEmail && (
            <div className={styles.row}>
              <span className={styles.label}>Email</span>
              <span>{profile.companyEmail}</span>
            </div>
          )}
          {profile.phoneNumber && (
            <div className={styles.row}>
              <span className={styles.label}>Phone</span>
              <span>{profile.phoneNumber}</span>
            </div>
          )}
          {(profile.street ||
            profile.city ||
            profile.state ||
            profile.zip ||
            profile.country) && (
            <div className={styles.row}>
              <span className={styles.label}>Address</span>
              <span>
                {[
                  profile.street,
                  profile.city,
                  profile.state,
                  profile.zip,
                  profile.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PublicCarrierProfile;
