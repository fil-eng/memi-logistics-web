import { Link } from "react-router-dom";
import { useAuth } from "../../../state/auth/useAuth";
import { useShipment } from "../../../state/shipments/useShipment";
import SummaryCards from "../SummaryCards/SummaryCards";
import styles from "./ShipperHome.module.css";

const ShipperHome = () => {
  const { state } = useAuth();
  const { user } = state;
  const { state: shipmentState } = useShipment();
  const { shipments } = shipmentState;

  const activeShipments = shipments.filter(
    (item) => item.status !== "delivered",
  ).length;
  const pendingRequests = shipments.filter(
    (item) => item.status === "pending",
  ).length;
  const completedDeliveries = shipments.filter(
    (item) => item.status === "delivered",
  ).length;
  const alerts = shipments.filter(
    (item) => item.status === "delayed" || item.status === "alert",
  ).length;

  return (
    <div className={styles.homePage}>
      <section className={styles.heroCard}>
        <div>
          <p className={styles.badge}>
            Welcome back, {user?.name || "Shipper"}
          </p>
          <h1 className={styles.heading}>Your MEMI shipper home.</h1>
          <p className={styles.subtitle}>
            Plan new shipments, keep your active work visible, and track
            delivery progress all in one place.
          </p>
        </div>

        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} to="create-shipment">
            Create Shipment
          </Link>
          <Link className={styles.secondaryButton} to="active-shipments">
            View Active Shipments
          </Link>
        </div>
      </section>

      <SummaryCards
        activeShipments={activeShipments}
        pendingRequests={pendingRequests}
        completedDeliveries={completedDeliveries}
        alerts={alerts}
      />

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Quick overview</h2>
          
        </div>

        <div className={styles.grid}>
          <article className={styles.infoCard}>
            <h3>Fast shipment setup</h3>
            <p>
              Create and post a shipment in minutes, then return to the same
              dashboard shell for updates.
            </p>
          </article>
          <article className={styles.infoCard}>
            <h3>Clear status updates</h3>
            <p>
              Pending requests, active loads, and completed deliveries are
              separated into dedicated pages.
            </p>
          </article>
          <article className={styles.infoCard}>
            <h3>Notifications that matter</h3>
            <p>
              Recent actions and status changes are summarized so you can stay
              on top of every load.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default ShipperHome;
