import { useEffect, useState } from "react";
import styles from "./CompletedJobs.module.css";
import { fetchCarrierAssignedShipments } from "../../../services/shipment.service";
import { sortByLatestDateDesc } from "../../../utils/sortUtils";
import { formatLocalDateTime } from "../../../utils/time";
import { useAuth } from "../../../state/auth/useAuth";
import { useProfile } from "../../../state/profile/useProfile";

const CompletedJobs = () => {
  const auth = useAuth();
  const { profile } = useProfile();
  const [myCompleted, setMyCompleted] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const carrierId = String(
    profile?.carrierId ||
      profile?.id ||
      auth.user?.id ||
      auth.user?.carrierId ||
      "",
  );

  const loadCompletedJobs = async () => {
    setIsLoading(true);
    setError("");
    try {
      if (!carrierId) {
        setMyCompleted([]);
        return;
      }
      const shipments = await fetchCarrierAssignedShipments(carrierId);
      const completed = shipments.filter((s) => s.status === "COMPLETED");
      setMyCompleted(sortByLatestDateDesc(completed));
    } catch (err) {
      setError(err?.message || "Failed to load completed jobs");
      setMyCompleted([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCompletedJobs();
    const handler = () => loadCompletedJobs();
    window.addEventListener("carrierOffersUpdated", handler);
    return () => window.removeEventListener("carrierOffersUpdated", handler);
  }, [carrierId]);

  return (
    <div style={{ padding: 12 }}>
      {/* <h1 className="pageTitle">Completed Jobs</h1> */}
      <div className={styles.list}>
        {myCompleted.length === 0 && (
          <div className={styles.empty}>No completed jobs</div>
        )}
        {myCompleted.map((s) => (
          <div key={s.id} className={styles.item}>
            <div className={styles.itemInfo}>
              <strong>{s.shipmentType}</strong>
              <span>
                {s.pickupPoint} → {s.destination}
              </span>
            </div>

            <div >
              Completed at : {" "}
              { formatLocalDateTime(s.completedAt) || s.completedAt}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletedJobs;
