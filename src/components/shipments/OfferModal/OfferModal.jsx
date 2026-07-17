import styles from "./OfferModal.module.css";
import { useAuth } from "../../../state/auth/useAuth";
import { useShipment } from "../../../state/shipments/useShipment";
import { useState } from "react";
import { Link } from "react-router-dom";
import { hasSubmittedOffer } from "../../../utils/shipmentStorage";
import { useProfile } from "../../../state/profile/useProfile";

const OfferModal = ({ shipment, onClose, onSubmit }) => {
  const { profile } = useProfile();
  const auth = useAuth();
  const { state } = useShipment();
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const carrierName =
    profile?.companyName || profile?.company || profile?.name || "Carrier";
  const carrierId = String(profile?.carrierId || profile?.id || "anonymous");

  // Check if current carrier already submitted an offer for this shipment
  const existingOffer = (state.offers || []).find(
    (o) =>
      String(o.shipmentId) === String(shipment.id) &&
      String(o.carrierId) === carrierId,
  );
  // Also consult persisted submissions so the disabled state survives reloads
  const persisted = hasSubmittedOffer(String(shipment.id), carrierId);
  const isOfferSubmitted = !!existingOffer || !!persisted;

  const submit = async () => {
    if (!price || isSubmitting) return;
    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) return;

    setIsSubmitting(true);
    try {
      if (typeof onSubmit === "function") {
        await onSubmit({ price: numericPrice });
      }
      setShowSuccess(true);
      setTimeout(() => {
        onClose && onClose();
      }, 1000);
    } catch (error) {
      setIsSubmitting(false);
      setShowSuccess(false);
    }
  };

  if (!shipment) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {showSuccess && (
          <div className={styles.successMessage}>
            ✓ Offer submitted successfully!
          </div>
        )}
        <div className={styles.row}>
          <div className={styles.label}>Carrier</div>
          <div>{carrierName}</div>
        </div>
        {/* <div className={styles.row}>
          <div className={styles.label}>Shipment ID</div>
          <div>{shipment.id}</div>
        </div> */}
        <div className={styles.row}>
          <div className={styles.label}>Summary</div>
          <div>
            {shipment.shipmentType} — {shipment.pickupPoint} →{" "}
            {shipment.destination}
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>Shipper</div>
          <div>
            {shipment.shipperId ? (
              <Link
                className={styles.link}
                to={`/shippers/${shipment.shipperId}`}
                onClick={(e) => e.stopPropagation()}
              >
                Know about Shipper
              </Link>
            ) : (
              <span>No shipper information available</span>
            )}
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <div className={styles.label}>Offer price</div>
          <input
            className={styles.input}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Enter offer price"
            type="number"
            min="0"
            disabled={isOfferSubmitted || isSubmitting}
          />
          {isOfferSubmitted && (
            <div className={styles.submitMessage}>
              Offer already submitted for this shipment
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.secondary}`}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className={`${styles.btn} ${styles.primary}`}
            onClick={submit}
            disabled={isOfferSubmitted || isSubmitting}
          >
            {isSubmitting
              ? "Submitting..."
              : isOfferSubmitted
                ? "Offer Submitted"
                : "Submit Offer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferModal;
