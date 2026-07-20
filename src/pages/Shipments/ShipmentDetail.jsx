import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useShipment } from "../../state/shipments/useShipment";
import OfferModal from "../../components/shipments/OfferModal/OfferModal";

const ShipmentDetail = () => {
  const { id } = useParams();
  const { state, loadShipmentById, submitOffer } = useShipment();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadShipmentById(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const shipment = (state.shipments || []).find(
    (s) => String(s.id) === String(id),
  );
  if (!shipment) return <div>Shipment not found</div>;

  return (
    <div style={{ padding: 12 }}>
      <h2>{shipment.shipmentType}</h2>
      <p>
        {shipment.pickupPoint} → {shipment.destination}
      </p>
      <p>
        Amount: {shipment.amount} {shipment.unit}
      </p>
      <p>Status: {shipment.status}</p>
      <button onClick={() => setShowModal(true)}>Offer Shipment</button>
      {showModal && (
        <OfferModal
          shipment={shipment}
          onClose={() => setShowModal(false)}
          onSubmit={async (offer) => {
            try {
              const numeric = Number(offer.offerPrice || offer.price || 0);
              await submitOffer(shipment.id, numeric);
            } catch (err) {
              // silent fallback if profile gating redirects elsewhere
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ShipmentDetail;
