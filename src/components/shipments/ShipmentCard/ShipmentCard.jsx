import styles from "./ShipmentCard.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../state/auth/useAuth";

const ShipmentCard = ({ shipment, onOffer }) => {
  const nav = useNavigate();
  const auth = useAuth();

  const openDetail = () => nav(`/shipments/${shipment.id}`);
  console.log(shipment);
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <div>
          <div className={styles.title}>
            Type : {shipment.shipmentType || "Shipment"}
          </div>
          <div className={styles.meta}>
            {shipment.pickupPoint} → {shipment.destination}
          </div>
        </div>
        <div className={styles.small}>Status: {shipment.status}</div>
      </div>

      <div className={styles.row}>
        <div className={styles.small}>
          Amount: {shipment.amount} {shipment.unit}
        </div>
        
        {/* <div>Picupdate : {shipment.createdAt}</div> */}
        <div>Safty : {shipment.fragile ? "fragile" : "Non Fragile"}</div>
      </div>
      <div className={styles.actions}>
        <button className={styles.offerBtn} onClick={() => onOffer(shipment)}>
          Offer Shipment
        </button>
      </div>
    </div>
  );
};

export default ShipmentCard;
