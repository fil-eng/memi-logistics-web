import { useEffect, useState } from "react";
import { useShipment } from "../../state/shipments/useShipment";
import ShipmentCard from "../../components/shipments/ShipmentCard/ShipmentCard";
import OfferModal from "../../components/shipments/OfferModal/OfferModal";
import { sortByLatestDateDesc } from "../../utils/sortUtils";
import styles from "./Shipments.module.css";
import { useAuth } from "../../state/auth/useAuth";
import { useNavigate } from "react-router-dom";

const Shipments = () => {
  const { state, loadShipments, submitOffer } = useShipment();
  const [selected, setSelected] = useState(null);
  const auth = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    loadShipments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pending = sortByLatestDateDesc(
    (state.shipments || []).filter((s) => s.status === "PENDING"),
  );

  const onOffer = (shipment) => {
    if (!auth.isAuthenticated || auth.role !== "CARRIER") {
      nav("/login");
      return;
    }
    setSelected(shipment);
  };

  return (
    <div className={styles.board}>
      <div className={styles.filters}>
        <input placeholder="Search" />
        <select>
          <option value="all">All types</option>
        </select>
      </div>

      <div className={styles.grid}>
        {pending.length === 0 && <div>No pending shipments</div>}
        {pending.map((s) => (
          <ShipmentCard key={s.id} shipment={s} onOffer={onOffer} />
        ))}
      </div>

      {selected && (
        <OfferModal
          shipment={selected}
          onClose={() => setSelected(null)}
          onSubmit={async (offer) => {
            try {
              // Submit only the numeric price value to match backend contract
              const numeric = Number(offer.offerPrice || offer.price || 0);
              await submitOffer(selected.id, numeric);
            } catch (err) {
              setSelected(null);
              return;
            }
            setSelected(null);
          }}
        />
      )}
    </div>
  );
};

export default Shipments;
