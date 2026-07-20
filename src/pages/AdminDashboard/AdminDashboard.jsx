import { useEffect, useState } from "react";
import { fetchAdminDashboardData } from "../../services/shipment.service";
import styles from "./AdminDashboard.module.css";
import Navbar from "../../components/layout/Navbar/Navbar";

const metricLabels = {
  pendingShipments: "Pending Shipments",
  completedShipments: "Completed Shipments",
  fragileShipments: "Fragile Shipments",
  nonFragileShipments: "Non-Fragile Shipments",
  numberOfShippers: "Number of Shippers",
  numberOfCarriers: "Number of Carriers",
  totalUsers: "Total Users",
  totalShipments: "Total Shipments",
};

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchAdminDashboardData();
        if (isMounted) {
          setDashboard(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load admin dashboard data.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const metrics = dashboard
    ? Object.keys(metricLabels).map((key) => ({
        key,
        label: metricLabels[key],
        value:
          typeof dashboard[key] === "number"
            ? dashboard[key]
            : (dashboard[key] ?? 0),
      }))
    : [];

  return (
    <>
      <Navbar buttons={false} />
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              Manage shipper and carrier operations
            </h1>
            <p className={styles.description}>
              View the latest shipment counts, user totals, and shipment status
              metrics.
            </p>
          </div>
        </header>

        {isLoading ? (
          <div className={styles.loading}>Loading admin dashboard...</div>
        ) : error ? (
          <div className={styles.errorMessage}>{error}</div>
        ) : (
          <div className={styles.grid}>
            {metrics.map((metric) => (
              <div key={metric.key} className={styles.card}>
                <p className={styles.metricLabel}>{metric.label}</p>
                <p className={styles.metricValue}>{metric.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;
