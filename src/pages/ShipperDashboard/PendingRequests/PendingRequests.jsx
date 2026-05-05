import { useShipment } from "../../../state/shipments/useShipment";
import styles from "./PendingRequests.module.css";

const PendingRequests = () => {
  const { state } = useShipment();
  const pending = state.shipments.filter(
    (shipment) => shipment.status === "pending",
  );

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <p className={styles.badge}>Pending requests</p>
        <h1>Awaiting carrier action</h1>
        <p className={styles.subtitle}>
          Shipments are waiting for carrier matching and approval.
        </p>
      </div>

      {pending.length === 0 ? (
        <div className={styles.empty}>No pending requests found.</div>
      ) : (
        <div className={styles.list}>
          {pending.map((shipment) => (
            <article key={shipment.id} className={styles.card}>
              <h2>shipment Type : {shipment.shipmentType}</h2>
              <p className={styles.smallLabel}>shipper Name : {shipment.shipperName}</p>
              <div className={styles.details}>
                <span>{shipment.pickupPoint}</span>
                <span>→</span>
                <span>{shipment.destination}</span>
              </div>
              <p className={styles.meta}>Pickup date: {shipment.date}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRequests;
