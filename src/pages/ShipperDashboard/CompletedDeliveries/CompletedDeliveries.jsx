import { useEffect, useState } from "react";
import { fetchShipperShipments } from "../../../services/shipment.service";
import { sortByLatestDateDesc } from "../../../utils/sortUtils";
import { formatLocalDateTime } from "../../../utils/time";
import styles from "./CompletedDeliveries.module.css";

const CompletedDeliveries = () => {
  const [delivered, setDelivered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCompleted = async () => {
      setIsLoading(true);
      setError("");
      try {
        const shipments = await fetchShipperShipments({ page: 0, size: 50 });
        const completed = shipments.filter(
          (shipment) => shipment.status === "COMPLETED",
        );
        setDelivered(sortByLatestDateDesc(completed));
      } catch (err) {
        setError(err?.message || "Failed to load completed deliveries");
        setDelivered([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompleted();
    const handler = () => loadCompleted();
    window.addEventListener("shipperShipmentsUpdated", handler);
    return () => window.removeEventListener("shipperShipmentsUpdated", handler);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        {/* <p className={styles.badge}>Completed deliveries</p>
        <h1>Successfully delivered</h1> */}
        <p className={styles.subtitle}>
          Review shipments that have completed their journey.
        </p>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {isLoading ? (
        <div className={styles.loading}>Loading completed deliveries…</div>
      ) : delivered.length === 0 ? (
        <div className={styles.empty}>No completed deliveries yet.</div>
      ) : (
        <div className={styles.grid}>
          {delivered.map((shipment) => {
            console.log(shipment);
            return (
              <article key={shipment.id} className={styles.card}>
                <div className={styles.itemInfo}>
                  <p>{shipment.shipmentType}</p>
                  {/* <p className={styles.smallLabel}>{"shipment.shipperName"}</p> */}
                  <p className={styles.route}>
                    {shipment.pickupPoint} <span>→ </span>
                    {shipment.destination}
                  </p>
                </div>

                <p className={styles.meta}>
                  <strong>Delivered on : </strong>
                  {formatLocalDateTime(shipment.completedAt) ||
                    shipment.completedAt}
                    {/* <strong>createdAt : </strong>
                    {formatLocalDateTime(shipment.completedAt) ||
                    shipment.createdAt} */}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompletedDeliveries;
