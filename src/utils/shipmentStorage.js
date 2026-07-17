const STATE_KEY = "memi_shipment_state";
const SHIPMENTS_KEY = "memi_shipments";
const OFFERS_KEY = "memi_offers";
const NOTIFICATIONS_KEY = "memi_notifications";

const generateId = () =>
  window.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const normalizeShipment = (shipment) => ({
  ...shipment,
  status: (shipment.status || "PENDING").toString().toUpperCase(),
  createdAt: shipment.createdAt || new Date().toISOString(),
  updatedAt: shipment.updatedAt || new Date().toISOString(),
  assignedCarrierId: shipment.assignedCarrierId || null,
  assignedCarrierName: shipment.assignedCarrierName || null,
});

const normalizeOffer = (offer) => ({
  ...offer,
  offerStatus: (offer.offerStatus || offer.status || "PENDING")
    .toString()
    .toUpperCase(),
  createdAt: offer.createdAt || new Date().toISOString(),
});

const normalizeNotification = (note) => ({
  ...note,
  id: note.id || generateId(),
  createdAt: note.createdAt || new Date().toISOString(),
  read: note.read === true,
});

const getNotificationStorageKey = (userId, role) => {
  const uid = userId != null ? String(userId) : "anonymous";
  const userRole = role ? String(role).toUpperCase() : "UNKNOWN";
  return `${NOTIFICATIONS_KEY}_${userRole}_${uid}`;
};

export const loadShipmentState = () => null;

export const saveShipmentState = () => {};

export const loadStoredShipments = () => [];

export const saveStoredShipments = () => {};

export const loadStoredOffers = () => [];

export const saveStoredOffers = () => {};

export const loadStoredNotifications = (userId, role) => {
  if (!userId) return [];
  const storageKey = getNotificationStorageKey(userId, role);
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeNotification) : [];
  } catch (e) {
    return [];
  }
};

export const saveStoredNotifications = (userId, role, notifications) => {
  if (!userId) return;
  const storageKey = getNotificationStorageKey(userId, role);
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(
        Array.isArray(notifications)
          ? notifications.map(normalizeNotification)
          : [],
      ),
    );
  } catch (e) {
    // ignore storage errors
  }
};

export const createShipmentRecord = (payload) => ({
  id: generateId(),
  status:
    payload && typeof payload.status === "string"
      ? payload.status.toUpperCase()
      : "PENDING",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...payload,
});

export const generateOfferId = () => generateId();

export const createOfferRecord = ({
  shipmentId,
  carrierId,
  carrierName,
  price,
}) => ({
  id: generateOfferId(),
  shipmentId,
  carrierId,
  carrierName,
  offerPrice: Number(price),
  offerStatus: "PENDING",
  createdAt: new Date().toISOString(),
});

const SUBMITTED_KEY = "memi_offers_submitted";

export const markOfferAsSubmitted = (shipmentId, carrierId) => {
  try {
    const raw = window.localStorage.getItem(SUBMITTED_KEY) || "{}";
    const map = JSON.parse(raw || "{}") || {};
    map[shipmentId] = String(carrierId);
    window.localStorage.setItem(SUBMITTED_KEY, JSON.stringify(map));
  } catch (e) {
    // ignore storage errors
  }
};

export const hasSubmittedOffer = (shipmentId, carrierId) => {
  try {
    const raw = window.localStorage.getItem(SUBMITTED_KEY) || "{}";
    const map = JSON.parse(raw || "{}") || {};
    return String(map[shipmentId]) === String(carrierId);
  } catch (e) {
    return false;
  }
};
