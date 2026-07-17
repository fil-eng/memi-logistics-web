import styles from "./MyOffers.module.css";
import { useShipment } from "../../../state/shipments/useShipment";
import { sortByLatestDateDesc } from "../../../utils/sortUtils";
import { useAuth } from "../../../state/auth/useAuth";
import { useProfile } from "../../../state/profile/useProfile";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchCarrierAssignedShipments,
  fetchShipmentDetails,
  updateShipmentStatus,
} from "../../../services/shipment.service";

const statusProgression = {
  ASSIGNED: {
    nextStatus: "PICKED_UP",
    label: "Mark as Picked Up",
  },
  PICKED_UP: {
    nextStatus: "IN_TRANSIT",
    label: "Mark as In Transit",
  },
  IN_TRANSIT: {
    nextStatus: "ARRIVED_AT_DESTINATION",
    label: "Mark as Arrived",
  },
  ARRIVED_AT_DESTINATION: {
    nextStatus: "DELIVERED",
    label: "Mark as Delivered",
  },
};

const MyOffers = () => {
  const { state, cancelOffer } = useShipment();
  const auth = useAuth();
  const { profile } = useProfile();
  const [assignedShipments, setAssignedShipments] = useState([]);
  const [shipmentDetails, setShipmentDetails] = useState({});
  const [updatingShipmentIds, setUpdatingShipmentIds] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const carrierId = String(
    profile?.carrierId || profile?.id || auth.user?.id || "",
  );
  useEffect(() => {
    const loadShipmentStatuses = async (shipments) => {
      const results = await Promise.allSettled(
        shipments.map((shipment) => fetchShipmentDetails(shipment.id)),
      );
      const details = {};
      results.forEach((result, index) => {
        const shipmentId = String(shipments[index]?.id);
        if (!shipmentId) return;
        details[shipmentId] =
          result.status === "fulfilled" && result.value?.id
            ? result.value
            : null;
      });
      setShipmentDetails(details);
    };

    const loadAssignedShipments = async () => {
      setIsLoading(true);
      setError("");
      setShipmentDetails({});
      try {
        if (!carrierId) {
          setError("Carrier ID not found");
          setIsLoading(false);
          return;
        }
        const shipments = await fetchCarrierAssignedShipments(carrierId);
        setAssignedShipments(shipments || []);
        if (Array.isArray(shipments) && shipments.length > 0) {
          await loadShipmentStatuses(shipments);
        }
      } catch (err) {
        setError(err?.message || "Failed to load assigned shipments");
        setAssignedShipments([]);
        setShipmentDetails({});
      } finally {
        setIsLoading(false);
      }
    };

    if (carrierId) {
      loadAssignedShipments();
    }
    const handler = () => {
      if (carrierId) loadAssignedShipments();
    };
    window.addEventListener("carrierOffersUpdated", handler);
    return () => window.removeEventListener("carrierOffersUpdated", handler);
  }, [carrierId]);

  // Get offers from state for the displayed shipments
  const visibleShipments = sortByLatestDateDesc(assignedShipments).filter(
    (shipment) => {
      const detail = shipmentDetails[String(shipment.id)];
      const shipmentStatus = detail?.status || shipment.status;
      return Boolean(statusProgression[shipmentStatus]);
    },
  );

  const displayList = visibleShipments.map((shipment) => {
    const relatedOffers = (state.offers || []).filter(
      (o) =>
        String(o.shipmentId) === String(shipment.id) &&
        String(o.carrierId) === carrierId,
    );
    // Return shipment with offer data attached if available
    return {
      ...shipment,
      offers: relatedOffers,
      // Use the first offer's data for backward compatibility with display
      offerPrice: relatedOffers[0]?.offerPrice || shipment.offerPrice,
      offerStatus: relatedOffers[0]?.offerStatus || shipment.status,
      offerId: relatedOffers[0]?.id,
    };
  });

  const handleCancelOffer = async (offerId) => {
    if (offerId) {
      await cancelOffer(offerId);
      // Refresh the list after cancellation
      try {
        if (carrierId) {
          const shipments = await fetchCarrierAssignedShipments(carrierId);
          setAssignedShipments(shipments || []);
        }
      } catch (err) {
        // Silently fail on refresh
      }
    }
  };

  const handleAdvanceShipment = async (shipment) => {
    const currentDetails = shipmentDetails[String(shipment.id)] ?? shipment;
    const currentStatus = currentDetails.status;
    const action = statusProgression[currentStatus];
    if (!action) return;

    setUpdatingShipmentIds((prev) => ({ ...prev, [shipment.id]: true }));
    try {
      const location =
        currentDetails.pickupPoint ||
        currentDetails.origin ||
        currentDetails.destination ||
        currentDetails.reference ||
        currentDetails.trackingNumber ||
        `Shipment ${shipment.id}`;

      // First perform the PATCH to update status
      await updateShipmentStatus(shipment.id, action.nextStatus, location);

      // Then fetch the authoritative shipment from the backend
      const refreshed = await fetchShipmentDetails(shipment.id);

      setAssignedShipments((prev) =>
        prev.map((item) => (item.id === refreshed.id ? refreshed : item)),
      );
      setShipmentDetails((prev) => ({
        ...prev,
        [String(refreshed.id)]: refreshed,
      }));

      // If the transition was to DELIVERED, navigate to Delivery Progress
      // and carry a short user-facing info message that remains visible
      // after navigation.
      if (action.nextStatus === "DELIVERED") {
        navigate("/carrier/delivery-progress", {
          state: {
            infoMessage:
              "Delivered. Please wait for shipper delivery confirmation and payment initiation.",
          },
        });
      }
    } catch (err) {
      setError(err?.message || "Failed to update shipment status");
    } finally {
      setUpdatingShipmentIds((prev) => ({ ...prev, [shipment.id]: false }));
    }
  };

  return (
    <div>
      {/* <h1 className="pageTitle">My Offers</h1> */}

      {error && <div className={styles.error}>{error}</div>}

      {isLoading && (
        <div className={styles.loading}>Loading assigned shipments…</div>
      )}

      {!isLoading && (
        <div className={styles.list}>
          {displayList.length === 0 && (
            <div className={styles.empty}>No offers yet</div>
          )}
          {displayList.map((shipment) => {
            const detail = shipmentDetails[String(shipment.id)];
            const statusLoaded = String(shipment.id) in shipmentDetails;
            const shipmentStatus =
              detail?.status ?? (statusLoaded ? shipment.status : "Loading...");
            const nextAction = statusProgression[shipmentStatus];

            return (
              <div key={shipment.id} className={styles.offerCard}>
                <div className={styles.meta}>
                  <div>
                    <div>
                      <strong>Shipment {shipment.id}</strong>
                    </div>
                    <div>
                      {shipment.shipmentType} — {shipment.pickupPoint} →{" "}
                      {shipment.destination}
                    </div>
                    {shipment.offers && shipment.offers.length > 0 && (
                      <>
                        <div>Offers: {shipment.offers.length}</div>
                        {shipment.offers.map((offer) => (
                          <div key={offer.id}>
                            <div>Price: ${offer.offerPrice}</div>
                            <div>Status: {offer.offerStatus}</div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  <div>
                    <div>
                      Status:{" "}
                      <span className={styles.Status}>
                        {shipmentStatus}
                      </span>{" "}
                    </div>
                    <div>
                      {new Date(shipment.createdAt).toLocaleString(undefined, {
                        hour: "numeric",
                        minute: "numeric",
                        hour12: true,
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    {nextAction && (
                      <button
                        type="button"
                        className={styles.actionButton}
                        disabled={Boolean(updatingShipmentIds[shipment.id])}
                        onClick={() => handleAdvanceShipment(shipment)}
                      >
                        {updatingShipmentIds[shipment.id]
                          ? "Updating..."
                          : nextAction.label}
                      </button>
                    )}
                    {shipment.offers &&
                      shipment.offers.some(
                        (o) => o.offerStatus === "PENDING",
                      ) && (
                        <button
                          type="button"
                          className={styles.cancelButton}
                          onClick={() => {
                            const pendingOffer = shipment.offers.find(
                              (o) => o.offerStatus === "PENDING",
                            );
                            if (pendingOffer) {
                              handleCancelOffer(pendingOffer.id);
                            }
                          }}
                        >
                          Cancel Offer
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOffers;
