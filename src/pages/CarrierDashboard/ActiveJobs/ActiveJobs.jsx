import styles from "./ActiveJobs.module.css";
import { useShipment } from "../../../state/shipments/useShipment";
import { sortByLatestDateDesc } from "../../../utils/sortUtils";
import { useAuth } from "../../../state/auth/useAuth";

const allowedNext = {
  ASSIGNED: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "ARRIVED_AT_DESTINATION",
  ARRIVED_AT_DESTINATION: "DELIVERED",
};

const ActiveJobs = () => {
  const { state, updateShipmentStatus } = useShipment();
  const auth = useAuth();

  const myAssigned = sortByLatestDateDesc(
    (state.shipments || [])
      .filter(
        (s) =>
          s.assignedCarrierId === (auth.user?.id || auth.user?.carrierId) &&
          s.status !== "DELIVERED" &&
          s.status !== "COMPLETED",
      )
      .map((shipment) => ({ ...shipment })),
  );

  const advance = (shipment) => {
    const next = allowedNext[shipment.status];
    if (!next) return;
    updateShipmentStatus(shipment.id, next);
  };

  return (
    <div style={{ padding: 12 }}>
      <h1 className="pageTitle">Active Jobs</h1>
      <div className={styles.list}>
        {myAssigned.length === 0 && (
          <div className={styles.empty}>No active jobs</div>
        )}
        {myAssigned.map((s) => (
          <div key={s.id} className={styles.job}>
            <div>
              <strong>{s.shipmentType}</strong>
            </div>
            <div>Status: {s.status}</div>
            <div>
              Pickup → Destination: {s.pickupPoint} → {s.destination}
            </div>
            <div className={styles.actions}>
              <button onClick={() => advance(s)}>Advance to next</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActiveJobs;
