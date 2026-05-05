import styles from "./SummaryCards.module.css";

const SummaryCards = ({
  activeShipments = 0,
  pendingRequests = 0,
  completedDeliveries = 0,
  alerts = 0,
}) => {
  return (
    <section className={styles.section}>
      <div className={styles.grid}>
        <article className={styles.card}>
          <div className={styles.icon}>📦</div>
          <div className={styles.content}>
            <p className={styles.label}>Active Shipments</p>
            <strong className={styles.value}>{activeShipments}</strong>
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.icon}>⏳</div>
          <div className={styles.content}>
            <p className={styles.label}>Pending Requests</p>
            <strong className={styles.value}>{pendingRequests}</strong>
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.icon}>✅</div>
          <div className={styles.content}>
            <p className={styles.label}>Completed Deliveries</p>
            <strong className={styles.value}>{completedDeliveries}</strong>
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.icon}>🚨</div>
          <div className={styles.content}>
            <p className={styles.label}>Alerts</p>
            <strong className={styles.value}>{alerts}</strong>
          </div>
        </article>
      </div>
    </section>
  );
};

export default SummaryCards;
