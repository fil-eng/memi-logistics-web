import { useShipment } from "../../../state/shipments/useShipment";
import { formatRelativeTime } from "../../../utils/time";
import styles from "./Notifications.module.css";

const Notifications = () => {
  const { state } = useShipment();
  const notifications = state.shipments
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .map((shipment) => ({
      id: shipment.id,
      title: `Shipment ${shipment.shipmentType} ${shipment.status === "delivered" ? "delivered" : shipment.status === "pending" ? "is pending" : "updated"}`,
      details: `${shipment.pickupPoint} → ${shipment.destination}`,
      time: formatRelativeTime(shipment.updatedAt),
    }));

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <p className={styles.badge}>Notifications</p>
        <h1>Recent shipment updates</h1>
        <p className={styles.subtitle}>
          Notifications are based on the latest client-side shipment activity.
        </p>
      </div>

      {notifications.length === 0 ? (
        <div className={styles.empty}>No notifications yet.</div>
      ) : (
        <div className={styles.list}>
          {notifications.map((item) => (
            <article key={item.id} className={styles.card}>
              <h2>{item.title}</h2>
              <p>{item.details}</p>
              <time>{item.time}</time>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
