import apiClient from "./apiClient";

const normalizeShipment = (shipment = {}) => {
  const normalized = {
    id: shipment.id,
    reference: shipment.reference || shipment.trackingNumber || null,
    status: shipment.status || null,
    origin: shipment.origin || null,
    destination: shipment.destination || null,
    createdAt: shipment.createdAt || shipment.created_at || null,
    updatedAt: shipment.updatedAt || shipment.updated_at || null,
    carrier: shipment.carrier || null,
    items: shipment.items || [],
    metadata: shipment.metadata || {},
    ...shipment,
  };

  return normalized;
};

const normalizeShipmentList = (payload) => {
  if (!Array.isArray(payload)) return [];
  return payload.map(normalizeShipment);
};

export const fetchActiveShipments = async (params = {}) => {
  const queryString = new URLSearchParams({
    status: "active",
    ...params,
  }).toString();
  const response = await apiClient.get(
    `/shipments${queryString ? `?${queryString}` : ""}`,
  );
  const data = response.data?.shipments ?? response.data;
  return normalizeShipmentList(data);
};

export const fetchShipmentDetails = async (shipmentId) => {
  const response = await apiClient.get(`/shipments/${shipmentId}`);
  const payload = response.data?.shipment ?? response.data;
  return normalizeShipment(payload);
};

export const fetchShipmentDashboardData = async () => {
  const response = await apiClient.get("/shipments/dashboard");
  const data = response.data ?? {};

  return {
    activeShipments: normalizeShipmentList(
      data.activeShipments ?? data.shipments ?? [],
    ),
    totals: {
      pending: data.totalPending ?? data.pendingCount ?? 0,
      delivered: data.totalDelivered ?? data.deliveredCount ?? 0,
      inTransit: data.inTransitCount ?? 0,
    },
    metadata: data.metadata ?? {},
  };
};
