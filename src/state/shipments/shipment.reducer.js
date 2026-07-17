import * as types from "./shipment.types";

const validStatusOrder = [
  "PENDING",
  "ACCEPTED",
  "ASSIGNED",
  "PICKED_UP",
  "IN_TRANSIT",
  "ARRIVED_AT_DESTINATION",
  "DELIVERED",
  "PAYMENT_PENDING",
  "COMPLETED",
];

const canTransition = (from, to) => {
  const currentIndex = validStatusOrder.indexOf(from);
  const desiredIndex = validStatusOrder.indexOf(to);
  return desiredIndex === currentIndex || desiredIndex === currentIndex + 1;
};

const normalizeOffer = (offer) => ({
  ...offer,
  offerStatus: (offer.offerStatus || offer.status || "PENDING")
    .toString()
    .toUpperCase(),
  createdAt: offer.createdAt || new Date().toISOString(),
});

const normalizeNotification = (note) => ({
  ...note,
  id: note.id || `note-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  createdAt: note.createdAt || new Date().toISOString(),
  read: note.read === true,
});

export const shipmentReducer = (state, action) => {
  switch (action.type) {
    case types.LOAD_SHIPMENTS:
      return {
        ...state,
        shipments: Array.isArray(action.payload) ? action.payload : [],
      };

    case types.LOAD_OFFERS: {
      const loadedOffers = Array.isArray(action.payload)
        ? action.payload.map(normalizeOffer)
        : [];
      const existingOffers = state.offers || [];
      const mergedOffers = [
        ...existingOffers.filter(
          (offer) => !loadedOffers.some((loaded) => loaded.id === offer.id),
        ),
        ...loadedOffers,
      ];
      return {
        ...state,
        offers: mergedOffers,
      };
    }

    case types.ADD_SHIPMENT: {
      const newShipment = {
        ...action.payload,
        status:
          action.payload?.status != null
            ? action.payload.status.toString().toUpperCase()
            : undefined,
        assignedCarrierId: action.payload?.assignedCarrierId || null,
        assignedCarrierName: action.payload?.assignedCarrierName || null,
        createdAt: action.payload?.createdAt || new Date().toISOString(),
        updatedAt: action.payload?.updatedAt || new Date().toISOString(),
      };
      return {
        ...state,
        shipments: [...state.shipments, newShipment],
        successMessage: "Shipment posted successfully",
        errorMessage: null,
      };
    }

    case types.UPSERT_SHIPMENT: {
      const updatedShipment = {
        ...action.payload,
        status:
          action.payload?.status != null
            ? action.payload.status.toString().toUpperCase()
            : undefined,
        assignedCarrierId: action.payload?.assignedCarrierId || null,
        assignedCarrierName: action.payload?.assignedCarrierName || null,
        createdAt: action.payload?.createdAt || new Date().toISOString(),
        updatedAt: action.payload?.updatedAt || new Date().toISOString(),
      };
      return {
        ...state,
        shipments: state.shipments.some((s) => s.id === updatedShipment.id)
          ? state.shipments.map((shipment) =>
              shipment.id === updatedShipment.id ? updatedShipment : shipment,
            )
          : [...state.shipments, updatedShipment],
      };
    }

    case types.ADD_OFFER: {
      const newOffer = normalizeOffer(action.payload);
      return {
        ...state,
        offers: [...state.offers, newOffer],
        successMessage: "Offer submitted",
        errorMessage: null,
      };
    }

    case types.LOAD_NOTIFICATIONS: {
      const loadedNotifications = Array.isArray(action.payload)
        ? action.payload.map(normalizeNotification)
        : [];
      return {
        ...state,
        notifications: loadedNotifications.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        ),
      };
    }

    case types.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          normalizeNotification(action.payload),
          ...(state.notifications || []),
        ],
      };

    case types.MARK_NOTIFICATION_READ:
      return {
        ...state,
        notifications: (state.notifications || []).map((note) =>
          note.id === action.payload ? { ...note, read: true } : note,
        ),
      };

    case types.MARK_NOTIFICATION_UNREAD:
      return {
        ...state,
        notifications: (state.notifications || []).map((note) =>
          note.id === action.payload ? { ...note, read: false } : note,
        ),
      };

    case types.DELETE_NOTIFICATION:
      return {
        ...state,
        notifications: (state.notifications || []).filter(
          (note) => note.id !== action.payload,
        ),
      };

    case types.CLEAR_NOTIFICATIONS:
      return {
        ...state,
        notifications: [],
      };

    case types.FETCH_SHIPMENTS_START:
      return {
        ...state,
        isLoading: true,
        errorMessage: null,
        successMessage: null,
      };

    case types.FETCH_SHIPMENTS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        shipments: action.payload,
        errorMessage: null,
        successMessage: "Shipments loaded successfully",
      };

    case types.FETCH_SHIPMENTS_FAILURE:
      return {
        ...state,
        isLoading: false,
        errorMessage: action.payload,
        successMessage: null,
      };

    case types.CLEAR_SHIPMENT_MESSAGES:
      return {
        ...state,
        errorMessage: null,
        successMessage: null,
      };

    case types.SELECT_SHIPMENT:
      return {
        ...state,
        selectedShipment: action.payload,
      };

    case types.UPDATE_SHIPMENT_STATUS:
      return {
        ...state,
        shipments: state.shipments.map((shipment) => {
          if (shipment.id !== action.payload.id) return shipment;
          const currentStatus = (shipment.status || "")
            .toString()
            .toUpperCase();
          const desiredStatus = (action.payload.status || "")
            .toString()
            .toUpperCase();
          if (!canTransition(currentStatus, desiredStatus)) {
            return shipment;
          }
          return {
            ...shipment,
            status: desiredStatus,
            updatedAt: new Date().toISOString(),
          };
        }),
        successMessage: "Shipment status updated",
        errorMessage: null,
      };

    case types.UPDATE_OFFER_STATUS: {
      const status = action.payload.status.toString().toUpperCase();
      const updatedOffers = state.offers.map((offer) =>
        offer.id === action.payload.id
          ? { ...offer, offerStatus: status }
          : offer,
      );

      return {
        ...state,
        offers: updatedOffers,
      };
    }

    case types.ACCEPT_OFFER: {
      // Only allow one accepted offer per shipment
      const shipmentId = String(action.payload.shipmentId);
      const carrierId = String(action.payload.carrierId);
      let alreadyAccepted = false;
      state.offers.forEach((o) => {
        if (
          String(o.shipmentId) === shipmentId &&
          o.offerStatus === "ACCEPTED"
        ) {
          alreadyAccepted = true;
        }
      });
      if (alreadyAccepted) {
        // Prevent duplicate acceptance
        return state;
      }
      return {
        ...state,
        shipments: state.shipments.map((s) =>
          String(s.id) === shipmentId
            ? {
                ...s,
                status: "ACCEPTED",
                assignedCarrierId: carrierId,
                assignedCarrierName: action.payload.carrierName,
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
        offers: state.offers.map((o) => {
          if (String(o.shipmentId) !== shipmentId) return o;
          if (String(o.carrierId) === carrierId) {
            return { ...o, offerStatus: "ACCEPTED" };
          }
          // All other offers for this shipment become BLOCKED
          return { ...o, offerStatus: "BLOCKED" };
        }),
      };
    }

    case types.ASSIGN_SHIPMENT:
      return {
        ...state,
        shipments: state.shipments.map((s) =>
          s.id === action.payload.shipmentId
            ? {
                ...s,
                status: "ASSIGNED",
                assignedCarrierId: action.payload.carrierId,
                assignedCarrierName: action.payload.carrierName,
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      };

    case types.VERIFY_DELIVERY:
      return {
        ...state,
        shipments: state.shipments.map((s) => {
          if (s.id !== action.payload.shipmentId) return s;
          if (s.status !== "DELIVERED") return s;
          return {
            ...s,
            status: "COMPLETED",
            verifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }),
      };

    case types.RECORD_PAYMENT:
      return {
        ...state,
        shipments: state.shipments.map((s) =>
          s.id === action.payload.shipmentId
            ? {
                ...s,
                paymentCompleted: true,
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      };

    case types.RESET_SHIPMENT_STATE:
      return {
        ...state,
        shipments: [],
        offers: [],
        notifications: [],
        selectedShipment: null,
        filters: {
          status: "all",
          search: "",
        },
        isLoading: false,
        errorMessage: null,
        successMessage: null,
      };

    default:
      return state;
  }
};
