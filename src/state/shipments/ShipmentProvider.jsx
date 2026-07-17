import { createContext, useReducer, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { shipmentReducer } from "./shipment.reducer";
import { shipmentInitialState } from "./shipment.initialState";
import * as types from "./shipment.types";
import { useAuth } from "../auth/useAuth";
import { useProfile } from "../profile/useProfile";
import {
  createShipment,
  listShipments,
  fetchShipmentDetails,
  fetchShipmentOffers,
  submitShipmentOffer,
  cancelShipmentOffer,
  assignCarrier as assignCarrierApi,
  assignCarrierByCarrierId as assignCarrierByCarrierIdApi,
  updateShipmentStatus as updateShipmentStatusApi,
  initiatePayment as initiatePaymentApi,
  confirmPayment as confirmPaymentApi,
} from "../../services/shipment.service";
import {
  markOfferAsSubmitted,
  loadStoredNotifications,
  saveStoredNotifications,
} from "../../utils/shipmentStorage";

export const ShipmentContext = createContext();

const initializeState = () => shipmentInitialState;

const createNotification = ({
  userId,
  userRole,
  shipment,
  shipmentId,
  type,
  title,
  message,
  routeTarget,
  counterpartyName,
  companyName,
}) => ({
  id: `note-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
  userId: userId != null ? String(userId) : null,
  userRole: userRole || null,
  shipmentId:
    shipment?.id != null
      ? String(shipment.id)
      : shipmentId != null
        ? String(shipmentId)
        : null,
  trackingNumber:
    shipment?.trackingNumber || shipment?.reference || shipment?.id || "",
  status: shipment?.status || "",
  counterpartyName:
    counterpartyName ||
    shipment?.assignedCarrierName ||
    shipment?.carrierName ||
    shipment?.shipperName ||
    null,
  companyName: companyName || shipment?.companyName || null,
  type: type || "shipment_update",
  title: title || "Shipment update",
  message,
  routeTarget:
    routeTarget ||
    (shipment?.id
      ? `/shipments/${shipment.id}`
      : shipmentId
        ? `/shipments/${shipmentId}`
        : null),
  createdAt: new Date().toISOString(),
  read: false,
});

const makeStatusNotification = (shipment, status) => {
  const normalized = (status || "").toString().toUpperCase();
  const titleMap = {
    ASSIGNED: "Shipment Assigned",
    PICKED_UP: "Shipment Picked Up",
    IN_TRANSIT: "Shipment In Transit",
    ARRIVED_AT_DESTINATION: "Shipment Arrived",
    DELIVERED: "Shipment Delivered",
    COMPLETED: "Shipment Completed",
    PAYMENT_PENDING: "Payment Pending",
    ACCEPTED: "Shipment Accepted",
    PENDING: "Shipment Created",
  };
  const messageMap = {
    ASSIGNED: "Carrier assigned successfully.",
    PICKED_UP: "Shipment picked up.",
    IN_TRANSIT: "Shipment is in transit.",
    ARRIVED_AT_DESTINATION: "Shipment arrived at destination.",
    DELIVERED:
      "Shipment delivered. Please wait for shipper delivery confirmation and payment initiation.",
    COMPLETED: "Shipment completed successfully.",
    PAYMENT_PENDING: "Payment is pending.",
    ACCEPTED: "Shipment offer accepted.",
    PENDING: "Shipment created successfully.",
  };
  return {
    type: "shipment_status",
    title: titleMap[normalized] || "Shipment update",
    message:
      messageMap[normalized] || `Shipment status updated to ${normalized}.`,
  };
};

export const ShipmentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(
    shipmentReducer,
    shipmentInitialState,
    initializeState,
  );

  const auth = useAuth();
  const profile = useProfile();
  const navigate = useNavigate();
  const notificationsLoadedRef = useRef(false);

  const getCurrentUserId = () =>
    auth?.user?.id || auth?.user?.shipperId || auth?.user?.carrierId || null;

  const getCurrentUserRole = () => auth?.role || auth?.user?.role || null;

  useEffect(() => {
    const userId = getCurrentUserId();
    const role = getCurrentUserRole();
    if (!userId) {
      dispatch({ type: types.LOAD_NOTIFICATIONS, payload: [] });
      notificationsLoadedRef.current = true;
      return;
    }

    const storedNotifications = loadStoredNotifications(userId, role);
    dispatch({ type: types.LOAD_NOTIFICATIONS, payload: storedNotifications });
    notificationsLoadedRef.current = true;
  }, [
    auth?.user?.id,
    auth?.user?.shipperId,
    auth?.user?.carrierId,
    auth?.role,
    auth?.user?.role,
  ]);

  useEffect(() => {
    const userId = getCurrentUserId();
    const role = getCurrentUserRole();
    if (!userId || !notificationsLoadedRef.current) return;
    saveStoredNotifications(userId, role, state.notifications || []);
  }, [
    auth?.user?.id,
    auth?.user?.shipperId,
    auth?.user?.carrierId,
    auth?.role,
    auth?.user?.role,
    state.notifications,
  ]);

  const addShipment = (shipment) => {
    dispatch({ type: types.ADD_SHIPMENT, payload: shipment });
    dispatch({
      type: types.ADD_NOTIFICATION,
      payload: createNotification({
        userId: shipment.shipperId,
        shipment,
        type: "shipment_created",
        title: "Shipment Created",
        message: "Shipment created successfully and is pending assignment.",
      }),
    });
  };

  const loadShipments = async (filters = {}) => {
    dispatch({ type: types.FETCH_SHIPMENTS_START });
    try {
      const shipments = await listShipments(filters);
      dispatch({ type: types.FETCH_SHIPMENTS_SUCCESS, payload: shipments });
      return shipments;
    } catch (error) {
      dispatch({
        type: types.FETCH_SHIPMENTS_FAILURE,
        payload:
          error.response?.data?.message ||
          error.message ||
          "Failed to load shipments",
      });
      return [];
    }
  };

  const loadShipmentById = async (shipmentId) => {
    try {
      const shipment = await fetchShipmentDetails(shipmentId);
      dispatch({ type: types.UPSERT_SHIPMENT, payload: shipment });
      return shipment;
    } catch (error) {
      return null;
    }
  };

  const loadOffers = async (shipmentId) => {
    try {
      const offers = await fetchShipmentOffers(shipmentId);
      dispatch({ type: types.LOAD_OFFERS, payload: offers });
      return offers;
    } catch (error) {
      return [];
    }
  };

  const ensureProfileCompleteForAction = async (roleName) => {
    try {
      await profile.ensureProfileComplete(roleName);
    } catch (error) {
      throw new Error(error?.message || "Please complete your profile first.");
    }
  };

  const createShipmentRequest = async (payload) => {
    await ensureProfileCompleteForAction("SHIPPER");
    const shipment = await createShipment(payload);
    addShipment(shipment);
    return shipment;
  };

  const submitOffer = async (shipmentId, payload) => {
    await ensureProfileCompleteForAction("CARRIER");

    const price = Number(payload?.price ?? payload?.offerPrice ?? payload ?? 0);
    if (!price || Number.isNaN(price)) {
      throw new Error("Offer price is required.");
    }

    const offer = await submitShipmentOffer(shipmentId, price);
    dispatch({ type: types.ADD_OFFER, payload: offer });

    try {
      const shipment = (state.shipments || []).find((s) => s.id === shipmentId);
      const location =
        shipment?.pickupPoint ||
        shipment?.origin ||
        shipment?.destination ||
        shipment?.reference ||
        shipment?.trackingNumber ||
        `Shipment ${shipmentId}`;
      const updatedShipment = await updateShipmentStatusApi(
        shipmentId,
        "ACCEPTED",
        location,
      );
      dispatch({ type: types.UPSERT_SHIPMENT, payload: updatedShipment });
    } catch (statusError) {
      console.error(
        "Failed to update shipment status after offer:",
        statusError,
      );
      // Continue even if status update fails - the offer was submitted successfully
    }

    const currentCarrierId = auth.user?.carrierId || auth.user?.id || null;
    const shipment = (state.shipments || []).find((s) => s.id === shipmentId);
    dispatch({
      type: types.ADD_NOTIFICATION,
      payload: createNotification({
        userId: offer?.shipperId || shipment?.shipperId || null,
        shipment: shipment,
        type: "offer_submitted",
        title: "New Offer Received",
        message: `New offer submitted by ${offer.carrierName} for shipment ${shipmentId}.`,
        counterpartyName: offer.carrierName,
      }),
    });
    if (currentCarrierId) {
      dispatch({
        type: types.ADD_NOTIFICATION,
        payload: createNotification({
          userId: currentCarrierId,
          shipment: shipment,
          type: "offer_submitted",
          title: "Offer Submitted",
          message: `Offer submitted successfully for shipment ${shipmentId}.`,
          counterpartyName: offer.carrierName,
        }),
      });
    }
    // Persist that this carrier submitted an offer for this shipment so the
    // modal submit button remains disabled on later visits / reloads.
    try {
      const carrierId = auth.user?.carrierId || auth.user?.id || null;
      if (carrierId) markOfferAsSubmitted(shipmentId, carrierId);
    } catch (e) {
      // ignore storage errors
    }
    // Notify other UI parts (e.g. My Offers) to refresh from server
    try {
      window.dispatchEvent(new Event("carrierOffersUpdated"));
    } catch (e) {
      // ignore non-browser environments
    }
    return offer;
  };

  const cancelOffer = async (offerId) => {
    const offer = await cancelShipmentOffer(offerId);
    dispatch({
      type: types.UPDATE_OFFER_STATUS,
      payload: { id: offerId, status: "CANCELLED" },
    });
    return offer;
  };

  const updateOfferStatus = async (offerId, status) => {
    dispatch({
      type: types.UPDATE_OFFER_STATUS,
      payload: { id: offerId, status },
    });
    return { id: offerId, status };
  };

  const assignCarrier = async (shipmentId, offerId) => {
    const assignedShipment = await assignCarrierApi(shipmentId, {
      shipmentOfferId: offerId,
      offerId,
    });

    let finalShipment = assignedShipment;
    if (assignedShipment.status !== "ASSIGNED") {
      try {
        const updateLocation =
          assignedShipment.pickupPoint ||
          assignedShipment.origin ||
          assignedShipment.destination ||
          assignedShipment.reference ||
          assignedShipment.trackingNumber ||
          `Shipment ${shipmentId}`;
        finalShipment = await updateShipmentStatusApi(
          shipmentId,
          "ASSIGNED",
          updateLocation,
        );
      } catch (statusError) {
        console.error(
          "Failed to update shipment status to ASSIGNED:",
          statusError,
        );
        // Use assignedShipment as fallback
      }
    }

    dispatch({ type: types.UPSERT_SHIPMENT, payload: finalShipment });
    await loadOffers(shipmentId);

    if (finalShipment.assignedCarrierId) {
      dispatch({
        type: types.ADD_NOTIFICATION,
        payload: createNotification({
          userId: finalShipment.assignedCarrierId,
          shipment: finalShipment,
          type: "shipment_assigned",
          title: "Shipment Assigned",
          message: `Your offer for shipment ${shipmentId} has been accepted and assigned.`,
        }),
      });
    }

    if (finalShipment.shipperId) {
      dispatch({
        type: types.ADD_NOTIFICATION,
        payload: createNotification({
          userId: finalShipment.shipperId,
          shipment: finalShipment,
          type: "shipment_assigned",
          title: "Carrier Assigned",
          message: `Carrier assigned successfully for shipment ${shipmentId}.`,
        }),
      });
    }

    // Notify both carriers and shippers to refresh their lists
    try {
      window.dispatchEvent(new Event("carrierOffersUpdated"));
      window.dispatchEvent(new Event("shipperShipmentsUpdated"));
    } catch (e) {
      // ignore
    }

    return finalShipment;
  };

  const assignCarrierByCarrierId = async (shipmentId, carrierId) => {
    const assignedShipment = await assignCarrierByCarrierIdApi(
      shipmentId,
      carrierId,
    );

    let finalShipment = assignedShipment;
    if (assignedShipment.status !== "ASSIGNED") {
      try {
        const updateLocation =
          assignedShipment.pickupPoint ||
          assignedShipment.origin ||
          assignedShipment.destination ||
          assignedShipment.reference ||
          assignedShipment.trackingNumber ||
          `Shipment ${shipmentId}`;
        finalShipment = await updateShipmentStatusApi(
          shipmentId,
          "ASSIGNED",
          updateLocation,
        );
      } catch (statusError) {
        console.error(
          "Failed to update shipment status to ASSIGNED:",
          statusError,
        );
        // Use assignedShipment as fallback - status might already be ASSIGNED on backend
      }
    }

    dispatch({ type: types.UPSERT_SHIPMENT, payload: finalShipment });
    await loadOffers(shipmentId);

    if (finalShipment.assignedCarrierId) {
      dispatch({
        type: types.ADD_NOTIFICATION,
        payload: createNotification({
          userId: finalShipment.assignedCarrierId,
          shipment: finalShipment,
          type: "shipment_assigned",
          title: "Shipment Assigned",
          message: `Your offer for shipment ${shipmentId} has been accepted and assigned.`,
        }),
      });
    }

    if (finalShipment.shipperId) {
      dispatch({
        type: types.ADD_NOTIFICATION,
        payload: createNotification({
          userId: finalShipment.shipperId,
          shipment: finalShipment,
          type: "shipment_assigned",
          title: "Carrier Assigned",
          message: `Carrier assigned successfully for shipment ${shipmentId}.`,
        }),
      });
    }

    // Notify both carriers and shippers to refresh their lists
    try {
      window.dispatchEvent(new Event("carrierOffersUpdated"));
      window.dispatchEvent(new Event("shipperShipmentsUpdated"));
    } catch (e) {
      // ignore
    }

    return finalShipment;
  };

  const updateShipmentStatus = async (id, status, location = "") => {
    const current = await loadShipmentById(id);
    if (!current) return null;
    const currStatus = (current.status || "").toString().toUpperCase();
    const desired = (status || "").toString().toUpperCase();

    const allowedNext = {
      PENDING: "ACCEPTED",
      ACCEPTED: "ASSIGNED",
      ASSIGNED: "PICKED_UP",
      PICKED_UP: "IN_TRANSIT",
      IN_TRANSIT: "ARRIVED_AT_DESTINATION",
      ARRIVED_AT_DESTINATION: "DELIVERED",
      DELIVERED: "COMPLETED",
    };

    if (currStatus === desired) return current;
    if (allowedNext[currStatus] !== desired) return current;

    if (auth && auth.role === "CARRIER") {
      const carrierId = auth.user?.id || auth.user?.carrierId;
      if (!carrierId || current.assignedCarrierId !== carrierId) return current;
    }

    const updateLocation =
      location ||
      current.pickupPoint ||
      current.origin ||
      current.destination ||
      current.reference ||
      current.trackingNumber ||
      `Shipment ${id}`;

    try {
      const patchedShipment = await updateShipmentStatusApi(
        id,
        desired,
        updateLocation,
      );

      // After PATCH succeeds, fetch the authoritative shipment from the API
      // so the app uses GET /api/shipment/{shipmentId} as the source of truth.
      let finalShipment = patchedShipment;
      try {
        const refreshed = await fetchShipmentDetails(id);
        if (refreshed && refreshed.id) finalShipment = refreshed;
      } catch (fetchErr) {
        // If the follow-up GET fails, fall back to the patched response
        console.error("Failed to refresh shipment after update:", fetchErr);
      }

      dispatch({ type: types.UPSERT_SHIPMENT, payload: finalShipment });
      const statusNote = makeStatusNotification(finalShipment, desired);
      if (finalShipment.shipperId) {
        dispatch({
          type: types.ADD_NOTIFICATION,
          payload: createNotification({
            userId: finalShipment.shipperId,
            shipment: finalShipment,
            type: statusNote.type,
            title: statusNote.title,
            message: statusNote.message,
            counterpartyName: finalShipment.assignedCarrierName || null,
          }),
        });
      }
      if (finalShipment.assignedCarrierId) {
        dispatch({
          type: types.ADD_NOTIFICATION,
          payload: createNotification({
            userId: finalShipment.assignedCarrierId,
            shipment: finalShipment,
            type: statusNote.type,
            title: statusNote.title,
            message: statusNote.message,
            counterpartyName:
              finalShipment.shipperName || finalShipment.companyName || null,
          }),
        });
      }

      try {
        window.dispatchEvent(new Event("carrierOffersUpdated"));
      } catch (e) {
        // ignore non-browser environments
      }

      // If a carrier just marked the shipment as DELIVERED, navigate to the
      // Delivery Progress page and carry a short info message so the user
      // sees clear feedback after the transition.
      try {
        if (auth && auth.role === "CARRIER" && desired === "DELIVERED") {
          navigate("/carrier/delivery-progress", {
            state: {
              infoMessage:
                "Delivered. Please wait for shipper delivery confirmation and payment initiation.",
            },
          });
        }
      } catch (navErr) {
        // navigation failures should not break the status update
        console.error("Failed to navigate after delivering shipment:", navErr);
      }

      return finalShipment;
    } catch (error) {
      console.error("Failed to update shipment status:", error);
      // Return current shipment on error to prevent UI breaking
      return current;
    }
  };

  const initiatePayment = async (shipmentId, payload) => {
    try {
      const updatedShipment = await initiatePaymentApi(shipmentId, payload);
      dispatch({ type: types.UPSERT_SHIPMENT, payload: updatedShipment });
      if (updatedShipment.shipperId) {
        dispatch({
          type: types.ADD_NOTIFICATION,
          payload: createNotification({
            userId: updatedShipment.shipperId,
            shipment: updatedShipment,
            type: "payment_initiated",
            title: "Payment Initiated",
            message: `Payment initiated successfully for shipment ${shipmentId}.`,
            counterpartyName: updatedShipment.assignedCarrierName || null,
          }),
        });
      }
      if (updatedShipment.assignedCarrierId) {
        dispatch({
          type: types.ADD_NOTIFICATION,
          payload: createNotification({
            userId: updatedShipment.assignedCarrierId,
            shipment: updatedShipment,
            type: "payment_initiated",
            title: "Payment Initiated",
            message: `Payment has been initiated for shipment ${shipmentId}.`,
            counterpartyName:
              updatedShipment.shipperName ||
              updatedShipment.companyName ||
              null,
          }),
        });
      }
      try {
        window.dispatchEvent(new Event("carrierOffersUpdated"));
        window.dispatchEvent(new Event("shipperShipmentsUpdated"));
      } catch (e) {
        // ignore non-browser environments
      }
      return updatedShipment;
    } catch (error) {
      console.error("Failed to initiate payment:", error);
      throw error;
    }
  };

  const confirmPayment = async (shipmentId) => {
    try {
      const updatedShipment = await confirmPaymentApi(shipmentId);
      dispatch({ type: types.UPSERT_SHIPMENT, payload: updatedShipment });
      if (updatedShipment.shipperId) {
        dispatch({
          type: types.ADD_NOTIFICATION,
          payload: createNotification({
            userId: updatedShipment.shipperId,
            shipment: updatedShipment,
            type: "payment_confirmed",
            title: "Payment Confirmed",
            message: `Payment confirmed successfully for shipment ${shipmentId}.`,
          }),
        });
      }
      if (updatedShipment.assignedCarrierId) {
        dispatch({
          type: types.ADD_NOTIFICATION,
          payload: createNotification({
            userId: updatedShipment.assignedCarrierId,
            shipment: updatedShipment,
            type: "payment_confirmed",
            title: "Payment Confirmed",
            message: `Payment confirmed successfully for shipment ${shipmentId}.`,
            counterpartyName:
              updatedShipment.shipperName ||
              updatedShipment.companyName ||
              null,
          }),
        });
      }
      const normalizedStatus = (updatedShipment.status || "")
        .toString()
        .toUpperCase();
      if (normalizedStatus === "COMPLETED") {
        const completedNote = makeStatusNotification(
          updatedShipment,
          normalizedStatus,
        );
        if (updatedShipment.shipperId) {
          dispatch({
            type: types.ADD_NOTIFICATION,
            payload: createNotification({
              userId: updatedShipment.shipperId,
              shipment: updatedShipment,
              type: completedNote.type,
              title: completedNote.title,
              message: completedNote.message,
              counterpartyName: updatedShipment.assignedCarrierName || null,
            }),
          });
        }
        if (updatedShipment.assignedCarrierId) {
          dispatch({
            type: types.ADD_NOTIFICATION,
            payload: createNotification({
              userId: updatedShipment.assignedCarrierId,
              shipment: updatedShipment,
              type: completedNote.type,
              title: completedNote.title,
              message: completedNote.message,
              counterpartyName:
                updatedShipment.shipperName ||
                updatedShipment.companyName ||
                null,
            }),
          });
        }
      }
      try {
        window.dispatchEvent(new Event("carrierOffersUpdated"));
        window.dispatchEvent(new Event("shipperShipmentsUpdated"));
      } catch (e) {
        // ignore non-browser environments
      }
      return updatedShipment;
    } catch (error) {
      console.error("Failed to confirm payment:", error);
      throw error;
    }
  };

  const assignShipment = (shipmentId, carrierId, carrierName) => {
    dispatch({
      type: types.ASSIGN_SHIPMENT,
      payload: { shipmentId, carrierId, carrierName },
    });
    dispatch({
      type: types.ADD_NOTIFICATION,
      payload: createNotification({
        userId: carrierId,
        shipmentId,
        type: "shipment_assigned",
        title: "Shipment Assigned",
        message: `Shipment ${shipmentId} is now assigned to you.`,
        counterpartyName: carrierName,
      }),
    });
  };

  const addNotification = (note) => {
    dispatch({ type: types.ADD_NOTIFICATION, payload: note });
  };

  const verifyDelivery = (shipmentId) => {
    dispatch({ type: types.VERIFY_DELIVERY, payload: { shipmentId } });
    const shipment = (state.shipments || []).find((s) => s.id === shipmentId);
    if (shipment) {
      dispatch({
        type: types.ADD_NOTIFICATION,
        payload: createNotification({
          userId: shipment.shipperId,
          shipment,
          type: "delivery_verified",
          title: "Delivery Verified",
          message: `Delivery for shipment ${shipmentId} has been verified.`,
        }),
      });
      if (shipment.assignedCarrierId) {
        dispatch({
          type: types.ADD_NOTIFICATION,
          payload: createNotification({
            userId: shipment.assignedCarrierId,
            shipment,
            type: "delivery_verified",
            title: "Delivery Verified",
            message: `Shipment ${shipmentId} has been verified by the shipper.`,
          }),
        });
      }
    }
  };

  const recordPayment = (shipmentId) => {
    const shipment = (state.shipments || []).find((s) => s.id === shipmentId);
    dispatch({ type: types.RECORD_PAYMENT, payload: { shipmentId } });
    if (shipment) {
      dispatch({
        type: types.ADD_NOTIFICATION,
        payload: createNotification({
          userId: shipment.shipperId,
          shipment,
          type: "payment_recorded",
          title: "Payment Recorded",
          message: `Payment for shipment ${shipmentId} has been recorded.`,
        }),
      });
      if (shipment.assignedCarrierId) {
        dispatch({
          type: types.ADD_NOTIFICATION,
          payload: createNotification({
            userId: shipment.assignedCarrierId,
            shipment,
            type: "payment_recorded",
            title: "Payment Recorded",
            message: `Payment recorded for shipment ${shipmentId}.`,
          }),
        });
      }
    }
  };

  const markNotificationRead = (notificationId) => {
    dispatch({ type: types.MARK_NOTIFICATION_READ, payload: notificationId });
  };

  const markNotificationUnread = (notificationId) => {
    dispatch({ type: types.MARK_NOTIFICATION_UNREAD, payload: notificationId });
  };

  const deleteNotification = (notificationId) => {
    dispatch({ type: types.DELETE_NOTIFICATION, payload: notificationId });
  };

  const clearNotifications = () => {
    dispatch({ type: types.CLEAR_NOTIFICATIONS });
  };

  return (
    <ShipmentContext.Provider
      value={{
        state,
        dispatch,
        addShipment,
        createShipmentRequest,
        loadShipments,
        loadShipmentById,
        loadOffers,
        submitOffer,
        cancelOffer,
        assignCarrier,
        assignCarrierByCarrierId,
        updateOfferStatus,
        assignShipment,
        addNotification,
        updateShipmentStatus,
        initiatePayment,
        confirmPayment,
        verifyDelivery,
        recordPayment,
        markNotificationRead,
        markNotificationUnread,
        deleteNotification,
        clearNotifications,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
};
