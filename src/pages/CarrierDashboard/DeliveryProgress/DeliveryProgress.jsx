import styles from "./DeliveryProgress.module.css";
import { useShipment } from "../../../state/shipments/useShipment";
import { sortByLatestDateDesc } from "../../../utils/sortUtils";
import { useAuth } from "../../../state/auth/useAuth";
import { useProfile } from "../../../state/profile/useProfile";
import {
  fetchCarrierAssignedShipments,
  fetchShipmentDetails,
} from "../../../services/shipment.service";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const statusOrder = [
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED_AT_DESTINATION",
  "DELIVERED",
  "PAYMENT_PENDING",
];

const nextStatus = {
  ASSIGNED: "PICKED_UP",
  PICKED_UP: "IN_TRANSIT",
  IN_TRANSIT: "ARRIVED_AT_DESTINATION",
  ARRIVED_AT_DESTINATION: "DELIVERED",
};

const DeliveryProgress = () => {
  const { state, updateShipmentStatus, confirmPayment } = useShipment();
  const auth = useAuth();
  const { profile } = useProfile();
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [assignedShipments, setAssignedShipments] = useState([]);
  const [isLoadingAssigned, setIsLoadingAssigned] = useState(true);

  const location = useLocation();

  useEffect(() => {
    // If navigation carried an info message (e.g. after marking Delivered),
    // display it and clear it along with other transient messages.
    if (location?.state?.infoMessage) {
      setInfoMessage(location.state.infoMessage);
    }
  }, [location]);

  useEffect(() => {
    if (!paymentError && !paymentSuccess && !infoMessage) return;
    const timer = window.setTimeout(() => {
      setPaymentError("");
      setPaymentSuccess("");
      setInfoMessage("");
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [paymentError, paymentSuccess, infoMessage]);

  const carrierId = String(
    profile?.carrierId ||
      profile?.id ||
      auth.user?.id ||
      auth.user?.carrierId ||
      "",
  );

  const myAssigned = sortByLatestDateDesc(
    assignedShipments.filter((s) => s.status !== "COMPLETED"),
  );

  const loadAssignedShipments = async () => {
    setIsLoadingAssigned(true);
    setPaymentError("");
    try {
      if (!carrierId) {
        setAssignedShipments([]);
        return;
      }
      const shipments = await fetchCarrierAssignedShipments(carrierId);
      const results = await Promise.allSettled(
        shipments.map((shipment) => fetchShipmentDetails(shipment.id)),
      );
      const updatedShipments = results.map((result, idx) => {
        if (result.status === "fulfilled" && result.value?.id) {
          return result.value;
        }
        return shipments[idx];
      });
      setAssignedShipments(updatedShipments);
    } catch (error) {
      setPaymentError(error?.message || "Failed to load active deliveries");
      setAssignedShipments([]);
    } finally {
      setIsLoadingAssigned(false);
    }
  };

  useEffect(() => {
    loadAssignedShipments();
    const handler = () => loadAssignedShipments();
    window.addEventListener("carrierOffersUpdated", handler);
    return () => window.removeEventListener("carrierOffersUpdated", handler);
  }, [carrierId]);

  const advance = async (shipment) => {
    const next = nextStatus[shipment.status];
    if (!next) return;
    try {
      const updatedShipment = await updateShipmentStatus(shipment.id, next);
      setAssignedShipments((prev) =>
        prev.map((item) =>
          item.id === updatedShipment.id ? updatedShipment : item,
        ),
      );
    } catch (error) {
      setPaymentError(error?.message || "Failed to update shipment status");
    }
  };

  const handleConfirmPayment = async (shipment) => {
    setIsConfirmingPayment(shipment.id);
    setPaymentError("");
    setPaymentSuccess("");
    try {
      await confirmPayment(shipment.id);
      setPaymentSuccess(
        `Payment confirmed for shipment ${shipment.id}. It will now move to completed jobs.`,
      );
    } catch (error) {
      setPaymentError(error?.message || "Failed to confirm payment");
    } finally {
      setIsConfirmingPayment(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        {/* <p className={styles.badge}>Delivery Progress</p> */}
        {/* <h1>Active delivery timeline</h1> */}
        <p className={styles.subtitle}>
          Update each shipment step-by-step in the valid status order.
        </p>
      </div>

      {paymentError && <div className={styles.error}>{paymentError}</div>}
      {paymentSuccess && <div className={styles.success}>{paymentSuccess}</div>}
      {infoMessage && <div className={styles.success}>{infoMessage}</div>}

      {myAssigned.length === 0 ? (
        <div className={styles.empty}>No active deliveries</div>
      ) : (
        <div className={styles.grid}>
          {myAssigned.map((shipment) => (
            <article key={shipment.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div>
                  <strong>{shipment.shipmentType}</strong>
                  <div className={styles.route}>
                    {shipment.pickupPoint} → {shipment.destination}
                  </div>
                </div>
                <span className={styles.statusBadge}>{shipment.status}</span>
              </div>

              <div className={styles.timeline}>
                {statusOrder.map((status) => {
                  const completedIndex = statusOrder.indexOf(shipment.status);
                  const currentIndex = statusOrder.indexOf(status);
                  const stateLabel =
                    currentIndex <= completedIndex ? "completed" : "pending";
                  // console.log(stateLabel);
                  return (
                    <div key={status} className={styles.step}>
                      <span
                        className={`${styles.stepDot} ${stateLabel === "pending" ? styles.stepDotPending : " "} `}
                      />
                      <div>
                        <div className={styles.stepLabel}>{status}</div>
                        <div
                          className={`${styles.stepState} ${stateLabel === "pending" ? styles.stepStatePending : " "} `}
                        >
                          {stateLabel}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={styles.actions}>
                {shipment.status === "PAYMENT_PENDING" ? (
                  <button
                    className={styles.confirmPaymentButton}
                    onClick={() => handleConfirmPayment(shipment)}
                    disabled={isConfirmingPayment === shipment.id}
                  >
                    {isConfirmingPayment === shipment.id
                      ? "Confirming..."
                      : "Confirm Payment"}
                  </button>
                ) : nextStatus[shipment.status] ? (
                  <button
                    className={styles.advanceButton}
                    onClick={() => advance(shipment)}
                  >
                    Mark as {nextStatus[shipment.status]}
                  </button>
                ) : shipment.status === "DELIVERED" ? (
                  <div className={styles.completedNote}>
                    Delivered. Please wait for shipper delivery confirmation and
                    payment initiation.
                  </div>
                ) : (
                  <div className={styles.completedNote}>
                    This shipment is ready for final verification or completed.
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliveryProgress;
