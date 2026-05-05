import { useAuth } from "../../../state/auth/useAuth";
import styles from "./Profile.module.css";

const Profile = () => {
  const { state: authState } = useAuth();
  const { user } = authState;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <p className={styles.badge}>Profile</p>

        <div className={styles.details}>
          <div>
            <strong>{user?.name || "Shipper"}</strong>
            <p className={styles.role}>{user?.role || "SHIPPER NAME"}</p>
          </div>
          <div>
            <strong>Email : </strong>
            <p>{user?.email || "No email available"}</p>
          </div>
          <div>
            <strong>Business details : </strong>
            <p>{user?.businessName || "Not set"}</p>
          </div>
          <div>
            <strong>Role : </strong>
            <p>{user?.role || "SHIPPER"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
