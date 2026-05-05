const STORAGE_KEY = "memi_shipments";

const generateId = () =>
  window.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

export const loadStoredShipments = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredShipments = (shipments) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shipments));
  } catch {
    // Ignore storage failures in the temporary client store.
  }
};

export const createShipmentRecord = (payload) => ({
  id: generateId(),
  status: "pending",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...payload,
});
