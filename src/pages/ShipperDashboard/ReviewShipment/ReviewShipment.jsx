import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useShipment } from "../../../state/shipments/useShipment";
import { sortByLatestDateDesc } from "../../../utils/sortUtils";
import { fetchShipmentOffers } from "../../../services/shipment.service";
import { getPublicCarrierProfile } from "../../../services/profile.service";
import styles from "./ReviewShipment.module.css";

const ReviewShipment = () => {
  const {
    state,
    loadShipmentById,
    assignCarrierByCarrierId,
    updateOfferStatus,
  } = useShipment();
  const loc = useLocation();
  const nav = useNavigate();
  const params = new URLSearchParams(loc.search);
  const idParam = params.get("id");
  const shipmentId = idParam ? Number(idParam) : null;
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!error) return;
    const timer = window.setTimeout(() => setError(""), 10000);
    return () => window.clearTimeout(timer);
  }, [error]);

  if (!idParam || Number.isNaN(shipmentId)) {
    return <div style={{ padding: 12 }}>Select a shipment to review.</div>;
  }

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        await loadShipmentById(shipmentId);
        const fetchedOffers = await fetchShipmentOffers(shipmentId);
        // Resolve carrier company names for each offer using carrierCompanyId
        const offersWithCarrier = await Promise.all(
          (fetchedOffers || []).map(async (o) => {
            const carrierRef =
              o.carrierCompanyId || o.carrierId || o.carrier_id || null;
            let companyName =
              o.carrierName || o.carrier_name || o.carrierCompanyName || null;
            if (carrierRef) {
              try {
                const profile = await getPublicCarrierProfile(carrierRef);
                if (profile && profile.companyName)
                  companyName = profile.companyName;
              } catch (e) {
                // ignore profile load errors and fall back to existing name
              }
            }
            return {
              ...o,
              carrierId: carrierRef,
              carrierCompanyName:
                companyName || `Carrier (${carrierRef || "?"})`,
            };
          }),
        );

        setOffers(sortByLatestDateDesc(offersWithCarrier || []));
      } catch (err) {
        setError(err?.message || "Failed to load offers");
      } finally {
        setIsLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipmentId]);

  const shipment = (state.shipments || []).find(
    (s) => s.id === shipmentId || String(s.id) === idParam,
  );

  const accept = async (offer) => {
    const alreadyAccepted = offers.some((o) => o.offerStatus === "ACCEPTED");
    if (alreadyAccepted) return;

    try {
      await assignCarrierByCarrierId(shipmentId, offer.carrierId);
      // optimistically mark accepted locally so UI updates immediately
      setOffers((prev) =>
        prev.map((p) =>
          p.id === offer.id ? { ...p, offerStatus: "ACCEPTED" } : p,
        ),
      );
      nav("/shipper/active-shipments", {
        state: {
          successMessage:
            "you successfully assigned. Returning to active shipments.",
        },
      });
    } catch (err) {
      setError(
        "Unable to assign the selected carrier. Please try again later.",
      );
    }
  };

  const reject = (offer) => {
    // optimistically disable this offer locally
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offer.id ? { ...o, offerStatus: "REJECTED" } : o,
      ),
    );
    updateOfferStatus(offer.id, "REJECTED");
  };

  return (
    <div className={styles.page}>
      <h2>Review offers for shipment</h2>
      {/* <div>
        <strong>
          {shipment ? shipment.shipmentType : `Shipment #${shipmentId}`}
        </strong>
        <div>
          {shipment
            ? `${shipment.pickupPoint} → ${shipment.destination}`
            : "Loading shipment details..."}
        </div>
        {shipment && (
          <div>
            Shipment Status: <strong>{shipment.status}</strong>
          </div>
        )}
      </div> */}
      {error && <div className={styles.error}>{error}</div>}

      {isLoading && <div className={styles.loading}>Loading offers…</div>}

      {!isLoading && (
        <div className={styles.meta_container}>
          {offers.length === 0 && <div>No offers yet.</div>}
          {offers.map((o) => {
            // console.log(o);
            const isAccepted = o.offerStatus === "ACCEPTED";
            const isBlocked = o.offerStatus === "BLOCKED";
            const alreadyAccepted = offers.some(
              (offer) => offer.offerStatus === "ACCEPTED",
            );
            const disableAccept =
              isAccepted || isBlocked || (alreadyAccepted && !isAccepted);
            const disableReject =
              isBlocked ||
              o.offerStatus === "REJECTED" ||
              o.offerStatus === "CANCELLED";
            return (
              <div
                key={o.id}
                className={
                  styles.offer +
                  (isAccepted ? " " + styles.accepted : "") +
                  (isBlocked ? " " + styles.blocked : "")
                }
              >
                <div className={styles.meta}>
                  <div>
                    <div>
                      <strong>
                        carrier : {o.carrierCompanyName || o.carrierName}
                      </strong>{" "}
                      <div>
                        <Link
                          to={`/carriers/${o.carrierId}`}
                          className={styles.link}
                        >
                          Know about carrier
                        </Link>
                      </div>
                    </div>
                    <div>
                      Price:{" "}
                      <span className={styles.value}>${o.offerPrice}</span>{" "}
                    </div>
                    <div>
                      Status:{" "}
                      <span className={styles.value}>
                        {shipment?.status}
                      </span>{" "}
                    </div>
                    <div>
                      <div>
                        Created:{" "}
                        <span className={styles.value}>
                          {" "}
                          {new Date(o.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.reject}
                      onClick={() => reject(o)}
                      disabled={disableReject}
                    >
                      Reject
                    </button>
                    <button
                      className={styles.accept}
                      onClick={() => accept(o)}
                      disabled={disableAccept}
                    >
                      {isAccepted ? "Accepted" : "Accept"}
                    </button>
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

export default ReviewShipment;
