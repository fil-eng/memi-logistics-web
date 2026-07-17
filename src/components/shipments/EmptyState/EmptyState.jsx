import styles from "./EmptyState.module.css";

const EmptyState = ({ title = "Nothing here", description = "" }) => (
  <div className={styles.empty}>
    <div className={styles.title}>{title}</div>
    {description && <div className={styles.desc}>{description}</div>}
  </div>
);

export default EmptyState;
