import styles from "./CarrierHome.module.css";
import DashboardCard from "../components/DashboardCard/DashboardCard";
import { useShipment } from "../../../state/shipments/useShipment";

const CarrierHome = () => {
  const { state } = useShipment();
  const pendingOffers = (state.offers || []).length;
  const activeJobs = (state.shipments || []).filter(
    (s) => s.assignedCarrierId,
  ).length;
  const completed = (state.shipments || []).filter(
    (s) => s.status === "COMPLETED",
  ).length;

  return (
    <div>
      <div className={styles.headerRow}>
        <h1 className="pageTitle">Carrier Home</h1>
      </div>

      <div className={styles.cards}>
        <DashboardCard title="Active Jobs" value={activeJobs} />
        <DashboardCard title="Pending Offers" value={pendingOffers} />
        <DashboardCard title="Completed" value={completed} />
      </div>
    </div>
  );
};

export default CarrierHome;
