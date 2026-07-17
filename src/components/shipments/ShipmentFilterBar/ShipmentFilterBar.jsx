import styles from "./ShipmentFilterBar.module.css";

const ShipmentFilterBar = ({ filters, onChange }) => {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className={styles.bar}>
      <input
        className={styles.input}
        placeholder="Type"
        value={filters.type || ""}
        onChange={(e) => update("type", e.target.value)}
      />

      <input
        className={styles.input}
        placeholder="Pickup"
        value={filters.pickupPoint || ""}
        onChange={(e) => update("pickupPoint", e.target.value)}
      />

      <input
        className={styles.input}
        placeholder="Destination"
        value={filters.destination || ""}
        onChange={(e) => update("destination", e.target.value)}
      />

      <select
        className={styles.select}
        value={filters.date || ""}
        onChange={(e) => update("date", e.target.value)}
      >
        <option value="">All</option>
        <option value="today">Today</option>
        <option value="yesterday">Yesterday</option>
        <option value="this_week">This Week</option>
        <option value="this_month">This Month</option>
      </select>

      <select
        className={styles.select}
        value={filters.safety || ""}
        onChange={(e) => update("safety", e.target.value)}
      >
        <option value="">Any safety</option>
        <option value="safe">Safe</option>
        <option value="fragile">Fragile</option>
      </select>

      <div className={styles.group}>
        <input
          className={styles.input}
          placeholder="Min amount"
          value={filters.minAmount || ""}
          onChange={(e) => update("minAmount", e.target.value)}
        />
        <input
          className={styles.input}
          placeholder="Max amount"
          value={filters.maxAmount || ""}
          onChange={(e) => update("maxAmount", e.target.value)}
        />
      </div>
    </div>
  );
};

export default ShipmentFilterBar;
