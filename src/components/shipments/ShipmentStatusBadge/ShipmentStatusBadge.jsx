import styles from "./ShipmentStatusBadge.module.css";

const ShipmentStatusBadge = ({ status }) => {
  const cls = status ? status.toString().toUpperCase() : "UNKNOWN";
  return <span className={`${styles.badge} ${styles[cls] || ""}`}>{cls}</span>;
};

export default ShipmentStatusBadge;
