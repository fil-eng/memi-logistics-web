import { useState, useMemo, useEffect, useRef } from "react";
import { useShipment } from "../../../state/shipments/useShipment";
import ShipmentCard from "../../../components/shipments/ShipmentCard/ShipmentCard";
import OfferModal from "../../../components/shipments/OfferModal/OfferModal";
import CarrierShipmentFilter from "../../../components/shipments/CarrierShipmentFilter/CarrierShipmentFilter";
import EmptyState from "../../../components/shipments/EmptyState/EmptyState";
import { sortByLatestDateDesc } from "../../../utils/sortUtils";
import styles from "./AvailableShipments.module.css";

const AvailableShipments = () => {
  const { state, loadShipments, submitOffer } = useShipment();
  const [selected, setSelected] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const prevSafetyRef = useRef(filters.safety);
  const prevOriginRef = useRef(filters.pickupPoint);
  const prevDestinationRef = useRef(filters.destination);

  useEffect(() => {
    const load = async () => {
      setError("");
      setIsLoading(true);
      try {
        let fragileParam;
        if (filters.safety === "fragile") {
          fragileParam = true;
        }

        await loadShipments({
          page,
          size,
          fragile: fragileParam,
          origin: filters.pickupPoint,
          destination: filters.destination,
        });
      } catch (err) {
        setError(err?.message || "Unable to load shipments.");
      } finally {
        setIsLoading(false);
      }
    };

    const safetyChanged = prevSafetyRef.current !== filters.safety;
    const originChanged = prevOriginRef.current !== filters.pickupPoint;
    const destinationChanged =
      prevDestinationRef.current !== filters.destination;

    if (safetyChanged || originChanged || destinationChanged) {
      prevSafetyRef.current = filters.safety;
      prevOriginRef.current = filters.pickupPoint;
      prevDestinationRef.current = filters.destination;
      if (page !== 0) {
        setPage(0);
        return;
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, filters.safety, filters.pickupPoint, filters.destination]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  const filtered = useMemo(() => {
    let list = sortByLatestDateDesc(
      (state.shipments || []).filter((s) => s.status === "PENDING"),
    );
    // console.log(list)
    return list;
  }, [state.shipments]);

  const onOffer = (shipment) => {
    setSelected(shipment);
  };

  return (
    <div className={styles.board}>
      <h1 className="pageTitle">Available Shipments</h1>
      <CarrierShipmentFilter
        filters={filters}
        onChange={setFilters}
        currentPage={page}
        pageSize={size}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setSize(newSize);
          setPage(0);
        }}
        loading={isLoading}
        disableNext={(state.shipments || []).length < size}
      />
      {error && <div className={styles.error}>{error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}
      {isLoading && <div className={styles.loading}>Loading shipments…</div>}

      <div className={styles.grid}>
        {filtered.length === 0 && !isLoading && (
          <EmptyState
            title="No available shipments"
            description="Try adjusting your filters"
          />
        )}

        {filtered.map((s) => (
          <div key={s.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <ShipmentCard shipment={s} onOffer={onOffer} />
              </div>
              {/* <div style={{ flex: "0 0 auto" }}>
                <ShipmentStatusBadge status={s.status} />
              </div> */}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <OfferModal
          shipment={selected}
          onClose={() => setSelected(null)}
          onSubmit={async (offer) => {
            try {
              const numeric = Number(offer.offerPrice || offer.price || 0);
              await submitOffer(selected.id, numeric);
              setSuccessMessage(
                "✓ Offer submitted successfully! Check your offers in Assigned Offers if shipper accepted you offer.",
              );
            } catch (err) {
              setError(err.message || "Please complete your profile first.");
            }
            setSelected(null);
          }}
        />
      )}
    </div>
  );
};

export default AvailableShipments;
