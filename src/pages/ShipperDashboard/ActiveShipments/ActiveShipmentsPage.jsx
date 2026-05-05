import { useShipment } from "../../../state/shipments/useShipment";
import { formatTime12Hour, formatDate } from "../../../utils/time";
import styles from "./ActiveShipmentsPage.module.css";

const ActiveShipmentsPage = () => {
  const { state } = useShipment();
  const shipments = state.shipments.filter(
    (shipment) => shipment.status !== "delivered",
  );

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <p className={styles.badge}>Active shipments</p>
          <h1>Shipments in progress</h1>
          <p className={styles.subtitle}>
            All current shipment requests that are not yet completed are shown
            here.
          </p>
        </div>
      </div>

      {shipments.length === 0 ? (
        <div className={styles.empty}>
          No active shipments yet. Create a shipment to get started.
        </div>
      ) : (
        <div className={styles.list}>
          {shipments.map((shipment) => (
            <article key={shipment.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.internal_div}>
                  {" "}
                  <span>shipment Type : </span>
                  <p>{shipment.shipmentType}</p>
                </div>
                <span className={styles.status}>{shipment.status}</span>
              </div>
              <div className={styles.internal_div}>
                <span>shipper Name :</span>
                <p className={styles.cardTitle}>{shipment.shipperName}</p>
              </div>

              <div className={styles.row}>
                <div>
                  <span>Amount : </span>
                  <p>
                    {shipment.amount} {shipment.unit}
                  </p>
                </div>
                <div>
                  <span>Safety : </span>
                  <strong>{shipment.safetyOption}</strong>
                </div>
              </div>
              <div className={styles.row}>
                <div>
                  <span>Pickup : </span>
                  <p>{shipment.pickupPoint}</p>
                </div>
                <div>
                  <span>Destination : </span>
                  <p>{shipment.destination}</p>
                </div>
              </div>
              <div className={styles.rowFooter}>
                <span>Created : {formatTime12Hour(shipment.createdAt)}</span>
                <p>
                  {formatDate(shipment.date)} •{" "}
                  {formatTime12Hour(shipment.date)}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveShipmentsPage;
