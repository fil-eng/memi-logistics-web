import { useShipment } from "../../../state/shipments/useShipment";
import styles from "./CompletedDeliveries.module.css";

const CompletedDeliveries = () => {
  const { state } = useShipment();
  const delivered = state.shipments.filter(
    (shipment) => shipment.status === "delivered",
  );

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <p className={styles.badge}>Completed deliveries</p>
        <h1>Successfully delivered</h1>
        <p className={styles.subtitle}>
          Review shipments that have completed their journey.
        </p>
      </div>

      {delivered.length === 0 ? (
        <div className={styles.empty}>No completed deliveries yet.</div>
      ) : (
        <div className={styles.grid}>
          {delivered.map((shipment) => (
            <article key={shipment.id} className={styles.card}>
              <div>
                <h2>{shipment.shipmentType}</h2>
                <p className={styles.smallLabel}>{shipment.shipperName}</p>
              </div>
              <p className={styles.route}>
                {shipment.pickupPoint} → {shipment.destination}
              </p>
              <p className={styles.meta}>Delivered on {shipment.date}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedDeliveries;
