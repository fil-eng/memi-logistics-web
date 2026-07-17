import { Link, useLocation } from "react-router-dom";
import { useShipment } from "../../../state/shipments/useShipment";
import {
  formatTime12Hour,
  formatDate,
  formatLocalDateTime,
} from "../../../utils/time";
import { sortByLatestDateDesc } from "../../../utils/sortUtils";
import { useEffect, useState } from "react";
import { fetchShipperShipments } from "../../../services/shipment.service";
import PaymentModal from "../../../components/shipments/PaymentModal/PaymentModal";
import styles from "./MyShipmentsPage.module.css";

const MyShipmentsPage = () => {
  const { state, initiatePayment } = useShipment();
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!error && !paymentMessage) return;
    const timer = window.setTimeout(() => {
      setError("");
      setPaymentMessage("");
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [error, paymentMessage]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setPaymentMessage(location.state.successMessage);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    const loadMyShipments = async () => {
      setIsLoading(true);
      setError("");
      try {
        const fetchedShipments = await fetchShipperShipments({
          page,
          size,
        });
        // Sort so latest appears first
        const sorted = sortByLatestDateDesc(fetchedShipments || []);
        setShipments(sorted);
      } catch (err) {
        setError(err?.message || "Failed to load shipments");
        setShipments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMyShipments();
    const handler = () => {
      loadMyShipments();
    };
    window.addEventListener("shipperShipmentsUpdated", handler);
    return () => window.removeEventListener("shipperShipmentsUpdated", handler);
  }, [page, size]);

  const handlePaymentClick = (shipment) => {
    setSelectedShipment(shipment);
    setPaymentMessage("");
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (payload) => {
    setIsPaymentSubmitting(true);
    setPaymentMessage("");
    try {
      await initiatePayment(selectedShipment.id, payload);
      const fetchedShipments = await fetchShipperShipments({
        page,
        size,
      });
      const sorted = sortByLatestDateDesc(fetchedShipments || []);
      setShipments(sorted);
      setPaymentMessage(
        `Payment initiated for shipment ${selectedShipment.id}. Awaiting carrier confirmation.`,
      );
    } catch (err) {
      console.error("Payment failed:", err);
      throw err;
    } finally {
      setIsPaymentSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          {/* <p className={styles.badge}>My shipments</p> */}
          {/* <h1>My Shipments</h1> */}
          <p className={styles.subtitle}>
            All your shipment requests are shown here.
          </p>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
      {paymentMessage && <div className={styles.success}>{paymentMessage}</div>}
      {isLoading && <div className={styles.loading}>Loading shipments…</div>}

      {!isLoading && shipments.length === 0 ? (
        <div className={styles.empty}>
          No shipments yet. Create a shipment to get started.
        </div>
      ) : (
        !isLoading && (
          <div className={styles.list}>
            {shipments
              .filter((shipment) => shipment.status !== "COMPLETED")
              .map((shipment) => {
                // console.log(shipment);
                return (
                  <article key={shipment.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.internal_div}>
                        <span>Type : </span>
                        <p>{shipment.shipmentType}</p>
                      </div>
                      <span className={styles.status}>{shipment.status}</span>
                    </div>
                    {/* <div className={styles.internal_div}>
                <span>shipper Name :</span>
                <p className={styles.cardTitle}>{shipment.shipperName}</p>
              </div> */}

                    <div className={styles.row}>
                      <div>
                        <span>Amount : </span>
                        <p>
                          {shipment.amount} {shipment.unit}
                        </p>
                      </div>
                      <div>
                        <span>Safe :</span>
                        <strong>
                          {shipment.fragile ? "fragile" : "Non Fragile"}
                        </strong>
                      </div>
                    </div>
                    <div className={styles.row}>
                      <div>
                        <span>Pickup : </span>
                        <p>{shipment.pickupPoint}</p>
                      </div>
                      <div>
                        <span>Destination : </span>
                        <p>{shipment.destination}</p>
                      </div>
                    </div>
                    <div className={styles.rowFooter}>
                      <span>Created :</span>
                      <p>{formatLocalDateTime(shipment.createdAt)}</p>
                    </div>

                    <div className={styles.actionButtons}>
                      <Link
                        className={styles.reviewButton}
                        to={`/shipper/review-shipment?id=${shipment.id}`}
                      >
                        See offers
                      </Link>
                      {shipment.status === "DELIVERED" && (
                        <button
                          className={styles.paymentButton}
                          onClick={() => handlePaymentClick(shipment)}
                          disabled={
                            isPaymentSubmitting &&
                            selectedShipment?.id === shipment.id
                          }
                        >
                          {isPaymentSubmitting &&
                          selectedShipment?.id === shipment.id
                            ? "Initiating..."
                            : "Initiate Payment"}
                        </button>
                      )}
                    </div>
                    {shipment.status === "PAYMENT_PENDING" && (
                      <div className={styles.infoMessage}>
                        Payment initiated. Awaiting carrier confirmation.
                      </div>
                    )}
                  </article>
                );
              })}
          </div>
        )
      )}

      {showPaymentModal && (
        <PaymentModal
          shipment={selectedShipment}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedShipment(null);
          }}
          onSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  );
};

export default MyShipmentsPage;
