import styles from "./DashboardCard.module.css";

const DashboardCard = ({ title, value }) => (
  <div className={styles.card}>
    <div className={styles.title}>{title}</div>
    <div className={styles.value}>{value}</div>
  </div>
);

export default DashboardCard;
