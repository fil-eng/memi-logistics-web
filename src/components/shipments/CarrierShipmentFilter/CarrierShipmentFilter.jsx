import { useState } from "react";
import styles from "./CarrierShipmentFilter.module.css";
import Pagination from "../Pagination/Pagination";

const CarrierShipmentFilter = ({
  filters,
  onChange,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  loading,
  disableNext,
}) => {
  const [expandedGroups, setExpandedGroups] = useState({});

  const update = (key, value) => onChange({ ...filters, [key]: value });

  const toggleGroup = (group) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }));
  };

  const handleReset = () => {
    onChange({});
  };

  const dateLabels = {
    today: "Today",
    yesterday: "Yesterday",
    this_week: "This Week",
    this_month: "This Month",
    custom: "Custom",
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== null && v !== undefined && v !== "",
  ).length;

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterHeader}>
        <h2 className={styles.filterTitle}>
          Search & Filter
          {activeFilterCount > 0 && (
            <span className={styles.filterBadge}>{activeFilterCount}</span>
          )}
        </h2>
        {activeFilterCount > 0 && (
          <button
            type="button"
            className={styles.resetButton}
            onClick={handleReset}
          >
            Clear All
          </button>
        )}
      </div>

      <div className={styles.filterGrid}>
        {/* Type Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.groupLabel}>Type</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Search by type..."
            value={filters.type || ""}
            onChange={(e) => update("type", e.target.value || "")}
          />
        </div>

        {/* Pickup Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.groupLabel}>Pickup</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Search pickup location..."
            value={filters.pickupPoint || ""}
            onChange={(e) => update("pickupPoint", e.target.value || "")}
          />
        </div>

        {/* Destination Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.groupLabel}>Destination</label>
          <input
            type="text"
            className={styles.input}
            placeholder="Search destination..."
            value={filters.destination || ""}
            onChange={(e) => update("destination", e.target.value || "")}
          />
        </div>

        {/* Date Filter */}
        <div className={styles.filterGroup}>
          <label className={styles.groupLabel}>Date</label>
          <select
            className={styles.select}
            value={filters.date || ""}
            onChange={(e) => update("date", e.target.value || "")}
          >
            <option value="">All</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
          </select>
        </div>

        {/* Safety Type */}
        <div className={styles.filterGroup}>
          <label className={styles.groupLabel}>Safety Type</label>
          <select
            className={styles.select}
            value={filters.safety || ""}
            onChange={(e) => update("safety", e.target.value || null)}
          >
            <option value="">All Safety Types</option>
            <option value="safe">Safe</option>
            <option value="fragile">Fragile</option>
          </select>
        </div>

        {/* Amount Range */}
        <div className={`${styles.filterGroup} ${styles.amountGroup}`}>
          <label className={styles.groupLabel}>Amount Range</label>
          <div className={styles.amountInputs}>
            <input
              type="number"
              className={styles.input}
              placeholder="Min"
              value={filters.minAmount || ""}
              onChange={(e) =>
                update(
                  "minAmount",
                  e.target.value ? Number(e.target.value) : "",
                )
              }
            />
            <span className={styles.separator}>to</span>
            <input
              type="number"
              className={styles.input}
              placeholder="Max"
              value={filters.maxAmount || ""}
              onChange={(e) =>
                update(
                  "maxAmount",
                  e.target.value ? Number(e.target.value) : "",
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className={styles.activeFilters}>
          {filters.type && (
            <span className={styles.filterTag}>
              Type: {filters.type}
              <button
                type="button"
                onClick={() => update("type", "")}
                className={styles.tagClose}
              >
                ×
              </button>
            </span>
          )}
          {filters.pickupPoint && (
            <span className={styles.filterTag}>
              Pickup: {filters.pickupPoint}
              <button
                type="button"
                onClick={() => update("pickupPoint", "")}
                className={styles.tagClose}
              >
                ×
              </button>
            </span>
          )}
          {filters.destination && (
            <span className={styles.filterTag}>
              Destination: {filters.destination}
              <button
                type="button"
                onClick={() => update("destination", "")}
                className={styles.tagClose}
              >
                ×
              </button>
            </span>
          )}
          {filters.date && (
            <span className={styles.filterTag}>
              {dateLabels[filters.date] || filters.date}
              <button
                type="button"
                onClick={() => update("date", "")}
                className={styles.tagClose}
              >
                ×
              </button>
            </span>
          )}
          {filters.safety && (
            <span className={styles.filterTag}>
              {filters.safety.charAt(0).toUpperCase() + filters.safety.slice(1)}
              <button
                type="button"
                onClick={() => update("safety", "")}
                className={styles.tagClose}
              >
                ×
              </button>
            </span>
          )}
          {filters.minAmount && (
            <span className={styles.filterTag}>
              Min: ${filters.minAmount}
              <button
                type="button"
                onClick={() => update("minAmount", "")}
                className={styles.tagClose}
              >
                ×
              </button>
            </span>
          )}
          {filters.maxAmount && (
            <span className={styles.filterTag}>
              Max: ${filters.maxAmount}
              <button
                type="button"
                onClick={() => update("maxAmount", "")}
                className={styles.tagClose}
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      <div className={styles.paginationArea}>
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          loading={loading}
          disableNext={disableNext}
        />
      </div>
    </div>
  );
};

export default CarrierShipmentFilter;
